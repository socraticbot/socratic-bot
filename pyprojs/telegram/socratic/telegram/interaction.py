# -*- coding: utf-8 -*-
"""
Socratic telegram bot.

"""

import http
import logging
import os
import pprint
import typing
import urllib.parse

import pydantic
import requests
import telegram  # pylint: disable=wrong-import-order
import yaml

import socratic.telegram.logutil as tgbot_logutil
import socratic.telegram.runtime as tgbot_runtime

URL_CHATSERVER = "https://chatserver.socratic.ai"
TIMEOUT_CHATSERVER = 60

# Read topic config.
#
MAP_CFG_TOPIC = None
DIRPATH_SELF = os.path.dirname(os.path.realpath(__file__))
FILENAME_CFG = "topic.cfg.yaml"
FILEPATH_CFG = os.path.join(DIRPATH_SELF, FILENAME_CFG)
with open(FILEPATH_CFG, "rt", encoding="utf-8") as file:
    MAP_CFG_TOPIC = yaml.safe_load(file)

# id_chat -> coroutine
map_chat = {}


async def _chat(fcn_tg_msg, fcn_tg_reply, fcn_tg_options, fcn_new_conv, fcn_reply):
    """
    Chat coroutine.

    This synchronous coroutine is responsible for
    defining the chat lifecycle from initiation
    through to conclusion.

    All dependencies are injected so that the
    chat logic can be tested in isolation.

    """

    # Conversation initiation.
    #
    cursor = MAP_CFG_TOPIC
    state = yield
    while state.str_topic == "":

        if isinstance(cursor, str):
            state.str_topic = cursor
            break

        if not isinstance(cursor, dict):
            str_err = "Bad configuration (Expected a nested dict)"
            fcn_tg_msg(str_err)
            logging.error(str_err)
            raise RuntimeError(str_err)

        if "_txt" not in cursor:
            str_err = "Bad configuration (Expected a _txt field)"
            fcn_tg_msg(str_err)
            logging.error(str_err)
            raise RuntimeError(str_err)

        set_str_opt = set(cursor.keys()) - {"_txt"}
        list_str_opt = sorted(set_str_opt)

        await fcn_tg_options(str_text=cursor["_txt"], iter_str_opt=list_str_opt)
        state = yield
        selection = state.str_message_last

        if selection not in set_str_opt:
            await fcn_tg_reply("Selection not recognized.")
            continue

        cursor = cursor[selection]
        continue

    await fcn_tg_reply(await fcn_new_conv(state.str_topic))

    # Carry out the conversation.
    #
    while True:

        state = yield
        logging.info(pprint.pformat(state.dict(), indent=4))
        message = await fcn_reply(state.str_message_last)
        if message:
            await fcn_tg_reply(message)


class InteractionState(pydantic.BaseModel):
    """
    Bot interaction state.

    """

    version: int = 1
    id_conversation: str = ""
    id_message_last: str = ""
    str_message_last: str = ""
    str_topic: str = ""


class Context:
    """
    Interaction context for a telegram bot.

    This context will be exited when the
    current interaction with the bot is
    complete.

    An interaction consists of zero or one
    inputs from the user and zero or more
    responses from the bot. In other words
    any action taken by or to the bot.

    """

    id_chat: int
    bot: tgbot_runtime.Context
    update: typing.Any
    context: typing.Any
    state: InteractionState

    def __init__(self, bot: tgbot_runtime.Context, update: typing.Any, context: typing.Any):
        """
        Return an instance of BotInteractionContext.

        Gets called at the start of each interaction.

        """

        self.id_chat = update.effective_chat.id

        try:
            self.state = InteractionState(**bot.db[self.id_chat])
        except KeyError:
            self.state = InteractionState()
        finally:
            self.bot = bot
            self.update = update
            self.context = context

    def __enter__(self):
        """
        Enter the interaction context for the telegram bot.

        """

        return self

    def __exit__(self, type_exc, value_exc, tb_exc):
        """
        Exit the interaction context for the telegram bot.

        Make sure that relevant state is saved in the db.

        """

        self.bot.db[self.id_chat] = self.state.dict()
        self.bot.db.commit()

    @tgbot_logutil.trace
    async def reset(self, str_topic=""):
        """
        Reset the interaction state.

        """

        logging.info("Reset/restart chat.")
        self.state.str_topic = str_topic
        self.state.str_message_last = ""
        map_chat[self.id_chat] = _chat(
            fcn_tg_msg=self.telegram_msg,
            fcn_tg_reply=self.telegram_reply,
            fcn_tg_options=self.telegram_options,
            fcn_new_conv=self._new_conv,
            fcn_reply=self._reply,
        )
        await map_chat[self.id_chat].asend(None)  # Prime the generator
        await map_chat[self.id_chat].asend(self.state)

    @tgbot_logutil.trace
    async def step(self):
        """
        Single step the logic coroutine, creating it if necessary.

        """

        self.state.str_message_last = self.update.message.text
        try:
            await map_chat[self.id_chat].asend(self.state)
        except KeyError:
            logging.warning(
                ("Possible server restart? Recreating chat coroutine from saved state.")
            )
            map_chat[self.id_chat] = _chat(
                fcn_tg_msg=self.telegram_msg,
                fcn_tg_reply=self.telegram_reply,
                fcn_tg_options=self.telegram_options,
                fcn_new_conv=self._new_conv,
                fcn_reply=self._reply,
            )
            await map_chat[self.id_chat].asend(None)  # Prime the generator
            await map_chat[self.id_chat].asend(self.state)

    @tgbot_logutil.trace
    async def telegram_msg(self, str_text, **kwargs):
        """
        Utility function to send a message to the user via telegram.

        """

        await self.context.bot.send_message(chat_id=self.id_chat, text=str_text, **kwargs)

    @tgbot_logutil.trace
    async def telegram_reply(self, str_text, **kwargs):
        """
        Utility function to send a reply message to the user via telegram.

        """

        await self.update.message.reply_text(text=str_text, **kwargs)

    @tgbot_logutil.trace
    async def telegram_options(self, str_text, iter_str_opt, **kwargs):
        """
        Utility function to present options to the user via telegram.

        """

        keyboard = [[telegram.KeyboardButton(opt) for opt in iter_str_opt]]
        markup = telegram.ReplyKeyboardMarkup(
            keyboard, resize_keyboard=True, one_time_keyboard=True
        )
        await self.update.message.reply_text(text=str_text, reply_markup=markup, **kwargs)

    async def _new_conv(self, topic):
        """
        Utility function to create a new conversation on the chatserver.

        """

        response = requests.post(
            **self._post_params("new"), json={"name": "dfs_v1", "request": {"topic": topic}}
        )
        if response.status_code != http.HTTPStatus.OK:
            return self._error_message(response)

        payload = response.json()
        self.state.id_conversation = payload["conversation_id"]
        self.state.id_message_last = payload["message_id"]
        return payload["message"]

    async def _reply(self, reply):
        """
        Utility function to add a reply to a conversation on the chatserver.

        """

        id_conversation = self.state.id_conversation
        id_message_last = self.state.id_message_last
        response = requests.post(
            **self._post_params("reply"),
            json={
                "conversation_id": id_conversation,
                "message_id": id_message_last,
                "message": reply,
            },
        )
        if response.status_code != http.HTTPStatus.OK:
            return self._error_message(response)

        payload = response.json()
        self.state.id_message_last = payload["id"]
        return payload["message"]

    def _post_params(self, endpoint):
        """
        Return standard requests.post parameters.

        """

        uuid_bearer = os.getenv("UUID_BEARER_CHATSERVER")
        return {
            "url": urllib.parse.urljoin(URL_CHATSERVER, endpoint),
            "headers": {
                "accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": f"Bearer {uuid_bearer}",
            },
            "timeout": TIMEOUT_CHATSERVER,
        }

    def _error_message(self, response):
        """
        Log an error and return a suitable user-facing error message.

        """

        logging.error("Error: %s - %s", response.status_code, response.text)
        is_not_found = response.status_code == http.HTTPStatus.NOT_FOUND  # 404
        if is_not_found:
            return "We have encountered an error. " "Please restart the conversation."
        return f"Internal error: {response.status_code}"
