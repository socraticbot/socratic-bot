# -*- coding: utf-8 -*-
"""
Socratic telegram bot.

"""


import functools
import logging


def trace(fcn_wrapped):
    """
    Add trace logging calls to the wrapped function.

    """

    @functools.wraps(fcn_wrapped)
    def fcn_wrapper(*args, **kwargs):
        """
        Trace logging wrapper.

        """

        logging.debug("Call: %s()", fcn_wrapped.__name__)
        return fcn_wrapped(*args, **kwargs)

    return fcn_wrapper
