"""Provides ContinuousExecutor."""

from asyncio import create_task
from contextlib import ExitStack
from typing import Any
from typing import Optional

from aiochannel import Channel
from aiochannel import ChannelClosed

from .conversation_model import ConversationModel
from .interface import with_get_user_reply
from .interface import with_post_assistant_reply


class ContinuousExecutor:
    """
    Manages the continuous execution of a conversation model.

    This class acts as an asynchronous context manager that takes a conversation model and
    its associated input to start a conversation. It asynchronously runs the model and provides
    the generated assistant messages through the  `assistant_messages` method. The context manager
    should be used to properly initiate and handle the conversation lifecycle.
    """

    _assistant_message_channel: Channel[str]
    _user_message_channel: Channel[str]
    _stack: ExitStack

    _model: ConversationModel
    _input: dict[str, Any]
    _has_ended = False
    _output: Optional[Any]

    def __init__(self, model: ConversationModel, args: dict[str, Any]):
        self._assistant_message_channel = Channel()
        self._user_message_channel = Channel()
        self._stack = ExitStack()

        self._model = model
        self._input = args

        self._output = None

    async def __aenter__(self):
        async def get_user_reply() -> str:
            return await self._user_message_channel.get()

        async def post_assistant_reply(message: str):
            await self._assistant_message_channel.put(message)

        self._stack.enter_context(with_get_user_reply(get_user_reply))
        self._stack.enter_context(with_post_assistant_reply(post_assistant_reply))

        async def task():
            result = await self._model.run(**self._input)
            self._has_ended = True
            self._output = result

        create_task(task())
        return self

    async def __aexit__(self, exc_type, exc, tb):
        self._stack.close()
        self._assistant_message_channel.close()
        self._user_message_channel.close()

    def __aiter__(self):
        return self

    async def __anext__(self) -> str:
        return await self._assistant_message_channel.get()

    @property
    def has_ended(self) -> bool:
        """
        Indicates if the conversation has concluded.

        A conversation model may end with either a user message or an assistant one. In an async
        for-loop, one can use this property to evaluate if further user input is needed.
        """
        return self._has_ended

    async def assistant_messages(self):
        """
        Asynchronously yields assistant messages as they are produced.
        """
        try:
            while not self.has_ended:
                yield await self._assistant_message_channel.get()
        except ChannelClosed:
            return

    async def post_reply(self, message: str):
        """
        Posts a user reply to the conversation.
        """
        await self._user_message_channel.put(message)

    def get_result(self):
        """
        Retrieves the final output after the conversation has ended.

        This method should be called only after the conversation is complete, as indicated
        by the `has_ended` property.
        """
        assert self.has_ended
        return self._output
