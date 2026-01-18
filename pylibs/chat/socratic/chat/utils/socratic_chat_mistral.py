"""Provides SocraticChatMistral."""

import json
import os
from typing import Any
from typing import Optional
from typing import TypeVar
from uuid import uuid4

import httpx
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel

from ..event_logging import Event
from ..event_logging import EventPhase
from ..event_logging import event_model
from ..event_logging import log_event


@event_model("mistral_call_start", phase=EventPhase.START)
class MistralCallStartEvent(Event):
    """
    An event to track the start of a Mistral call.
    """

    llm_model_name: str
    llm_input: list[dict[str, Any]]

    def ignored_fields_for_str(self) -> list[str]:
        return super().ignored_fields_for_str() + ["llm_input"]


class MistralTokenUsage(BaseModel):
    """
    Tracks token usage for Mistral call.
    """

    completion_tokens: int
    prompt_tokens: int
    total_tokens: int


@event_model("mistral_call_end", phase=EventPhase.END)
class MistralCallEndEvent(Event):
    """
    An event to track the end of a Mistral call.
    """

    llm_model_name: str
    token_usage: MistralTokenUsage
    llm_output: str

    def ignored_fields_for_str(self) -> list[str]:
        return super().ignored_fields_for_str() + ["llm_output"]


T = TypeVar("T", bound=BaseModel)


class SocraticChatMistral:
    """A convenient wrapper for both string and json output using Mistral via Vercel AI Gateway"""

    model: str
    api_key: str
    base_url: str = "https://gateway.ai.vercel.com/v1"

    def __init__(self, model: str = "mistral/mistral-large-latest") -> None:
        self.model = model
        self.api_key = os.getenv("AI_GATEWAY_API_KEY", "")
        if not self.api_key:
            raise ValueError("AI_GATEWAY_API_KEY environment variable must be set")

    def _template_to_messages(self, template: ChatPromptTemplate, kwargs: dict[str, Any]) -> list[dict[str, str]]:
        """
        Convert LangChain ChatPromptTemplate to messages array for Vercel AI Gateway.

        Args:
            template: LangChain ChatPromptTemplate
            kwargs: Variables to format into template

        Returns:
            List of message dicts: [{"role": "system", "content": "..."}, ...]
        """
        # Format the template with kwargs to get the actual messages
        formatted_messages = template.format_messages(**kwargs)

        messages = []
        for msg in formatted_messages:
            # Map LangChain message types to OpenAI/Mistral roles
            role = msg.type
            if role == "human":
                role = "user"
            elif role == "ai":
                role = "assistant"
            elif role == "system":
                role = "system"
            else:
                # Default to user if unknown
                role = "user"

            messages.append({"role": role, "content": msg.content})

        return messages

    async def gen_string(self, prompt: ChatPromptTemplate, **kwargs: Any) -> str:
        """Generate a string response."""
        messages = self._template_to_messages(prompt, kwargs)

        call_id = str(uuid4())
        log_event(
            MistralCallStartEvent(
                id=call_id,
                llm_model_name=self.model,
                llm_input=messages,
            )
        )

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "messages": messages,
                        "temperature": 0.7,
                    },
                )
                response.raise_for_status()
                result = response.json()

                generated_text = result["choices"][0]["message"]["content"]
                usage_info = result.get("usage", {})

                log_event(
                    MistralCallEndEvent(
                        id=call_id,
                        llm_model_name=self.model,
                        token_usage=MistralTokenUsage(
                            completion_tokens=usage_info.get("completion_tokens", 0),
                            prompt_tokens=usage_info.get("prompt_tokens", 0),
                            total_tokens=usage_info.get("total_tokens", 0),
                        ),
                        llm_output=generated_text,
                    )
                )

                return generated_text
        except httpx.HTTPStatusError as e:
            error_msg = f"HTTP error {e.response.status_code}: {e.response.text}"
            print(f"Mistral API error: {error_msg}")
            raise RuntimeError(error_msg) from e
        except Exception as e:
            print(f"Error generating text with Mistral: {e}")
            raise

    async def gen_json(self, prompt: ChatPromptTemplate, model_cls: type[T], **kwargs: Any) -> T:
        """Generate a JSON response."""
        messages = self._template_to_messages(prompt, kwargs)

        # Add JSON format instruction to the last user message
        # This is a fallback approach - we'll try structured outputs if available
        schema = model_cls.model_json_schema()
        json_instruction = f"\n\nYou must respond with valid JSON matching this schema:\n{json.dumps(schema, indent=2)}\n\nRespond only with the JSON object, no other text."

        # Append instruction to last message
        if messages and messages[-1]["role"] == "user":
            messages[-1]["content"] = messages[-1]["content"] + json_instruction
        else:
            messages.append({"role": "user", "content": json_instruction})

        call_id = str(uuid4())
        log_event(
            MistralCallStartEvent(
                id=call_id,
                llm_model_name=self.model,
                llm_input=messages,
            )
        )

        max_retries = 3
        for attempt in range(max_retries):
            try:
                async with httpx.AsyncClient(timeout=60.0) as client:
                    response = await client.post(
                        f"{self.base_url}/chat/completions",
                        headers={
                            "Authorization": f"Bearer {self.api_key}",
                            "Content-Type": "application/json",
                        },
                        json={
                            "model": self.model,
                            "messages": messages,
                            "temperature": 0.7,
                        },
                    )
                    response.raise_for_status()
                    result = response.json()

                    generated_text = result["choices"][0]["message"]["content"]
                    usage_info = result.get("usage", {})

                    # Try to extract JSON from response
                    # Sometimes the model wraps JSON in markdown code blocks
                    json_text = generated_text.strip()
                    if json_text.startswith("```"):
                        # Extract JSON from code block
                        lines = json_text.split("\n")
                        json_text = "\n".join(lines[1:-1]) if len(lines) > 2 else json_text
                    elif json_text.startswith("```json"):
                        lines = json_text.split("\n")
                        json_text = "\n".join(lines[1:-1]) if len(lines) > 2 else json_text

                    try:
                        parsed_data = json.loads(json_text)
                        parsed_result = model_cls.model_validate(parsed_data)

                        log_event(
                            MistralCallEndEvent(
                                id=call_id,
                                llm_model_name=self.model,
                                token_usage=MistralTokenUsage(
                                    completion_tokens=usage_info.get("completion_tokens", 0),
                                    prompt_tokens=usage_info.get("prompt_tokens", 0),
                                    total_tokens=usage_info.get("total_tokens", 0),
                                ),
                                llm_output=generated_text,
                            )
                        )

                        return parsed_result
                    except json.JSONDecodeError as json_err:
                        if attempt == max_retries - 1:
                            print("An error occurred when parsing JSON. Raw output:")
                            print(generated_text)
                            raise
                        # Retry with more explicit instructions
                        json_instruction = f"\n\nCRITICAL: You must respond with ONLY valid JSON, no other text. The JSON must match this exact schema:\n{json.dumps(schema, indent=2)}\n\nJSON response:"
                        if messages and messages[-1]["role"] == "user":
                            # Remove old instruction and add new one
                            content = messages[-1]["content"]
                            if "You must respond" in content:
                                content = content.split("\n\nYou must respond")[0]
                            messages[-1]["content"] = content + json_instruction
                        continue
            except httpx.HTTPStatusError as e:
                error_msg = f"HTTP error {e.response.status_code}: {e.response.text}"
                print(f"Mistral API error: {error_msg}")
                if attempt == max_retries - 1:
                    raise RuntimeError(error_msg) from e
                continue
            except Exception as e:
                print(f"Error generating JSON with Mistral: {e}")
                if attempt == max_retries - 1:
                    raise
                continue

        raise RuntimeError("Failed to generate valid JSON after retries")
