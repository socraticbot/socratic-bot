from functools import wraps
from typing import Any
from typing import Optional

from socratic.chat.workflow_model import WorkflowModel


def build_args_dict(func):
    model = WorkflowModel(func)

    @wraps(func)
    def work(*args, **kwargs) -> dict[str, Any]:
        return model.build_input_request(args, kwargs).model_dump()

    return work


@build_args_dict
def fn_basic(a: int, b: int) -> int:
    return a + b


@build_args_dict
def fn_default(a: int = 1, b: Optional[int] = None) -> int:
    return a + (b if b is not None else 0)


def test_argmatch():
    result = fn_basic(1, 2)
    assert result == {"a": 1, "b": 2}
    result = fn_basic(1, b=2)
    assert result == {"a": 1, "b": 2}
    result = fn_basic(b=2, a=1)
    assert result == {"a": 1, "b": 2}
    result = fn_default(a=1)
    assert result == {"a": 1, "b": None}
    result = fn_default(b=2)
    assert result == {"a": 1, "b": 2}
