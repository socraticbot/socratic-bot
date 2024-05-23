"""Provide an entry point."""

import argparse

import dotenv

from .commands.docs import print_docs
from .commands.run import autorun_model
from .commands.run import run_model
from .commands.steprun import steprun_model
from .conversation_model import ConversationModel


def main(model: ConversationModel):
    """
    Provides an entry point when used in a terminal.
    """
    parser = argparse.ArgumentParser(description="Conversation model")

    parser.add_argument(
        "command",
        choices=["docs", "run", "steprun", "autorun"],
        help="The command to process.",
    )

    args, unknown_args_list = parser.parse_known_args()
    unknown_args = dict(zip(unknown_args_list[::2], unknown_args_list[1::2]))
    unknown_args = {k.lstrip("-"): v for k, v in unknown_args.items()}

    dotenv.load_dotenv()

    if args.command == "docs":
        print_docs(model)
    elif args.command == "autorun":
        autorun_model(model, unknown_args)
    elif args.command == "run":
        run_model(model, unknown_args)
    elif args.command == "steprun":
        steprun_model(model)
