"""This module defines our initial version of DFS."""

# pylint: disable=missing-class-docstring
import json
from enum import Enum
from typing import List
from typing import Optional

from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel
from pydantic import model_validator

from socratic.chat.conversation_model import ConversationModel
from socratic.chat.entry import main
from socratic.chat.interface import get_user_reply
from socratic.chat.interface import post_assistant_reply
from socratic.chat.schemas import Message
from socratic.chat.schemas import MessageFormatter
from socratic.chat.utils.base_prompts import BasePrompts
from socratic.chat.utils.socratic_chat_openai import SocraticChatModel
from socratic.chat.workflow import wprint


class DFSV2Prompts(BasePrompts):
    persona: str
    make_plan: str
    update_plan: str
    segment_termination: str
    per_skill: str
    end: str


prompts = DFSV2Prompts.load_prompt(__file__)
model = ConversationModel[None]("dfs_v2", lambda: None)
format_messages = MessageFormatter(human_name="Candidate", assistant_name="Interviewer")
chat_model = SocraticChatModel()


class Skill(str, Enum):
    BALANCE = "balance"
    CLARIFY = "clarify"
    HIDDEN = "hidden"
    SYNTHESIS = "synthesis"


class SegmentID(str, Enum):
    INTRO = "intro"
    DIRECTION_1 = "direction-1"
    CHALLENGE_1_1 = "challenge-1-1"
    CHALLENGE_1_2 = "challenge-1-2"
    DIRECTION_2 = "direction-2"
    CHALLENGE_2_1 = "challenge-2-1"
    CHALLENGE_2_2 = "challenge-2-2"
    DIRECTION_3 = "direction-3"
    CHALLENGE_3_1 = "challenge-3-1"
    CHALLENGE_3_2 = "challenge-3-2"


def get_next_segment_id(current_segment: SegmentID) -> SegmentID:
    """Returns the next segment."""
    segments = list(SegmentID)
    current_index = segments.index(current_segment)
    next_index = current_index + 1
    return segments[next_index]


class Performance(str, Enum):
    BAD = "bad"
    MEDIUM = "medium"
    GOOD = "good"
    EXCELLENT = "excellent"


class SegmentPlan(BaseModel):
    skill: Skill
    segment: SegmentID
    purpose: str


class SegmentResult(BaseModel):
    segment: SegmentID
    summary: str
    skill: Skill
    performance: Performance
    evaluation: str


class SkillEvaluationExample(BaseModel):
    quote: str
    comment: str


class SkillResult(BaseModel):
    skill: Skill
    performance: Performance
    evaluation: str
    examples: List[SkillEvaluationExample]


class MakePlanResult(BaseModel):
    plan: List[SegmentPlan]
    question: str


@model.chain
async def make_plan(topic: str) -> MakePlanResult:
    """Creates the initial plan."""
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", prompts.persona),
            ("human", prompts.make_plan),
        ]
    )
    result = await chat_model.gen_json(prompt, MakePlanResult, topic=topic)
    assert [x.segment for x in result.plan] == list(SegmentID)
    return result


class PlanUpdate(BaseModel):
    should_update: bool
    reason: str
    updated_plan: Optional[List[SegmentPlan]] = None
    question: str

    @model_validator(mode="after")
    def check_should_conclude_and_fields(self: "PlanUpdate") -> "PlanUpdate":
        """Validate change."""
        if self.should_update and self.updated_plan is None:
            raise ValueError("Should update plan")
        if not self.should_update and self.updated_plan is not None:
            raise ValueError("Should not update plan")
        return self


@model.chain
async def update_plan(
    last_segment: SegmentResult, chat_history: List[Message], previous_plan: List[SegmentPlan]
) -> PlanUpdate:
    """Updates the plan if needed."""
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", prompts.persona),
            ("human", prompts.update_plan),
        ]
    )
    result = await chat_model.gen_json(
        prompt,
        PlanUpdate,
        last_segment=last_segment.model_dump_json(),
        chat_history=format_messages(chat_history),
        previous_plan=json.dumps([item.model_dump() for item in previous_plan]),
    )
    if result.updated_plan is None:
        return result
    assert len(previous_plan) == len(result.updated_plan)
    return result


class SegmentTermination(BaseModel):
    should_conclude: bool
    result: Optional[SegmentResult] = None
    reason: Optional[str] = None
    reply: Optional[str] = None

    @model_validator(mode="after")
    def check_should_conclude_and_fields(self: "SegmentTermination") -> "SegmentTermination":
        """Check the validity of the union type."""
        if self.should_conclude:
            if not self.result:
                raise ValueError("result is required when should_conclude is True.")
            if self.reason or self.reply:
                raise ValueError("reason and reply must be None when should_conclude is True.")
        else:
            if not self.reason or not self.reply:
                raise ValueError("reason and reply are required when should_conclude is False.")
            if self.result:
                raise ValueError("result must be None when should_conclude is False.")
        return self


@model.chain
async def terminate_segment(
    segment_plan: SegmentPlan,
    chat_history: List[Message],
    previous_segments: List[SegmentResult],
) -> SegmentTermination:
    """Determines if the current segment can be terminated."""
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", prompts.persona),
            ("human", prompts.segment_termination),
        ]
    )
    return await chat_model.gen_json(
        prompt,
        SegmentTermination,
        segment_plan=segment_plan.model_dump_json(),
        chat_history=format_messages(chat_history),
        previous_segments=json.dumps([item.model_dump() for item in previous_segments]),
    )


@model.chain
async def per_skill(
    skill: Skill,
    filtered_segments: List[SegmentResult],
    filtered_history: List[List[Message]],
) -> SkillResult:
    """Evaluation per skill."""
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", prompts.persona),
            ("human", prompts.per_skill),
        ]
    )

    combined: List[str] = []
    for i, segment in enumerate(filtered_segments):
        combined.append(segment.model_dump_json())
        combined.append("history:")
        combined.append(format_messages(filtered_history[i]))
        combined.append("---")

    return await chat_model.gen_json(
        prompt, SkillResult, skill=skill.value, filtered_segments="\n".join(combined)
    )


class EndResult(BaseModel):
    evaluation: str
    message: str


@model.chain
async def end(evaluations_by_skill: List[SkillResult]) -> EndResult:
    """Final evaluation."""
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", prompts.persona),
            ("human", prompts.end),
        ]
    )
    return await chat_model.gen_json(
        prompt,
        EndResult,
        evaluations_by_skill=json.dumps([item.model_dump() for item in evaluations_by_skill]),
    )


async def loop_segment(
    segment_plan: SegmentPlan, initial_question: str, previous_segments: List[SegmentResult]
) -> List[Message]:
    """Finish the current segment."""
    history: List[Message] = [Message(is_assistant=True, message=initial_question)]
    while True:
        await post_assistant_reply(history[-1].message)
        user_reply = await get_user_reply()
        history.append(Message(is_assistant=False, message=user_reply))
        result = await terminate_segment(segment_plan, history, previous_segments)

        if not result.should_conclude:
            assert result.reply is not None
            history.append(Message(is_assistant=True, message=result.reply))
            continue

        assert result.result is not None
        previous_segments.append(result.result)
        return history


async def _make_final_result(
    segments: List[SegmentResult], segmented_history: List[List[Message]]
) -> EndResult:
    evaluations_by_skill: List[SkillResult] = []
    for skill in Skill:
        filtered_segments: List[SegmentResult] = []
        filtered_history: List[List[Message]] = []
        for i, segment in enumerate(segments):
            if segment.skill != skill:
                continue
            filtered_segments.append(segment)
            filtered_history.append(segmented_history[i])
        evaluation_per_skill = await per_skill(skill, filtered_segments, filtered_history)
        evaluations_by_skill.append(evaluation_per_skill)

        wprint(evaluation_per_skill.model_dump_json(indent=2))

    return await end(evaluations_by_skill)


@model.entry
async def entry():
    """Entry point."""
    initial_plan = await make_plan(topic="Individual cognitive sovereignty as prerequisite for community sense-making.")
    plan = initial_plan.plan
    segments: List[SegmentResult] = []

    segmented_history: List[List[Message]] = []

    for i, segment in enumerate(SegmentID):
        wprint(segment.value)
        question: str
        if segment == SegmentID.INTRO:
            question = initial_plan.question
        else:
            updated_plan = await update_plan(segments[-1], segmented_history[-1], plan[i:])
            wprint(updated_plan.model_dump_json(indent=2))
            question = updated_plan.question

            if updated_plan.updated_plan is not None:
                plan[i:] = updated_plan.updated_plan

        local_history = await loop_segment(plan[i], question, segments)
        segmented_history.append(local_history)

    final_result = await _make_final_result(segments, segmented_history)
    wprint(final_result.evaluation)
    await post_assistant_reply(final_result.message)


if __name__ == "__main__":
    main(model)
