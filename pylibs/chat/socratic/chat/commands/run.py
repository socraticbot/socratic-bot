"""Provides command autorun and run."""

from asyncio import run

from langchain.chat_models import ChatOpenAI
from langchain.schema import AIMessage
from langchain.schema import BaseMessage
from langchain.schema import HumanMessage
from langchain.schema import SystemMessage

from ..continuous_executor import ContinuousExecutor
from ..conversation_model import ConversationModel


async def _run_model(model: ConversationModel, unknown_args: dict):
    async with ContinuousExecutor(model, unknown_args) as executor:
        async for assistant_reply in executor.assistant_messages():
            print(f"Assistant: {assistant_reply}")
            if executor.has_ended:
                break
            user_reply = input("User: ")
            await executor.post_reply(user_reply)


def run_model(model: ConversationModel, unknown_args: dict):
    """
    Starts the conversation model interactively.
    """
    run(_run_model(model, unknown_args))


async def _autorun_model(model: ConversationModel, unknown_args: dict):
    user_bot = ChatOpenAI(model="gpt-3.5-turbo")

    history: list[BaseMessage] = [
        SystemMessage(content="You are a helpful AI assistant. Answer concisely.")
    ]

    async with ContinuousExecutor(model, unknown_args) as executor:
        async for assistant_reply in executor.assistant_messages():
            print(f"Assistant: {assistant_reply}")
            history.append(HumanMessage(content=assistant_reply))
            if executor.has_ended:
                break

            user_output = await user_bot.ainvoke(history)
            assert isinstance(user_output.content, str)
            user_reply = user_output.content
            print(f"User: {user_reply}\n")
            history.append(AIMessage(content=user_reply))
            await executor.post_reply(user_reply)


def autorun_model(model: ConversationModel, unknown_args: dict):
    """
    Runs the conversation model automatically.
    """
    run(_autorun_model(model, unknown_args))
