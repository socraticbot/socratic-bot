Setup
=====

We use `Poetry <https://python-poetry.org/>`_ for package management.

Each package lives in their own directory. To work on a particular package, you need to initialize the virtual environment via Poetry, in that directory:

.. code-block:: shell

    poetry install --no-root

Everything should be ready now.

To run anything in this particular virtual environment, you have two options:

1. Prefix your command with ``poetry run``. For instance, to launch a Python REPL that can import packages in this virtual environment, you can do ``poetry run python``.
2. Run ``poetry shell``. This will create a new shell with environment variables correctly configured. You can then run everything without the prefix ``poetry run``.

VS Code
-------

We recommend at least two extensions: Pylint and `Pylance <https://marketplace.visualstudio.com/items?itemName=ms-python.vscode-pylance>`. To edit a particular package, open the corresponding directory in VS Code as a project. You should not see any warnings or errors by default. If you see one, especially one about unable to import modules, you can fix it by running the command ``Python: Select Interpreter``, and select the local one.

If you want to open more than one package at once, you need the Workspace feature from VS Code. A workspace configuration file, ``python.code-workspace`` is provided at the root of the repo. You can open it from VS Code, and interpreters should be correctly configured for each package.

Type Checking
-------------

Our codebase uses static typing checking extensively. We use `Pyright <https://github.com/microsoft/pyright>`_, a static type checker for Python by Microsoft. Strive to add type annotations whenever possible. Since type annotations is a relatively new adding to the Python community, documentation is often lacking. Feel free to seek help from peers on this.

There is one VS Code extension, Pylance, that is officially backed by Microsoft. We use the ``basic`` mode, which needs to be manually enabled in the extension's settings.

.. note::

    There are some strange license issues that limit Pylance's presence in third party VS Code derivations, such as Cursor. Pylance provided there are often outdated. Moreover, Pyright is an active project that changes behaviors frequently. Combined, this might lead to problems where Pyright from the command line reports differently from Pylance in the editor. As a result, strive to use the official VS Code whenever possible

To perform type-check in the command line, do the following in the package root:

.. code-block:: shell

    poetry run pyright .


Linting
-------

We use ``pylint`` to enforce basic code qualities, as well as enforcing documentation on all public members.

Test files are excluded from ``pylint``, as writing documentation for them seems meaningless. Still, type checking is required.

There is one caveat when using ``pylint`` from the command line. One must do:

.. code-block:: shell

    poetry run pylint $(git ls-files "*.py")

This command first uses ``git`` to list all tracked Python files, recursively, in this folder. It then passes this list to ``pylint`` for linting. Directly run ``pylint socratic`` will not do anything.

Testing
-------

We use ``pytest``. At least one test should be there, as part of our CI requirement. It is acceptable to have a placeholder test.

There are VS Code extensions that allows you to execute tests, or even debug them, within VS Code. They are very handy. However, one must notice that ``pytest`` executes your code in order to collect tests. If there is some runtime error, your tests will not be discovered. If VS Code is not showing your tests, do remember to check the log.

To run tests from the command line, do:

.. code-block:: shell

    poetry run pytest tests

Code Styles
-----------

We have settled on a code style provided by tools out-of-box, so we can save time arguing which style is better. We use ``black`` for code formatting, and ``isort`` for imports organization. Both tools should be installed automatically when initializing the virtual environment.

For VS Code, there are extensions for both. This enables you to format your code and organize imports within the editor. They come in handy, so memorize the shortcut if possible.

You can also fix code styles before committing. Both ``black`` and ``isort`` are provided for each package as development dependencies. They are also provided at the virtual environment at the repo root. This is different from ``pyright`` and ``pylint``, as they latter two must be executed at the right virutal environment to perform their jobs. To format code, simply do:

.. code-block:: shell

    poetry run black .
    poetry run isort .
