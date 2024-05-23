from socratic.chat.event_logging import Event
from socratic.chat.event_logging import EventPhase
from socratic.chat.event_logging import _fill_event_metadata
from socratic.chat.event_logging import event_model
from socratic.chat.event_logging import parse_event_model


@event_model("api_call_start", phase=EventPhase.START)
class APICallStartEvent(Event):
    input: int


def test_fill_event_metadata():
    event = APICallStartEvent(id="foo", input=1)
    _fill_event_metadata(event)
    assert event.type == "api_call_start"
    assert event.timestamp >= 0
    assert event.phase == EventPhase.START


def test_roundtrip():
    event = APICallStartEvent(id="foo", input=1)
    _fill_event_metadata(event)
    event_dict = event.model_dump()
    event_ = parse_event_model(event_dict)
    assert event == event_


def test_str_repn():
    event = APICallStartEvent(id="foo", timestamp=0, input=1)
    _fill_event_metadata(event)
    assert str(event) == "[1970-01-01T00:00:00] START foo api_call_start: input=1"
