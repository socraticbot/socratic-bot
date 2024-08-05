import os

from socratic.chatserver.storage.base import ConversationForest, MessagePack, Repository
from socratic.chatserver.storage.memory import InMemoryRepository
from socratic.chatserver.storage.postgres import setup_postgres, PostgresRepository


memory_repo = InMemoryRepository()


def get_repository() -> Repository:
    db_connection_url = os.getenv("SQLALCHEMY_DATABASE_URI")
    if db_connection_url:
        try:
            setup_postgres(db_connection_url)
            repo = PostgresRepository()
            yield repo
        finally:
            repo.close()
        return

    yield memory_repo
