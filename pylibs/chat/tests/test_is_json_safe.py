from enum import Enum
from typing import Optional

import pytest
from pydantic import BaseModel

from socratic.chat.utils.typing import dump_value
from socratic.chat.utils.typing import is_json_safe
from socratic.chat.utils.typing import parse_value


class IntEnum(Enum):
    VALUE1 = 1
    VALUE2 = 2


class StrEnum(Enum):
    VALUE1 = "1"
    VALUE2 = "2"


class PersonModel(BaseModel):
    name: str
    age: int


def test_is_json_safe():
    assert is_json_safe(int)
    assert is_json_safe(float)
    assert is_json_safe(str)
    assert is_json_safe(bool)
    assert is_json_safe(type(None))

    assert is_json_safe(IntEnum)
    assert is_json_safe(StrEnum)

    assert is_json_safe(PersonModel)

    assert is_json_safe(list[int])
    assert is_json_safe(dict[str, int])
    assert not is_json_safe(dict[int, int])

    assert is_json_safe(int | str)
    assert is_json_safe(Optional[int])


def test_dump():
    assert dump_value(int, 3) == 3
    assert dump_value(float, 3.14) == 3.14
    assert dump_value(str, "Hello") == "Hello"
    assert dump_value(bool, True) is True
    assert dump_value(type(None), None) is None

    assert dump_value(IntEnum, IntEnum.VALUE1) == 1
    assert dump_value(StrEnum, StrEnum.VALUE1) == "1"

    assert dump_value(PersonModel, PersonModel(name="A", age=1)) == {"name": "A", "age": 1}

    assert dump_value(list[IntEnum], [x for x in IntEnum]) == [1, 2]
    assert dump_value(dict[str, StrEnum], {x.value: x for x in StrEnum}) == {"1": "1", "2": "2"}

    assert dump_value(int | str, 1) == 1
    assert dump_value(int | str, "x") == "x"
    with pytest.raises(ValueError):
        dump_value(int | str, 3.14)

    assert dump_value(Optional[int], 1) is 1
    assert dump_value(Optional[int], None) is None


def test_parse():
    assert parse_value(int, 3) == 3
    assert parse_value(float, 3.14) == 3.14
    assert parse_value(str, "Hello") == "Hello"
    assert parse_value(bool, True) is True
    assert parse_value(type(None), None) is None

    assert parse_value(IntEnum, 1) == IntEnum.VALUE1
    assert parse_value(StrEnum, "1") == StrEnum.VALUE1

    assert parse_value(PersonModel, {"name": "A", "age": 1}) == PersonModel(name="A", age=1)

    assert parse_value(list[IntEnum], [1, 2]) == [x for x in IntEnum]
    assert parse_value(dict[str, StrEnum], {"1": "1", "2": "2"}) == {x.value: x for x in StrEnum}

    assert parse_value(int | str, 1) == 1
    assert parse_value(int | str, "x") == "x"
    with pytest.raises(ValueError):
        parse_value(int | str, 3.14)

    assert parse_value(Optional[int], 1) is 1
    assert parse_value(Optional[int], None) is None
