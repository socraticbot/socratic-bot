"""Provides command docs."""

from ..conversation_model import ConversationModel


def print_docs(model: ConversationModel):
    """
    Prints the documentation for all workflows.
    """
    for definition in model.definitions:
        workflow = definition.workflow_model
        print(workflow.name)
        print(workflow.doc)
        print(workflow.request_model.model_json_schema())
        print("===")
