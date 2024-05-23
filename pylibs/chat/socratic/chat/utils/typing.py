"""Provide helpers for typing."""

from enum import Enum
from inspect import signature
from types import UnionType
from typing import Any
from typing import Callable
from typing import Dict
from typing import List
from typing import Union
from typing import get_args
from typing import get_origin
from typing import get_type_hints

from pydantic import BaseModel
from pydantic import create_model


def _is_json_safe_type_app(type_: type) -> bool:
    origin = get_origin(type_)
    args = get_args(type_)
    if origin in (list, List) and len(args) == 1:
        return is_json_safe(args[0])
    if origin in (dict, Dict) and args[0] == str:
        return is_json_safe(args[1])
    if origin in (Union, UnionType):
        return all(is_json_safe(t) for t in args)
    return False


def _is_atomic_type(type_: type) -> bool:
    return type_ in (int, float, str, bool, type(None))


def is_json_safe(type_: Any) -> bool:
    """Checks if the given type can be serialized to JSON."""
    if _is_atomic_type(type_):
        return True
    if isinstance(type_, type) and issubclass(type_, Enum):
        return all(is_json_safe(type(item.value)) for item in type_)
    if isinstance(type_, type) and issubclass(type_, BaseModel):
        return True
    return _is_json_safe_type_app(type_)


def dump_value(type_: Any, value: Any) -> Any:
    """Dynamically validates the value's type and dumps it to JSON."""
    if _is_atomic_type(type_):
        assert isinstance(value, type_)
        return value
    if isinstance(type_, type) and issubclass(type_, Enum):
        assert isinstance(value, type_)
        return value.value
    if isinstance(type_, type) and issubclass(type_, BaseModel):
        assert isinstance(value, type_)
        return value.model_dump()

    origin = get_origin(type_)
    args = get_args(type_)

    if origin in (list, List) and len(args) == 1:
        assert isinstance(value, list)
        return [dump_value(args[0], x) for x in value]

    if origin in (dict, Dict) and args[0] == str:
        assert isinstance(value, dict)
        return {k: dump_value(args[1], v) for k, v in value.items()}

    if origin in (Union, UnionType):
        for t in args:
            try:
                return dump_value(t, value)
            except (AssertionError, ValueError, TypeError):
                continue
        raise ValueError(f"Value {value} is not valid for union types {args}")

    raise ValueError(f"Cannot dump {value} as {type_}.")


def parse_value(type_: Any, value: Any) -> Any:
    """Converts JSON to a value of the given type."""
    if _is_atomic_type(type_):
        assert isinstance(value, type_)
        return value
    if isinstance(type_, type) and issubclass(type_, Enum):
        return type_(value)
    if isinstance(type_, type) and issubclass(type_, BaseModel):
        return type_.model_validate(value)

    origin = get_origin(type_)
    args = get_args(type_)

    if origin in (list, List) and len(args) == 1:
        assert isinstance(value, list)
        return [parse_value(args[0], x) for x in value]

    if origin in (dict, Dict) and args[0] == str:
        assert isinstance(value, dict)
        return {k: parse_value(args[1], v) for k, v in value.items()}

    if origin in (Union, UnionType):
        for t in args:
            try:
                return parse_value(t, value)
            except (AssertionError, ValueError, TypeError):
                continue
        raise ValueError(f"Value {value} is not valid for union types {args}")

    raise ValueError(f"Cannot parse {value} as {type_}.")


def _snake_case_to_camel_case(name):
    return "".join(word.capitalize() for word in name.split("_"))


def request_model_from_function(func: Callable) -> type[BaseModel]:
    """Generates request model from a function."""
    model_name = _snake_case_to_camel_case(func.__name__) + "Request"
    sig = signature(func)
    for param in sig.parameters.values():
        if not is_json_safe(param.annotation):
            raise ValueError(f"Type for argument {param.name} is not JSON safe.")

    fields: Dict[str, Any] = {
        param.name: (
            param.annotation,
            param.default if param.default is not param.empty else ...,
        )
        for param in sig.parameters.values()
    }
    model_class = create_model(model_name, **fields)
    return model_class


def return_type_json_schema(type_: Any) -> Dict[str, Any]:
    """Generates JSON schema for the given type."""
    if type_ in (int, float, str, type(None), bool):
        type_name = "null"
        if type_ in (int, float):
            type_name = "number"
        if type_ == str:
            type_name = "string"
        if type_ == bool:
            type_name = "boolean"
        return {"type": type_name}

    if isinstance(type_, type) and issubclass(type_, BaseModel):
        return type_.model_json_schema()

    origin = get_origin(type_)
    args = get_args(type_)
    if origin in (list, List):
        return {"type": "array", "items": return_type_json_schema(args[0])}
    if origin in (dict, Dict) and args[0] == str:
        return {
            "type": "object",
            "additionalProperties": return_type_json_schema(args[1]),
        }

    raise ValueError("Unknown return type.")


def get_return_type(func) -> Any:
    """Returns the return type of the given function."""
    type_hints = get_type_hints(func)
    return_type = type_hints["return"]
    if return_type is None:
        raise ValueError("The function does not have return type annotation.")
    if not is_json_safe(return_type):
        raise ValueError("The return type is not JSON safe.")
    return return_type
