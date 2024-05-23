"""Provides ConversationModel."""

from contextvars import ContextVar
from dataclasses import dataclass
from functools import wraps
from inspect import cleandoc
from inspect import iscoroutinefunction
from typing import Any
from typing import Awaitable
from typing import Callable
from typing import Generic
from typing import Optional
from typing import TypeVar
from typing import get_type_hints

from pydantic import BaseModel

from .utils.typing import is_json_safe
from .utils.typing import request_model_from_function
from .workflow_model import WorkflowModel


class ChainDefinitionError(Exception):
    """Indicates the chain definition is problematic."""


class ChainDefinition:
    """Describes a chain."""

    workflow_model: WorkflowModel

    def __init__(self, workflow_model: WorkflowModel):
        self.workflow_model = workflow_model


@dataclass
class EntryDefinition:
    """Describes an entry point."""

    docstring: str
    request_model: type[BaseModel]


ConfigT = TypeVar("ConfigT")

_model_config_var = ContextVar("_model_config")


class ConversationModel(Generic[ConfigT]):
    """
    Used to define a conversation model.

    - First, do model = ConversationModel() to get an instance.
    - Use @model.chain to define a new LLM workflow.
    - Use @model.main to define the entry point for the model.
    """

    name: str
    create_config: Callable[[], ConfigT]
    definitions: list[ChainDefinition]

    _entry_definition: Optional[EntryDefinition] = None
    _entry_func: Optional[Callable[[], Awaitable[None]]] = None

    def __init__(self, name: str, create_config: Callable[[], ConfigT]) -> None:
        self.name = name
        self.create_config = create_config
        self.definitions = []

    def _analyze_input(self, func, unit: str) -> tuple[type[BaseModel], str]:
        if not iscoroutinefunction(func):
            raise ChainDefinitionError(f"A {unit} must be async.")

        if func.__doc__ is None:
            raise ChainDefinitionError(f"A {unit} must have accompanying docstring.")

        request_model = request_model_from_function(func)
        return request_model, cleandoc(func.__doc__)

    def _analyze_output(self, func, unit: str) -> Any:
        type_hints = get_type_hints(func)
        return_type = type_hints["return"]
        if return_type is None:
            raise ChainDefinitionError(f"A {unit} must have return type annotation.")
        if not is_json_safe(return_type):
            raise ChainDefinitionError(f'The return type of a {unit} must be a "BaseModel".')
        return return_type

    @property
    def config(self) -> ConfigT:
        """Returns the current model config. Only use inside a conversation model."""
        return _model_config_var.get()

    def chain(self, func):
        """
        A decorator for defining a chain.
        """

        workflow = WorkflowModel(func)
        definition = ChainDefinition(workflow_model=workflow)
        self.definitions.append(definition)

        @wraps(func)
        def wrapper(*args, **kwargs):
            return workflow.call(*args, **kwargs)

        @wraps(func)
        async def awrapper(*args, **kwargs):
            return await workflow.async_call(*args, **kwargs)

        if workflow.is_async:
            return awrapper
        return wrapper

    def entry(self, func):
        """
        A decorator for defining the entry point.
        """
        assert self._entry_func is None

        request_model, doc = self._analyze_input(func, "entry")
        self._entry_definition = EntryDefinition(doc, request_model)

        @wraps(func)
        async def wrapper(*args, **kwargs):
            _model_config_var.set(self.create_config())
            try:
                result = await func(*args, **kwargs)
                return result
            finally:
                _model_config_var.set(None)

        self._entry_func = wrapper
        return wrapper

    async def run(self, *args, **kwargs):
        """
        Runs the conversation model.
        """
        assert self._entry_func is not None
        return await self._entry_func(*args, **kwargs)
