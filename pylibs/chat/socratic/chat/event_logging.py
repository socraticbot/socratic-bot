"""
Defines event logging API.
"""

from datetime import UTC
from datetime import datetime
from enum import Enum
from time import time
from typing import Callable
from typing import Optional
from typing import TypeVar

from pydantic import BaseModel


class EventPhase(Enum):
    """
    Represents the phase of an event.

    When tracking a long lasting activity, use 'START' and 'END' to mark the lifespan of
    the activity. For all other cases, including events within an activity, use 'EVENT'.
    """

    START = "start"
    END = "end"
    EVENT = "event"

    def __str__(self) -> str:
        return self.value.upper()


class Event(BaseModel):
    """
    Represents a particular event.

    This base class captures common metadata about events, including their id, time, etc.
    You should not specify metadata other than 'id', as they will be filled out automatically
    when passed to 'log_event'.

    This is informally an "abstract base class". Do not use it. Instead, creating concrete
    subclasses with the decorator 'event_model'. If you have multiple models sharing some
    common fields, you can create an abstract "middle" model by not using the decorator.
    """

    id: str
    type: str = ""
    scope: str = ""
    timestamp: float = -1
    phase: EventPhase = EventPhase.EVENT

    def ignored_fields_for_str(self) -> list[str]:
        """
        Specifies fields ignored in '__str__'.

        All of the common metadata are ignored, since they are handled specially.
        """
        return ["id", "type", "scope", "timestamp", "phase"]

    def __str__(self) -> str:
        iso_timestamp = (
            datetime.fromtimestamp(self.timestamp, tz=UTC).replace(tzinfo=None).isoformat()
        )
        scoped_id = f"{self.scope}/{self.id}" if self.scope else self.id
        formatted_event = " ".join([f"[{iso_timestamp}]", str(self.phase), scoped_id, self.type])

        # Other attributes, excluding the ones already included.
        other_attrs = " ".join(
            f"{key}={value}"
            for key, value in self.model_dump().items()
            if key not in self.ignored_fields_for_str()
        )

        return f"{formatted_event}: {other_attrs}"


_event_model_registry: dict[str, type[Event]] = {}
_event_model_phases: dict[str, EventPhase] = {}
_event_model_reverse_registry: dict[type[Event], str] = {}

T = TypeVar("T", bound=Event)


def event_model(type_key: str, phase: Optional[EventPhase] = None):
    """
    A decorator for registering a concrete subclass of Event. A unique type string for
    the class must be provided.

    The decorator will register this class using the provided 'type_key' to enable using this
    class across the event logging API. The 'type_key' must be globally unique.

    Args:
        type_key (str): A unique string that identifies the event model class.

    Raises:
        AssertionError: If the `type_key` is already registered with another class.

    Returns:
        type[Event]: The decorated subclass of Event with `type` attribute set.
    """

    def decorator(cls: type[T]) -> type[T]:
        assert type_key not in _event_model_registry
        _event_model_registry[type_key] = cls
        if phase is not None:
            _event_model_phases[type_key] = phase
        _event_model_reverse_registry[cls] = type_key
        return cls

    return decorator


def parse_event_model(data: dict) -> Event:
    """
    Parses a dictionary into an instance of a registered Event subclass.

    The dictionary must contain a 'type' key with a value that corresponds to a registered
    subtype of Event. If the 'type' key is not found or the value does not correspond
    to any registered model, an exception will be raised.

    Args:
        data (dict): The dictionary containing the event data to be parsed.

    Returns:
        An instance of the appropriate Event subclass.

    Raises:
        KeyError: If 'type' is not provided or the type is not found in the registry.
        ValidationError: If the data provided does not conform to the model schema.
    """
    type_key = data.get("type")
    if type_key is None or type_key not in _event_model_registry:
        raise KeyError(f"Event type '{type_key}' is not a registered event model type.")

    event_model_cls = _event_model_registry[type_key]
    return event_model_cls.model_validate(data)


def _fill_event_metadata(event: Event):
    event.type = _event_model_reverse_registry[event.__class__]
    if event.timestamp == -1:
        event.timestamp = time()

    preferred_phase = _event_model_phases.get(event.type)
    if preferred_phase is not None:
        event.phase = preferred_phase


EventLoggingHandler = Callable[[Event], None]


def _handle_event_logging(event: Event):
    print(str(event))


_current_event_logging_handler: EventLoggingHandler = _handle_event_logging


def set_event_logging_handler(handler: EventLoggingHandler):
    """
    Sets a new event logging handler.
    """
    _current_event_logging_handler = handler


def log_event(event: Event):
    """
    Logs an event.
    """
    _fill_event_metadata(event)
    _current_event_logging_handler(event)
