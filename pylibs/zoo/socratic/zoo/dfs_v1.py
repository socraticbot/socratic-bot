"""This module defines our initial version of DFS."""

# pylint: disable=missing-class-docstring
from typing import List
from typing import Optional
from typing import Tuple

from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel

from socratic.chat.conversation_model import ConversationModel
from socratic.chat.entry import main
from socratic.chat.interface import get_user_reply
from socratic.chat.interface import post_assistant_reply
from socratic.chat.schemas import Message
from socratic.chat.schemas import MessageFormatter
from socratic.chat.utils.base_prompts import BasePrompts
from socratic.chat.utils.socratic_chat_openai import SocraticChatModel
from socratic.chat.workflow import wprint


class DFSV1Prompts(BasePrompts):
    persona: str
    ask_question: str
    current_group_termination: str
    current_group_termination_format: str

    background: Optional[str] = None

    class CurrentGroupGoals(BaseModel):
        initial: str
        direction: str
        challenge: str

    current_group_goals: CurrentGroupGoals

    direction_generation: str
    direction_generation_format: str
    challenge_generation: str
    challenge_generation_format: str

    start_direction: str
    start_challenge: str
    end: str

    def with_persona_prompt(self, human_prompt: str) -> ChatPromptTemplate:
        """Returns an assembled prompt, with persona already prepended."""
        base_prompt = ChatPromptTemplate.from_messages(
            [
                ("system", self.persona),
                ("human", human_prompt),
            ]
        )
        if self.background is None:
            return base_prompt.partial(persona_background="")
        background = f"Here is some background info for the conversation:\n{self.background}"
        return base_prompt.partial(persona_background=background)


model = ConversationModel[DFSV1Prompts]("dfs_v1", lambda: DFSV1Prompts.load_prompt(__file__))
format_messages = MessageFormatter(human_name="Student", assistant_name="Professor")
chat_model = SocraticChatModel()


class QuestionRequest(BaseModel):
    topic: str


class StartDirectionRequest(BaseModel):
    history: List[Message]
    direction: str


class StartChallengeRequest(BaseModel):
    history: List[Message]
    challenge: str


class StringResponse(BaseModel):
    result: str


@model.chain
async def make_question(topic: str) -> str:
    """Generates a question on the given topic."""
    prompt = model.config.with_persona_prompt(model.config.ask_question)
    return await chat_model.gen_string(prompt, topic=topic)


@model.chain
async def start_direction(direction: str, history: List[Message]) -> str:
    """Transition to the given direction."""
    prompt = model.config.with_persona_prompt(model.config.start_direction)
    return await chat_model.gen_string(
        prompt, history=format_messages(history), direction=direction
    )


@model.chain
async def start_challenge(challenge: str, history: List[Message]) -> str:
    """Transition to the given challenge."""
    prompt = model.config.with_persona_prompt(model.config.start_challenge)
    return await chat_model.gen_string(
        prompt, history=format_messages(history), challenge=challenge
    )


class DirectionGenerationResult(BaseModel):
    directions: List[str]


class ChallengeGenerationResult(BaseModel):
    challenges: List[str]


@model.chain
async def generate_directions(history: List[Message], summary: str) -> List[str]:
    """Generates directions."""
    prompt_base = model.config.with_persona_prompt(model.config.direction_generation)
    prompt = prompt_base.partial(format_instructions=model.config.direction_generation_format)
    result = await chat_model.gen_json(
        prompt,
        DirectionGenerationResult,
        history=format_messages(history),
        summary=summary,
    )
    return result.directions


@model.chain
async def generate_challenges(history: List[Message], summary: str) -> List[str]:
    """Generates challenges."""
    prompt_base = model.config.with_persona_prompt(model.config.challenge_generation)
    prompt = prompt_base.partial(format_instructions=model.config.challenge_generation_format)
    result = await chat_model.gen_json(
        prompt,
        ChallengeGenerationResult,
        history=format_messages(history),
        summary=summary,
    )
    return result.challenges


class CurrentGroupTerminationRequest(BaseModel):
    topic: str
    current_group: List[Message]
    goal: str


class CurrentGroupTerminationResponse(BaseModel):
    goal_achieved: bool
    summary: Optional[str] = None
    turns_passed: int
    not_achieved_reason: Optional[str] = None
    not_achieved_reply: Optional[str] = None


@model.chain
async def try_terminate_current_group(
    topic: str, current_group: List[Message], goal: str
) -> CurrentGroupTerminationResponse:
    """Determines if the current group can be terminated."""
    prompt_base = model.config.with_persona_prompt(model.config.current_group_termination)
    prompt = prompt_base.partial(format_instructions=model.config.current_group_termination_format)
    return await chat_model.gen_json(
        prompt,
        CurrentGroupTerminationResponse,
        current_group=format_messages(current_group),
        topic=topic,
        goal=goal,
    )


async def terminate_current_group(
    initial_message: str, topic: str, goal: str
) -> Tuple[List[Message], str]:
    """Loop to terminate the current group."""
    await post_assistant_reply(initial_message)
    current_group: List[Message] = [Message(is_assistant=True, message=initial_message)]

    while True:
        user_reply = await get_user_reply()
        current_group.append(Message(is_assistant=False, message=user_reply))

        termination_result = await try_terminate_current_group(
            topic=topic, current_group=current_group, goal=goal
        )

        if termination_result.goal_achieved:
            assert termination_result.summary is not None
            return (current_group, termination_result.summary)

        assert termination_result.not_achieved_reason is not None
        assert termination_result.not_achieved_reply is not None
        wprint(termination_result.not_achieved_reason)
        await post_assistant_reply(termination_result.not_achieved_reply)
        current_group.append(
            Message(is_assistant=True, message=termination_result.not_achieved_reply)
        )


@model.chain
async def evaluate(history: List[Message]) -> str:
    """Evaluate the whole conversation."""
    prompt = model.config.with_persona_prompt(model.config.end)
    return await chat_model.gen_string(prompt, history=format_messages(history))


async def _process_direction(direction: str, messages: list[Message]):
    wprint(f"To start direction: {direction}\n")
    direction_initial = await start_direction(history=messages, direction=direction)
    direction_group, direction_summary = await terminate_current_group(
        direction_initial, direction, model.config.current_group_goals.direction
    )
    messages.extend(direction_group)

    challenges = await generate_challenges(history=direction_group, summary=direction_summary)
    for challenge in challenges:
        wprint(f"To start challenge: {challenge}\n")

        challenge_initial = await start_challenge(history=messages, challenge=challenge)
        challenge_group, _ = await terminate_current_group(
            challenge_initial, challenge, model.config.current_group_goals.challenge
        )
        messages.extend(challenge_group)


@model.entry
async def entry(
    topic: str = "Ask the question about the pros and cons of remote working.",
    background: Optional[str] = None,
):
    """Entry point for conversation model "trivial"."""
    model.config.background = background

    question = await make_question(topic=topic)

    messages: list[Message] = []
    initial_group, initial_summary = await terminate_current_group(
        question, question, model.config.current_group_goals.initial
    )
    messages.extend(initial_group)

    directions = await generate_directions(history=initial_group, summary=initial_summary)
    for direction in directions:
        await _process_direction(direction, messages)

    evaluation = await evaluate(messages)
    await post_assistant_reply(evaluation)


if __name__ == "__main__":
    main(model)
