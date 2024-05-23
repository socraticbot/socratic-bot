Socratic Copilot
===============

This is a centralized repo for all code behind Socratic. We use a monorepo architecture. This allows us to maintain a consistent version across different packages and projects.

Here is a list of Python packages we have:

- ``pylibs/chat``, our chatting framework.
- ``pylibs/zoo``, our conversation models.
- ``pyprojs/chatserver``, our chat server microservice.
- ``pyprojs/telegram``, our telegram bot.
- ``pydocs``, our centralized docs.


.. toctree::
   :caption: Getting Started
   :maxdepth: 1

   getting-started/setup
   getting-started/develop

.. toctree::
   :caption: Design Docs
   :maxdepth: 1

   design/chat
