"""Provides BasePrompts."""

import os
from typing import Self

import yaml
from pydantic import BaseModel


class BasePrompts(BaseModel):
    """Base class for convenient prompt loading."""

    @classmethod
    def load_prompt(cls, filename: str) -> Self:
        """Load prompts."""
        no_ext, _ = os.path.splitext(filename)
        path = no_ext + ".yml"
        with open(path, "r", encoding="utf-8") as file:
            raw_dict = yaml.safe_load(file)
            return cls(**raw_dict)
