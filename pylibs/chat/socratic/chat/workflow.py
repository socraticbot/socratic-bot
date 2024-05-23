"""Provides workflow-related API."""

from functools import wraps

from socratic.chat.workflow_model import WorkflowModel


def workflow(func):
    """
    A decorator for defining a workflow.
    """

    model = WorkflowModel(func)

    @wraps(func)
    def wrapper(*args, **kwargs):
        return model.call(*args, **kwargs)

    @wraps(func)
    async def awrapper(*args, **kwargs):
        return await model.async_call(*args, **kwargs)

    if model.is_async:
        return awrapper
    return wrapper


@workflow
def wprint(message: str) -> None:
    """
    A workflow-wrapped print.
    """
    print(message)
