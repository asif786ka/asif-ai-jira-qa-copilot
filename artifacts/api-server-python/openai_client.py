import os
import re
from openai import AsyncOpenAI

_client: AsyncOpenAI | None = None


def get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY environment variable is required.")
        _client = AsyncOpenAI(api_key=api_key)
    return _client


def strip_fences(raw: str) -> str:
    result = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.IGNORECASE)
    result = re.sub(r"\s*```\s*$", "", result, flags=re.IGNORECASE)
    return result.strip()


async def call_openai(system_prompt: str, user_prompt: str) -> str:
    client = get_client()

    completion = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.3,
    )

    raw = completion.choices[0].message.content or ""
    return strip_fences(raw)
