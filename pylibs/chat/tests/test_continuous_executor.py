import pytest
from async_timeout import timeout

from socratic.chat import ContinuousExecutor
from socratic.chat import StepExecutor

from .model_prime_counter import model as prime_counter


def with_timeout(t):
    def wrapper(corofunc):
        async def run(*args, **kwargs):
            async with timeout(t):
                return await corofunc(*args, **kwargs)

        return run

    return wrapper


inputs = ["2", "Terminate"]
outputs = [
    "Enter an integer, and I will tell you if it is a prime number.",
    "Integer 2 is a prime.",
    "1 prime number(s) received!",
]


@pytest.mark.asyncio()
@with_timeout(2)
async def test_basic():
    i = 0
    async with ContinuousExecutor(prime_counter, {"end_phrase": "Terminate"}) as executor:
        async for message in executor.assistant_messages():
            assert message == outputs[i]
            if executor.has_ended:
                break
            await executor.post_reply(inputs[i])
            i += 1
        assert executor.get_result() == 1


@pytest.mark.asyncio()
@with_timeout(2)
async def test_steprun():
    executor = StepExecutor(prime_counter, [], [], {})

    i = 0
    while True:
        message = await executor.run(end_phrase="Terminate")
        assert message == outputs[i]
        if executor.has_ended:
            break
        executor.chat_history.append(inputs[i])
        i += 1
    assert executor.get_result() == 1
