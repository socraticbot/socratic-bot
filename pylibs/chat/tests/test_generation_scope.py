import uuid

import socratic.chat.generation_scope as GS

scope_id = uuid.UUID("12345678-1234-5678-1234-567812345678")


def test_generation_scope():
    GS.new_generation_scope(scope_id)
    GS.push_call()
    assert GS.current_call_id() == "12345678-1234-5678-1234-567812345678/0"
    GS.pop_call()
    GS.push_call()
    assert GS.current_call_id() == "12345678-1234-5678-1234-567812345678/1"

    GS.push_call()
    assert GS.current_call_id() == "12345678-1234-5678-1234-567812345678/1/0"
    GS.pop_call()
    GS.push_call()
    assert GS.current_call_id() == "12345678-1234-5678-1234-567812345678/1/1"
    GS.pop_call()
