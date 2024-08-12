from dataclasses import dataclass
from typing import Any, Optional
from uuid import uuid4, UUID

from socratic.chat.schemas import Message


@dataclass
class MessagePack:
    id: UUID
    timestamp: float
    message: Message
    workflow_results: dict[str, Any]
    is_done: bool
    parent_id: Optional[UUID] = None

    def copy(self):
        return MessagePack(
            uuid4(),
            self.timestamp,
            self.message,
            self.workflow_results.copy(),
            self.is_done,
            self.parent_id,
        )


class ConversationForest:
    id: UUID
    name: str
    input_params: dict[str, Any]
    messages: list[MessagePack]

    def __init__(
        self,
        name: str,
        input_params: dict[str, Any],
        id: Optional[UUID] = None,
        messages: Optional[list[MessagePack]] = None,
    ):
        self.id = id or uuid4()
        self.name = name
        self.input_params = input_params
        self.messages = messages or []

    def message_with_id(self, message_id: UUID) -> MessagePack:
        """
        Returns a message pack with the given ID.
        """
        for message in self.messages:
            if message.id == message_id:
                return message
        raise HTTPException(status_code=404, detail=f"Unknown message {message_id}.")

    def message_list_with_id(self, last_message_id: Optional[UUID]) -> list[MessagePack]:
        """
        Returns a list of messages ending with the specified message.
        """
        if last_message_id is None:
            assistant_messages = [x for x in self.messages if x.message.is_assistant]
            last_message_id = assistant_messages[-1].id
        current = self.message_with_id(last_message_id)
        messages: list[MessagePack] = [current]
        while current.parent_id is not None:
            current = self.message_with_id(current.parent_id)
            messages.append(current)
        messages.reverse()
        return messages


class Repository:
    def add_forest(self, forest: ConversationForest):
        """
        Adds a conversation.
        """
        raise NotImplementedError

    def add_message(self, conversation_id: UUID, message: MessagePack):
        """
        Adds a message to a conversation.
        """
        raise NotImplementedError

    def forest_with_id(self, conversation_id: UUID) -> ConversationForest:
        """
        Returns a conversation with the given ID.
        """
        raise NotImplementedError
