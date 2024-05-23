"""Provides StepExecutor."""

from contextlib import ExitStack
from typing import Any
from uuid import UUID
from uuid import uuid4

from socratic.chat.conversation_model import ConversationModel
from socratic.chat.generation_scope import current_call_id
from socratic.chat.generation_scope import new_generation_scope
from socratic.chat.generation_scope import reset_generation_scope
from socratic.chat.interface import with_get_user_reply
from socratic.chat.interface import with_post_assistant_reply
from socratic.chat.workflow_model import with_get_workflow_cache
from socratic.chat.workflow_model import with_on_workflow_done


class StepCompleteError(Exception):
    """An error to denote that the current step has completed."""


class StepExecutor:
    """
    Manages one step execution of a conversation model.
    """

    model: ConversationModel
    scope_ids: list[UUID]
    next_scope_id: UUID
    chat_history: list[str] = []
    workflow_results: dict[str, Any] = {}

    has_ended = False

    def __init__(
        self,
        model: ConversationModel,
        scope_ids: list[UUID],
        chat_history: list[str],
        workflow_results: dict[str, Any],
    ):
        self.model = model
        self.scope_ids = scope_ids.copy()
        self.chat_history = chat_history.copy()
        self.workflow_results = workflow_results.copy()
        self.next_scope_id = uuid4()

        self._output = None

    async def run(self, *args, **kwargs) -> str:
        """
        Runs the conversation for one step.
        """
        i = 0

        self.scope_ids.append(self.next_scope_id)
        self.next_scope_id = uuid4()

        recording = len(self.chat_history) == 0
        new_generation_scope(self.scope_ids[i])

        def get_workflow_cache() -> tuple[bool, Any]:
            if recording:
                return False, None
            result = self.workflow_results[current_call_id()]
            return True, result

        def on_workflow_done(_workflow, _input, result: Any):
            if not recording:
                return
            self.workflow_results[current_call_id()] = result

        async def get_user_reply() -> str:
            nonlocal i, recording
            offset = i * 2 + 1
            if offset == len(self.chat_history):
                raise StepCompleteError()
            if offset == len(self.chat_history) - 1:
                recording = True
            i += 1
            new_generation_scope(self.scope_ids[i])
            return self.chat_history[offset]

        async def post_assistant_reply(message: str):
            offset = i * 2
            if offset < len(self.chat_history):
                return
            self.chat_history.append(message)

        with ExitStack() as stack:
            stack.enter_context(with_get_workflow_cache(get_workflow_cache))
            stack.enter_context(with_on_workflow_done(on_workflow_done))
            stack.enter_context(with_get_user_reply(get_user_reply))
            stack.enter_context(with_post_assistant_reply(post_assistant_reply))
            try:
                self._output = await self.model.run(*args, **kwargs)
            except StepCompleteError:
                return self.chat_history[-1]
            finally:
                reset_generation_scope()

        self.has_ended = True
        return self.chat_history[-1]

    def get_result(self):
        """
        Retrieves the final output after the conversation has ended.

        This method should be called only after the conversation is complete, as indicated
        by the `has_ended` property.
        """
        assert self.has_ended
        return self._output
