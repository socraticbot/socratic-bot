"""Provides command steprun."""

from asyncio import run

from ..conversation_model import ConversationModel
from ..step_executor import StepExecutor


async def _steprun_model(model: ConversationModel):
    executor = StepExecutor(model, [], [], {})

    while True:
        message = await executor.run()
        print(f"Assistant: {message}")
        if executor.has_ended:
            break
        user_reply = input("User: ")
        executor.chat_history.append(user_reply)


def steprun_model(model: ConversationModel):
    """
    Runs the conversation model via step.
    """
    run(_steprun_model(model))
