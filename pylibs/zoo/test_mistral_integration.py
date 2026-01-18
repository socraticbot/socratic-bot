"""Simple test script to verify Mistral integration works."""

import asyncio
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel

from socratic.chat.utils.socratic_chat_mistral import SocraticChatMistral


class TestResponse(BaseModel):
    """Test JSON response model."""

    result: str
    items: list[str]


async def test_string_generation():
    """Test basic string generation."""
    print("Testing string generation...")
    
    chat_model = SocraticChatMistral()
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant."),
        ("human", "Say hello in one sentence."),
    ])
    
    result = await chat_model.gen_string(prompt)
    print(f"✅ String generation result: {result}")
    assert isinstance(result, str)
    assert len(result) > 0
    print("✅ String generation test passed!\n")


async def test_json_generation():
    """Test JSON generation."""
    print("Testing JSON generation...")
    
    chat_model = SocraticChatMistral()
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant that responds in JSON."),
        ("human", "Generate a test response with a result and a list of 3 items."),
    ])
    
    result = await chat_model.gen_json(prompt, TestResponse)
    print(f"✅ JSON generation result: {result}")
    assert isinstance(result, TestResponse)
    assert isinstance(result.result, str)
    assert isinstance(result.items, list)
    assert len(result.items) == 3
    print("✅ JSON generation test passed!\n")


async def main():
    """Run all tests."""
    # Check for API key
    if not os.getenv("AI_GATEWAY_API_KEY"):
        print("❌ ERROR: AI_GATEWAY_API_KEY environment variable not set!")
        print("Please set it before running tests.")
        sys.exit(1)
    
    print("=" * 60)
    print("Mistral Integration Test")
    print("=" * 60)
    print(f"Model: {os.getenv('MISTRAL_MODEL', 'mistral/mistral-large-latest')}")
    print(f"API Key: {'*' * 20}...{os.getenv('AI_GATEWAY_API_KEY', '')[-4:]}")
    print("=" * 60)
    print()
    
    try:
        await test_string_generation()
        await test_json_generation()
        print("=" * 60)
        print("✅ All tests passed!")
        print("=" * 60)
    except Exception as e:
        print("=" * 60)
        print(f"❌ Test failed: {e}")
        print("=" * 60)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
