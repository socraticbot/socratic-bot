#!/usr/bin/env bash

poetry run black socratic tests
poetry run isort socratic tests
poetry run pyright .
poetry run pylint $(git ls-files "*.py")

