import os
import json
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from models import (
    JiraTicket,
    GenerateTestCasesResponse,
    ErrorResponse,
    HealthStatus,
)
from openai_client import call_openai
from prompt import build_system_prompt, build_user_prompt

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="Asif AI Jira QA Copilot — Python/FastAPI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/pyapi/healthz")
async def health_check() -> HealthStatus:
    return HealthStatus(status="ok")


@app.post("/pyapi/generate")
async def generate_test_cases(request: Request) -> JSONResponse:
    try:
        body = await request.json()
    except Exception:
        return JSONResponse(
            status_code=400,
            content=ErrorResponse(
                error="Invalid request payload",
                details="Request body must be valid JSON.",
            ).model_dump(),
        )

    try:
        ticket = JiraTicket(**body)
    except ValidationError as e:
        return JSONResponse(
            status_code=400,
            content=ErrorResponse(
                error="Invalid request payload",
                details=str(e),
            ).model_dump(),
        )

    try:
        system_prompt = build_system_prompt()
        user_prompt = build_user_prompt(ticket)

        raw_json = await call_openai(system_prompt, user_prompt)

        try:
            parsed = json.loads(raw_json)
        except json.JSONDecodeError:
            logger.error("OpenAI returned non-JSON response: %s", raw_json[:200])
            return JSONResponse(
                status_code=500,
                content=ErrorResponse(
                    error="LLM returned invalid JSON",
                    details="The model did not return parseable JSON. Please try again.",
                ).model_dump(),
            )

        try:
            validated = GenerateTestCasesResponse(**parsed)
        except ValidationError as e:
            logger.error("OpenAI response failed Pydantic validation: %s", str(e))
            return JSONResponse(
                status_code=500,
                content=ErrorResponse(
                    error="LLM response failed schema validation",
                    details=str(e),
                ).model_dump(),
            )

        return JSONResponse(content=validated.model_dump())

    except Exception as e:
        logger.error("Error calling OpenAI: %s", str(e))
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(
                error="Failed to generate test cases",
                details=str(e),
            ).model_dump(),
        )


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", "8001"))
    uvicorn.run(app, host="0.0.0.0", port=port)
