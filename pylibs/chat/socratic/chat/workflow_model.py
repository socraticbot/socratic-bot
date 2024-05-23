"""Provides WorkflowModel."""

from contextlib import contextmanager
from contextvars import ContextVar
from inspect import Parameter
from inspect import cleandoc
from inspect import iscoroutinefunction
from inspect import signature
from typing import Any
from typing import Callable
from typing import Iterator

from pydantic import BaseModel

from socratic.chat.generation_scope import with_new_call
from socratic.chat.utils.typing import dump_value
from socratic.chat.utils.typing import get_return_type
from socratic.chat.utils.typing import parse_value
from socratic.chat.utils.typing import request_model_from_function

_get_workflow_cache_var = ContextVar[Callable[[], tuple[bool, Any]]](
    "_get_workflow_cache", default=lambda: (False, None)
)


@contextmanager
def with_get_workflow_cache(impl: Callable[[], tuple[bool, Any]]) -> Iterator[None]:
    """
    Temporarily injects a custom implementation for fetching workflow cache.

    Args:
        impl: The implementation to be injected.

    Yields:
        None
    """

    saved_token = _get_workflow_cache_var.set(impl)
    try:
        yield
    finally:
        _get_workflow_cache_var.reset(saved_token)


def _get_workflow_cache() -> tuple[bool, Any]:
    impl = _get_workflow_cache_var.get()
    return impl()


_on_workflow_done_var = ContextVar[Callable[["WorkflowModel", BaseModel, Any], None]](
    "_on_workflow_done", default=lambda _1, _2, _3: None
)


@contextmanager
def with_on_workflow_done(
    impl: Callable[["WorkflowModel", BaseModel, Any], None]
) -> Iterator[None]:
    """
    Temporarily injects a custom implementation called when a workflow completes.

    Args:
        impl: The implementation to be injected.

    Yields:
        None
    """

    saved_token = _on_workflow_done_var.set(impl)
    try:
        yield
    finally:
        _on_workflow_done_var.reset(saved_token)


def _on_workflow_done(workflow: "WorkflowModel", input_request: BaseModel, result: Any):
    impl = _on_workflow_done_var.get()
    if impl is None:
        return
    impl(workflow, input_request, dump_value(workflow.return_type, result))


class WorkflowModel:
    """Represents a workflow."""

    func: Callable
    name: str
    doc: str
    request_model: type[BaseModel]
    return_type: Any

    _params: list[Parameter]

    def __init__(self, func: Callable):
        self.func = func

        self.name = func.__name__
        if func.__doc__ is None:
            self.doc = ""
        else:
            self.doc = cleandoc(func.__doc__)

        sig = signature(func)
        self._params = list(sig.parameters.values())

        self.request_model = request_model_from_function(func)
        self.return_type = get_return_type(func)

    @property
    def is_async(self) -> bool:
        """
        Returns whether this workflow is async.
        """
        return iscoroutinefunction(self.func)

    def call(self, *args, **kwargs) -> Any:
        """
        Calls the workflow synchronously.
        """
        assert not self.is_async

        with with_new_call():
            fetched, result = _get_workflow_cache()
            if fetched:
                return parse_value(self.return_type, result)
            result = self.func(*args, **kwargs)
            _on_workflow_done(self, self.build_input_request(args, kwargs), result)
            return result

    async def async_call(self, *args, **kwargs) -> Any:
        """
        Calls the workflow asynchronously.
        """
        assert self.is_async

        with with_new_call():
            fetched, result = _get_workflow_cache()
            if fetched:
                return parse_value(self.return_type, result)
            result = await self.func(*args, **kwargs)
            _on_workflow_done(self, self.build_input_request(args, kwargs), result)
            return result

    def _match_arg(self, args: tuple[Any], kwargs: dict[str, Any]) -> dict[str, Any]:
        kwargs = kwargs.copy()
        for param, arg in zip(self._params, args):
            kwargs[param.name] = arg
        for param in self._params:
            if param.default is param.empty:
                continue
            if param.name in kwargs:
                continue
            kwargs[param.name] = param.default
        return kwargs

    def build_input_request(self, args: tuple[Any], kwargs: dict[str, Any]) -> BaseModel:
        """
        Constructs an input request model from args and kwargs.
        """
        input_data = self._match_arg(args, kwargs)
        return self.request_model(**input_data)
