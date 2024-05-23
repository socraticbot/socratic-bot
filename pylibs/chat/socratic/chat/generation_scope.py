"""Provides generation scope related API."""

from contextlib import contextmanager
from contextvars import ContextVar
from typing import Iterator
from typing import Optional
from uuid import UUID
from uuid import uuid4

CallStackNode = UUID | int


class GenerationScope:
    """Manages a GenerationScope."""

    scope_id: UUID
    call_stack: list[int]
    next_counter: int

    def __init__(self, scope_id: UUID):
        self.scope_id = scope_id
        self.call_stack = []
        self.next_counter = 0

    @property
    def current_call_id(self) -> str:
        """Returns the current call id."""
        componenets = [str(self.scope_id)] + [str(x) for x in self.call_stack]
        return "/".join(componenets)

    def push_call(self):
        """Enters a new call."""
        self.call_stack.append(self.next_counter)
        self.next_counter = 0

    def pop_call(self):
        """Leaves the current call."""
        current_counter = self.call_stack.pop()
        self.next_counter = current_counter + 1


_generation_scope_var = ContextVar[Optional[GenerationScope]]("_generation_scope", default=None)


def new_generation_scope(scope_id: Optional[UUID] = None):
    """Creates a new generation scope."""
    if scope_id is None:
        scope_id = uuid4()
    scope = GenerationScope(scope_id)
    _generation_scope_var.set(scope)


def reset_generation_scope():
    """Resets generation_scope."""
    _generation_scope_var.set(None)


def push_call():
    """Enters a new call."""
    scope = _generation_scope_var.get()
    if scope is None:
        return
    scope.push_call()


def current_call_id() -> str:
    """Returns the current call id."""
    scope = _generation_scope_var.get()
    assert scope is not None
    return scope.current_call_id


def pop_call():
    """Leaves the current call."""
    scope = _generation_scope_var.get()
    if scope is None:
        return
    scope.pop_call()


@contextmanager
def with_new_call() -> Iterator[None]:
    """Enters a new call and returns automatically."""
    push_call()
    yield
    pop_call()
