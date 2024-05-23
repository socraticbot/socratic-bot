"""Provide common utilites used for conversation."""

from typing import List

from pydantic import BaseModel


class Message(BaseModel):
    """Represents a message in the conversation."""

    is_assistant: bool
    message: str


class MessageFormatter:
    """Format conversation messages."""

    human_name: str
    assistant_name: str

    def __init__(self, human_name: str, assistant_name: str) -> None:
        self.human_name = human_name
        self.assistant_name = assistant_name

    def __call__(self, messages: List[Message]) -> str:
        """Turn a list of messages into string."""
        formatted_messages = []
        for message in messages:
            role = self.assistant_name if message.is_assistant else self.human_name
            formatted_messages.append(f"{role}: {message.message}\n")
        return "".join(formatted_messages)
