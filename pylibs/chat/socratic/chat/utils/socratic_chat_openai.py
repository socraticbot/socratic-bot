"""Provides SocraticChatOpenAI."""

import os
from typing import Any
from typing import Optional
from typing import TypeVar
from typing import cast
from uuid import uuid4

from langchain.callbacks.manager import AsyncCallbackManagerForLLMRun
from langchain.callbacks import PromptLayerCallbackHandler
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import BaseMessage
from langchain.schema.output import ChatResult
from langchain.schema.output_parser import StrOutputParser
from pydantic import BaseModel

try:
    import promptlayer

    promptlayer.api_key = os.getenv("PROMPTLAYER_API_KEY")
except ImportError:
    promptlayer = None

from ..event_logging import Event
from ..event_logging import EventPhase
from ..event_logging import event_model
from ..event_logging import log_event


@event_model("chatgpt_call_start", phase=EventPhase.START)
class ChatGPTCallStartEvent(Event):
    """
    An event to track the start of a ChatGPT call.
    """

    llm_model_name: str
    llm_model_kwargs: dict[str, Any]
    llm_input: list

    def ignored_fields_for_str(self) -> list[str]:
        return super().ignored_fields_for_str() + ["llm_input"]


class ChatGPTTokenUsage(BaseModel):
    """
    Tracks token usage for ChatGPT call.
    """

    completion_tokens: int
    prompt_tokens: int
    total_tokens: int


@event_model("chatgpt_call_end", phase=EventPhase.END)
class ChatGPTCallEndEvent(Event):
    """
    An event to track the end of a ChatGPT call.
    """

    # renamed to make Pydantic happy
    llm_model_name: str
    token_usage: ChatGPTTokenUsage
    system_fingerprint: Optional[str] = None
    llm_output: list

    def ignored_fields_for_str(self) -> list[str]:
        return super().ignored_fields_for_str() + ["llm_output"]


class SocraticChatOpenAI(ChatOpenAI):
    """A ChatOpenAI wrapper that logs token and time usage."""

    @classmethod
    def is_lc_serializable(cls) -> bool:
        return False

    async def _agenerate(
        self,
        messages: list[BaseMessage],
        stop: Optional[list[str]] = None,
        run_manager: Optional[AsyncCallbackManagerForLLMRun] = None,
        stream: Optional[bool] = None,
        **kwargs: Any,
    ) -> ChatResult:
        """Call ChatOpenAI agenerate."""
        call_id = uuid4()
        log_event(
            ChatGPTCallStartEvent(
                id=str(call_id),
                llm_model_name=self.model_name,
                llm_model_kwargs=self.model_kwargs,
                llm_input=[x.dict() for x in messages],
            )
        )

        generated_responses = await super()._agenerate(
            messages, stop, run_manager, stream=stream, **kwargs
        )
        chatgpt_output = cast(dict[str, Any], generated_responses.llm_output)
        log_event(
            ChatGPTCallEndEvent(
                id=str(call_id),
                llm_model_name=self.model_name,
                llm_output=[x.message.dict() for x in generated_responses.generations],
                **chatgpt_output,
            )
        )

        return generated_responses

    @property
    def _llm_type(self) -> str:
        return "socratic-openai-chat"

    @property
    def _identifying_params(self) -> dict[str, Any]:
        return {**super()._identifying_params}


T = TypeVar("T", bound=BaseModel)


class SocraticChatModel:
    """A convenient wrapper for both string and json output"""

    model: str
    _to_string = StrOutputParser()

    def __init__(self, model: str = "gpt-4-turbo-preview") -> None:
        self.model = model

    def _get_callbacks(self):
        callbacks = []
        if promptlayer.api_key:
            callbacks.append(PromptLayerCallbackHandler())

        return callbacks

    async def gen_string(self, prompt: ChatPromptTemplate, **kwargs) -> str:
        """Generate a string."""
        chat_model = SocraticChatOpenAI(model=self.model, callbacks=self._get_callbacks())
        chain = prompt | chat_model | self._to_string
        chain_output = await chain.ainvoke(input=kwargs)
        assert isinstance(chain_output, str)
        return chain_output

    async def gen_json(self, prompt: ChatPromptTemplate, model_cls: type[T], **kwargs) -> T:
        """Generate a JSON."""
        chat_model = SocraticChatOpenAI(
            model=self.model,
            model_kwargs={"response_format": {"type": "json_object"}},
            callbacks=self._get_callbacks(),
        )
        chain = prompt | chat_model | self._to_string
        chain_output = await chain.ainvoke(input=kwargs)
        assert isinstance(chain_output, str)
        try:
            parsed_result = model_cls.model_validate_json(chain_output)
            return parsed_result
        except Exception as exc:
            print("An error occured when parsing. Raw output:")
            print(chain_output)
            raise exc
