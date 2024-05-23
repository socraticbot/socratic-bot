# -*- coding: utf-8 -*-
"""
Socratic telegram bot.

"""


import importlib.metadata
import os
import os.path
import sys

import dotenv
import telegram
import telegram.ext

import socratic.telegram.interaction as tgbot_interaction
import socratic.telegram.logutil as tgbot_logutil
import socratic.telegram.runtime as tgbot_runtime

NAME_PACKAGE = "socratic.telegram"
try:
    __version__ = importlib.metadata.version(NAME_PACKAGE)
except importlib.metadata.PackageNotFoundError:
    __version__ = "0.0.1"


KEY_TOKEN = "TOKEN_TELEGRAM_SOCRATIC_ROBOT"
STR_TOPIC_ZUZALU = (
    "What software principles should we follow for Zuzalu "
    "technologies? Should anything be added? What should be "
    "done first? What are the highest priorities?"
)
STR_TOPIC_VITALEA = (
    "Ask a controversial and creative question about longevity that is not about ethics."
)


def main():
    """
    Set up command and message handlers and run the telegram bot main loop.

    """

    dotenv.load_dotenv()
    with tgbot_runtime.Context(os.getenv(KEY_TOKEN)) as bot:
        bot.handle_command(_start)
        bot.handle_command(_help)
        bot.handle_command(_about)
        bot.handle_messages(_msg)


@tgbot_logutil.trace
async def _start(
    bot: tgbot_runtime.Context,
    update: telegram.Update,
    context: telegram.ext.ContextTypes.DEFAULT_TYPE,
):
    """
    Welcome the user to the Socratic copilot.

    Called at the beginning of an interaction with the bot.

    """

    with tgbot_interaction.Context(bot=bot, update=update, context=context) as interaction:

        await interaction.reset()


@tgbot_logutil.trace
async def _help(
    bot: tgbot_runtime.Context,
    update: telegram.Update,
    context: telegram.ext.ContextTypes.DEFAULT_TYPE,
):
    """
    Print a list of commands.

    """

    with tgbot_interaction.Context(bot=bot, update=update, context=context) as interaction:

        await interaction.telegram_msg(bot.help_text())


@tgbot_logutil.trace
async def _about(
    bot: tgbot_runtime.Context,
    update: telegram.Update,
    context: telegram.ext.ContextTypes.DEFAULT_TYPE,
):
    """
    Print information about the bot.

    """

    with tgbot_interaction.Context(bot=bot, update=update, context=context) as interaction:

        await interaction.telegram_msg(f"Socratic bot version {__version__}")


@tgbot_logutil.trace
async def _msg(
    bot: tgbot_runtime.Context,
    update: telegram.Update,
    context: telegram.ext.ContextTypes.DEFAULT_TYPE,
):
    """
    Handler function for non-command messages.

    """

    with tgbot_interaction.Context(bot=bot, update=update, context=context) as interaction:

        await interaction.step()


if __name__ == "__main__":
    sys.exit(main())
