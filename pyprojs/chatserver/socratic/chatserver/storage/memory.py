from uuid import UUID

from fastapi import HTTPException
from lru import LRU

from socratic.chatserver.storage.base import ConversationForest, MessagePack, Repository


class InMemoryRepository(Repository):
    forests: LRU

    def __init__(self):
        self.forests = LRU(150)

    def add_forest(self, forest: ConversationForest):
        self.forests[forest.id] = forest

    def add_message(self, conversation_id: UUID, message: MessagePack):
        forest = self.forest_with_id(conversation_id)
        forest.messages.append(message)
        forest.messages.sort(key=lambda x: x.timestamp)

    def forest_with_id(self, conversation_id: UUID) -> ConversationForest:
        forest = self.forests.get(conversation_id, None)
        if forest:
            return forest
        raise HTTPException(status_code=404, detail=f"Unknown conversation {conversation_id}.")
