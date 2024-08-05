import dataclasses
import datetime
import json
import os
from typing import List, Optional
from uuid import UUID

from fastapi import HTTPException

from sqlalchemy import create_engine
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

from socratic.chat.schemas import Message
from socratic.chatserver.storage.base import ConversationForest, MessagePack, Repository

Base = declarative_base()


class ConversationModel(Base):
    __tablename__ = "conversation"

    id = Column(PostgresUUID, primary_key=True)
    name = Column(String, nullable=False)
    input_params = Column(JSON, nullable=False)
    created_at = Column(DateTime, nullable=False)

    messages = relationship("ConversationMessageModel", back_populates="conversation")


class ConversationMessageModel(Base):
    __tablename__ = "conversation_message"

    id = Column(PostgresUUID, primary_key=True)
    conversation_id = Column(PostgresUUID, ForeignKey("conversation.id"), nullable=False)

    message = Column(String, nullable=False)
    is_assistant = Column(Boolean, nullable=False)
    is_done = Column(Boolean, nullable=False)
    workflow_results = Column(JSON, nullable=False)
    parent_id = Column(PostgresUUID, ForeignKey("conversation_message.id"))

    created_at = Column(DateTime, nullable=False)

    conversation = relationship("ConversationModel", back_populates="messages")


engine = None
SessionLocal = None


def setup_postgres(connection_string: str):
    global engine
    global SessionLocal

    if not engine:
        engine = create_engine(connection_string)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        Base.metadata.create_all(bind=engine)


class PostgresRepository(Repository):
    def __init__(self):
        self.db = SessionLocal()

    def add_forest(self, forest: ConversationForest):
        model = ConversationModel(
            id=forest.id,
            name=forest.name,
            input_params=forest.input_params,
            created_at=datetime.datetime.now(),
        )
        self.db.add(model)
        self.db.commit()

    def add_message(self, conversation_id: UUID, message: MessagePack):
        model = ConversationMessageModel(
            id=message.id,
            conversation_id=conversation_id,
            message=message.message.message,
            is_assistant=message.message.is_assistant,
            is_done=message.is_done,
            parent_id=message.parent_id,
            workflow_results=message.workflow_results,
            created_at=datetime.datetime.fromtimestamp(message.timestamp),
        )
        self.db.add(model)
        self.db.commit()

    def close(self):
        self.db.close()

    def forest_with_id(self, conversation_id: UUID) -> ConversationForest:
        model = (
            self.db.query(ConversationModel).filter(ConversationModel.id == conversation_id).first()
        )
        if not model:
            raise HTTPException(status_code=404, detail=f"Unknown conversation {conversation_id}.")

        forest = ConversationForest(id=model.id, name=model.name, input_params=model.input_params)

        for msg in (
            self.db.query(ConversationMessageModel)
            .filter(ConversationMessageModel.conversation_id == conversation_id)
            .order_by(ConversationMessageModel.created_at.asc())
            .all()
        ):
            forest.messages.append(
                MessagePack(
                    id=msg.id,
                    is_done=msg.is_done,
                    message=Message(is_assistant=msg.is_assistant, message=msg.message),
                    parent_id=msg.parent_id,
                    workflow_results=msg.workflow_results,
                    timestamp=msg.created_at.timestamp(),
                )
            )

        return forest
