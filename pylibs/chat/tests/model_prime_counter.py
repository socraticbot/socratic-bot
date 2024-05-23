"""Conversation model prime counter."""

from typing import Optional

from socratic.chat import ConversationModel
from socratic.chat import get_user_reply
from socratic.chat import post_assistant_reply

model = ConversationModel("prime-counter", lambda: None)

INITIAL_MESSAGE = "Enter an integer, and I will tell you if it is a prime number."
NOT_AN_INTEGER_MESSAGE = "Input {user_input} is not an integer."
NOT_PRIME_MESSAGE = "Integer {number} is not a prime."
IS_PRIME_MESSAGE = "Integer {number} is a prime."
END_MESSAGE = "{prime_count} prime number(s) received!"


@model.chain
async def check_prime(x: int) -> bool:
    """Checks whether the input is a prime number."""
    if x <= 1:
        return False
    for i in range(2, int(x**0.5) + 1):
        if x % i == 0:
            return False
    return True


@model.chain
def convert_to_int(user_input: str) -> Optional[int]:
    """Parses the given input to an integer."""
    try:
        return int(user_input)
    except ValueError:
        return None


@model.entry
async def entry(end_phrase: str = "End") -> int:
    """
    A testing model that counts prime.

    - It requires you to enter an integer.
    - It will tell you whether it is a prime or not.
    - It will stop when encountering an exit phrase.

    Input: It accepts a custom exit phrase. Defaults to "End".
    Output: The number of prime numbers during the conversation.
    """

    prime_count = 0
    await post_assistant_reply(INITIAL_MESSAGE)

    while True:
        user_input = await get_user_reply()
        if user_input == end_phrase:
            break
        number = convert_to_int(user_input)
        if number is None:
            await post_assistant_reply(NOT_AN_INTEGER_MESSAGE.format(user_input=user_input))
            continue
        is_prime = await check_prime(number)
        if is_prime:
            prime_count += 1
            await post_assistant_reply(IS_PRIME_MESSAGE.format(number=number))
        else:
            await post_assistant_reply(NOT_PRIME_MESSAGE.format(number=number))

    await post_assistant_reply(END_MESSAGE.format(prime_count=prime_count))
    return prime_count
