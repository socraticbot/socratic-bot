"""FastAPI app."""

from dataclasses import dataclass
import json
import os
from time import time
from typing import Annotated
from typing import Any
from typing import Optional
from uuid import UUID
from uuid import uuid4

from fastapi import Depends
from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from fastapi.security import HTTPBearer
from lru import LRU
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware

from socratic.chat import StepExecutor
from socratic.chat.conversation_model import ConversationModel
from socratic.chat.schemas import Message
from socratic.chatserver.storage import get_repository, ConversationForest, MessagePack
from socratic.zoo import dfs_v1
from socratic.zoo import dfs_v2

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


security = HTTPBearer()

TOKEN = os.environ.get("SOCRATIC_CHATSERVER_TOKEN", None)
if not TOKEN:
    raise RuntimeError("SOCRATIC_CHATSERVER_TOKEN environment variable must be set.")

if not os.environ.get("OPENAI_API_KEY", None):
    raise RuntimeError("OPENAI_API_KEY environment variable must be set.")


def check_token(credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]):
    """
    Check Bearer credentials.
    """
    if credentials.scheme != "Bearer":
        raise HTTPException(403)
    if credentials.credentials != TOKEN:
        raise HTTPException(403)


@app.get("/")
async def read_root():
    """
    Root of the web server for health check.
    """
    return "It deploys!"


class CreateConversationRequest(BaseModel):
    """
    Request to create a new conversation.
    """

    name: str
    request: dict[str, Any]


def _resolve_model(name: str) -> ConversationModel[Any]:
    if name == "dfs_v1":
        return dfs_v1.model
    if name == "dfs_v2":
        return dfs_v2.model
    raise HTTPException(status_code=400, detail=f"Unknown model {name}.")


def _resolve_request(
    request: CreateConversationRequest,
) -> tuple[ConversationModel[Any], dict[str, Any]]:
    model = _resolve_model(request.name)
    return (model, request.request)


class CreateConversationResponse(BaseModel):
    """
    Response to a conversation creation request.
    """

    conversation_id: UUID
    message_id: UUID
    message: str


initial_message_memo = LRU(20)


@app.post("/new", dependencies=[Depends(check_token)])
async def create_conversation(
    request: CreateConversationRequest, repo=Depends(get_repository)
) -> CreateConversationResponse:
    """
    Create a new conversation.
    """
    model, input_params = _resolve_request(request)

    # Re-use the same opening message for the same input parameters to save cost.
    cache_key = f"{model}:{json.dumps(input_params)}"
    if cache_key in initial_message_memo:
        initial_message = initial_message_memo[cache_key].copy()
    else:
        executor = StepExecutor(model, [], [], {})
        initial_message_id = executor.next_scope_id
        assistant_reply = await executor.run(**input_params)
        initial_message = MessagePack(
            initial_message_id,
            time(),
            Message(is_assistant=True, message=assistant_reply),
            executor.workflow_results.copy(),
            False,
        )
        initial_message_memo[cache_key] = initial_message

    forest = ConversationForest(request.name, input_params)
    repo.add_forest(forest)
    repo.add_message(forest.id, initial_message)

    return CreateConversationResponse(
        conversation_id=forest.id,
        message_id=initial_message.id,
        message=initial_message.message.message,
    )


class ReplyConversationRequest(BaseModel):
    """
    Request for a user reply to a conversation.
    """

    conversation_id: UUID
    message_id: Optional[UUID] = None
    message: str


class ReplyConversationResponse(BaseModel):
    """
    Response for a user reply.
    """

    id: UUID
    message: str


@app.post("/reply", dependencies=[Depends(check_token)])
async def reply_conversation(
    request: ReplyConversationRequest, repo=Depends(get_repository)
) -> ReplyConversationResponse:
    """
    Add a user reply to a conversation.
    """
    forest = repo.forest_with_id(request.conversation_id)
    model = _resolve_model(forest.name)
    messages = forest.message_list_with_id(request.message_id)
    parent = messages[-1]

    if not parent.message.is_assistant:
        raise HTTPException(status_code=400, detail="Must reply to an assistant message.")
    if parent.is_done:
        raise HTTPException(status_code=400, detail="Cannot reply to a complete conversation.")

    parent = MessagePack(
        uuid4(), time(), Message(is_assistant=False, message=request.message), {}, False, parent.id
    )
    messages.append(parent)
    repo.add_message(forest.id, parent)

    scope_ids = [x.id for x in messages if x.message.is_assistant]
    chat_history = [x.message.message for x in messages]
    workflow_results: dict[str, Any] = {}
    for message in messages:
        if not message.message.is_assistant:
            continue
        for k, v in message.workflow_results.items():
            workflow_results[k] = v

    executor = StepExecutor(
        model, scope_ids=scope_ids, chat_history=chat_history, workflow_results=workflow_results
    )
    next_scope_id = executor.next_scope_id
    await executor.run(**forest.input_params)

    new_workflow_results = {
        k: v for k, v in executor.workflow_results.items() if k.startswith(str(next_scope_id))
    }

    message_pack = MessagePack(
        next_scope_id,
        time(),
        Message(is_assistant=True, message=executor.chat_history[-1]),
        new_workflow_results,
        executor.has_ended,
        parent.id,
    )
    repo.add_message(forest.id, message_pack)
    return ReplyConversationResponse(id=message_pack.id, message=message_pack.message.message)
