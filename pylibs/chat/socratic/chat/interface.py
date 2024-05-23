"""Provides an interface for conversation models to post/receive messages."""

from contextlib import contextmanager
from contextvars import ContextVar
from typing import Awaitable
from typing import Callable
from typing import Iterator

_get_user_reply_var = ContextVar[Callable[[], Awaitable[str]]]("_get_user_reply")


@contextmanager
def with_get_user_reply(impl: Callable[[], Awaitable[str]]) -> Iterator[None]:
    """
    Temporarily injects a custom implementation for fetching user replies.

    Args:
        impl: The implementation to be injected.

    Yields:
        None
    """

    saved_token = _get_user_reply_var.set(impl)
    try:
        yield
    finally:
        _get_user_reply_var.reset(saved_token)


async def get_user_reply() -> str:
    """
    Fetches the next user reply.

    Returns:
        The next user reply.
    """
    impl = _get_user_reply_var.get()
    return await impl()


_post_assistant_reply_var = ContextVar[Callable[[str], Awaitable[None]]]("_post_assistant_reply")


@contextmanager
def with_post_assistant_reply(impl: Callable[[str], Awaitable[None]]) -> Iterator[None]:
    """
    Temporarily injects a custom implementation for posting an assistant reply.

    Args:
        impl: The implementation to be injected.

    Yields:
        None
    """
    saved_token = _post_assistant_reply_var.set(impl)
    try:
        yield
    finally:
        _post_assistant_reply_var.reset(saved_token)


async def post_assistant_reply(message: str):
    """
    Post the next assistant reply.

    Args:
        message: The assistant reply.
    """
    impl = _post_assistant_reply_var.get()
    await impl(message)
