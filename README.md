# Asif AI Jira QA Copilot

A full-stack TypeScript/Python web application that accepts Jira-style ticket input and uses OpenAI (GPT-4o-mini) to generate 3–6 structured QA test cases per ticket.

Features **dual backends** — Node.js (Express + Zod) and Python (FastAPI + Pydantic) — with a **runtime backend switcher** in the UI. Demonstrates **OpenAPI-first design**, **generated React Query hooks**, **modular prompt engineering**, and a premium dark-themed UI.

**Author:** Asif — Senior AI & React Architect

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React 19 + Vite)               │
│  ┌─────────────┐  ┌──────────────────┐  ┌───────────────────┐  │
│  │ Ticket Form  │  │ Test Case Cards  │  │ Architecture Panel│  │
│  │ (9 fields)   │  │ (animated, typed)│  │ (sticky sidebar)  │  │
│  └──────┬───────┘  └────────▲─────────┘  └───────────────────┘  │
│         │                   │                                    │
│         ▼                   │                                    │
│  useGenerateTestCases()     │  (generated React Query hook)      │
│         │                   │                                    │
└─────────┼───────────────────┼────────────────────────────────────┘
          │ POST /api/generate│
          ▼                   │
┌─────────────────────────────┼────────────────────────────────────┐
│                   API Server (Express 5)                         │
│  ┌────────────────┐  ┌──────┴──────┐  ┌───────────────────────┐ │
│  │ Zod Request    │  │ Zod Response│  │ OpenAI Client         │ │
│  │ Validation     │  │ Validation  │  │ (lazy init, GPT-4o-m) │ │
│  └───────┬────────┘  └──────▲──────┘  └──────────▲────────────┘ │
│          │                  │                     │              │
│          ▼                  │                     │              │
│  ┌───────────────┐   ┌─────┴─────┐   ┌──────────┴────────────┐ │
│  │ Prompt Builder│──▶│ callOpenAI │──▶│ JSON Parse + Validate │ │
│  │ (system+user) │   │           │   │ (superRefine 3-6)     │ │
│  └───────────────┘   └───────────┘   └────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Shared Libraries (pnpm workspace)             │
│  ┌──────────────┐  ┌───────────────┐  ┌───────────────────────┐ │
│  │ api-spec     │  │ api-zod       │  │ api-client-react      │ │
│  │ (OpenAPI     │  │ (generated    │  │ (generated hooks,     │ │
│  │  YAML)       │──▶│ Zod schemas) │  │  TS types, fetch)     │ │
│  └──────────────┘  └───────────────┘  └───────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend Framework | React 19 | Component-based UI with hooks |
| Build Tool | Vite | Fast HMR, ESM-native bundling |
| Language | TypeScript | Full-stack type safety |
| Styling | Tailwind CSS v4 | Utility-first dark theme |
| Animation | Framer Motion | Card entry animations, accordion transitions |
| Icons | Lucide React | Consistent icon set |
| API Server (Node) | Express 5 | REST API with middleware pipeline |
| API Server (Python) | FastAPI | Python REST API with Pydantic validation |
| AI Model | OpenAI GPT-4o-mini | Structured JSON generation |
| Validation (Node) | Zod v3 | Runtime schema validation (request + response) |
| Validation (Python) | Pydantic v2 | Python-native data models with validators |
| API Design | OpenAPI 3.1 | Single source of truth for contracts |
| Codegen | Orval | Generates Zod schemas + React Query hooks |
| Server State | TanStack Query v5 | Mutation management with caching |
| Routing | Wouter | Lightweight client-side router |
| Logging | Pino | Structured JSON logging |
| Package Manager | pnpm | Workspace monorepo with shared deps |
| Syntax Highlighting | react-syntax-highlighter | JSON output viewer |

## Key Features

- **9-field Jira ticket form** with pre-populated sample data (APP-1024)
- **3–6 structured test cases** per generation, covering positive/negative/edge cases
- **Full type safety** — OpenAPI spec → Zod schemas → TypeScript types → React Query hooks
- **Dual validation** — Request validated on entry, LLM output validated before return
- **Premium dark UI** — Gradient accents, blur effects, staggered animations
- **Collapsible test cards** — Preconditions, steps, test data, expected results
- **Raw JSON inspector** — Syntax-highlighted expandable output panel
- **Architecture panel** — System overview with roadmap
- **Dual backends** — Node.js (Express + Zod) and Python (FastAPI + Pydantic) running simultaneously
- **Backend switcher** — Toggle between backends at runtime from the UI header, persisted in localStorage

## Pydantic vs Zod — When to Use Which

| Aspect | Zod (Node.js) | Pydantic (Python) |
|--------|---------------|-------------------|
| Language | TypeScript/JavaScript | Python |
| Best With | Express, Next.js, tRPC | FastAPI, LangChain, Python workers |
| Codegen | Generated from OpenAPI via Orval | Hand-written to match spec |
| Validation Style | Schema-first, `.safeParse()` | Model-first, `model_validate()` |
| Custom Rules | `.superRefine()` callbacks | `@model_validator` / `@field_validator` |
| Serialization | Manual `JSON.stringify` | Built-in `.model_dump()` / `.model_dump_json()` |
| AI/LLM Pipelines | Good — works with OpenAI SDK | Excellent — native to LangChain, instructor |
| Type Safety | Inferred via `z.infer<>` | Native Python type hints |

**Use Pydantic when:** your backend is Python, you use FastAPI, you want Python-native data models, your AI orchestration layer is Python-heavy (LangChain, instructor, etc.)

**Use Zod when:** your backend is TypeScript/Node.js, you want OpenAPI codegen integration, you need browser-side validation, or you want a unified JS/TS stack.

This project implements **both** so you can compare the same validation pipeline side-by-side.

## Project Structure

```
├── lib/
│   ├── api-spec/          # OpenAPI 3.1 YAML specification
│   ├── api-zod/           # Generated Zod validation schemas
│   └── api-client-react/  # Generated React Query hooks + TypeScript types
├── artifacts/
│   ├── api-server/        # Express 5 backend (Node.js)
│   │   └── src/
│   │       ├── openai.ts      # Lazy OpenAI client wrapper
│   │       ├── prompt.ts      # System + user prompt builders
│   │       └── routes/
│   │           ├── generate.ts # POST /api/generate endpoint
│   │           └── health.ts   # GET /api/healthz endpoint
│   ├── api-server-python/     # FastAPI backend (Python)
│   │   ├── main.py            # FastAPI app + routes (same /api/* contract)
│   │   ├── models.py          # Pydantic v2 models (JiraTicket, TestCase, etc.)
│   │   ├── openai_client.py   # Lazy OpenAI client (same pattern as Node.js)
│   │   └── prompt.py          # System + user prompt builders (Python port)
│   └── ai-jira-qa-copilot/   # React frontend
│       └── src/
│           ├── pages/Home.tsx              # Main 3-column layout
│           └── components/
│               ├── TestCaseCard.tsx         # Expandable test case card
│               ├── BackendSwitcher.tsx      # Node.js ↔ Python toggle
│               └── ArchitecturePanel.tsx    # System architecture sidebar
```

---

## Build Tutorial — Step by Step

### Step 1: OpenAPI-First Design

The foundation is a single YAML specification (`lib/api-spec/openapi.yaml`) that defines the entire API contract. Instead of writing types by hand, everything is generated from this spec.

**Two endpoints:**
- `GET /api/healthz` — Health check
- `POST /api/generate` — QA test case generation

**Four schemas:**
- **JiraTicket** (request): 9 fields — ticket_id, summary, description, acceptance_criteria, issue_type, priority, component, labels, environment
- **TestCase**: 9 fields — test_case_id, test_scenario, preconditions, test_steps, test_data, expected_result, priority (nullable enum), automation_candidate, tags
- **GenerateTestCasesResponse**: ticket_id + summary + array of TestCases (minItems: 3, maxItems: 6)
- **ErrorResponse**: Structured error format for all failure cases

**Codegen command:**
```bash
pnpm --filter @workspace/api-spec run codegen
```

This generates:
- `lib/api-zod/` → Zod schemas (`GenerateTestCasesBody`, `GenerateTestCasesResponse`)
- `lib/api-client-react/` → React Query hook (`useGenerateTestCases`) + TypeScript interfaces (`JiraTicket`, `TestCase`, etc.)

**Why this matters:** A single source of truth eliminates type drift between frontend and backend. When you change the API contract, you regenerate everything — no manual syncing.

---

### Step 2: OpenAI Integration — Model Selection & Client Design

**File:** `artifacts/api-server-python/openai_client.py`

**Model choice: GPT-4o-mini**
| Factor | Decision |
|--------|----------|
| Cost | Most cost-effective for structured JSON generation |
| Speed | Fast response times (typically under 3 seconds) |
| Quality | Excellent at following rigid output schemas |
| Temperature | 0.3 — low creativity, high reliability and consistency |
| Response Format | `json_object` mode — native JSON enforcement |

**Lazy singleton pattern (Python):**
```python
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
```

**Why lazy?** If the API key is missing, the health endpoint (`/api/healthz`) still works. The error only surfaces when someone calls `/api/generate`. Critical for deployment health checks — your load balancer can verify the server is alive without a valid OpenAI key.

**Why AsyncOpenAI?** FastAPI runs on an async event loop. Using the synchronous `OpenAI` client would block the loop and prevent concurrent request handling. `AsyncOpenAI` uses `await` natively, so multiple requests can be processed in parallel without thread-pool overhead.

**Safety net — fence stripping:**
```python
def strip_fences(raw: str) -> str:
    result = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.IGNORECASE)
    result = re.sub(r"\s*```\s*$", "", result, flags=re.IGNORECASE)
    return result.strip()
```
Even with JSON mode, some edge cases may produce markdown fences. `strip_fences()` normalizes the response to a clean JSON string.

**Async call flow:**
```python
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
```

---

### Step 3: Prompt Engineering — The Brain of the System

**File:** `artifacts/api-server-python/prompt.py`

The prompt is split into two modular functions:

**System Prompt (persona + rules) — `build_system_prompt()`:**
- Acts as a "senior QA engineer and test architect"
- Must generate 3–6 test cases (enforced by both prompt AND Pydantic `@model_validator`)
- Must cover: positive paths, negative paths, AND edge cases
- Each test step must be atomic (one action per step)
- Expected results must be specific and measurable (not "it works")
- Prefers `automation_candidate: true` unless it requires human judgment
- Defines tag taxonomy: smoke, regression, negative, ui, api, validation, boundary, happy-path, security, performance
- The exact JSON output schema is embedded in the prompt

**User Prompt (dynamic ticket assembly) — `build_user_prompt(ticket)`:**
- Accepts a Pydantic `JiraTicket` model instance
- Assembles only fields that have values (empty fields omitted to save tokens)
- Acceptance criteria are numbered for clarity
- Labels joined as comma-separated list
- Ends with "Return only the JSON object as specified" to reinforce the constraint

**Coverage strategy:**

| Coverage Type | What It Tests | Example |
|---------------|---------------|---------|
| Positive Paths | Happy-path user flows | Upload a valid 2MB JPG image |
| Negative Paths | Invalid input, errors | Upload a 10MB file (exceeds limit) |
| Edge Cases | Boundary conditions | Upload exactly 5MB file (at the limit) |

**Why modular prompts?**
- A/B test different system prompts without touching the API route
- Unit test prompt builders independently
- Swap models by changing only `openai_client.py` — prompts stay the same
- Version-control prompt iterations alongside code

---

### Step 4: Guardrails — Pydantic Validation Pipeline

**File:** `artifacts/api-server-python/main.py` + `artifacts/api-server-python/models.py`

LLMs are non-deterministic — you cannot trust raw output. This is the most critical architectural decision: **validate everything twice**.

**The 6-step pipeline:**
```
Request → [1. Pydantic Input Validation] → [2. Build Prompts] → [3. Call OpenAI]
        → [4. JSON Parse] → [5. Pydantic Output + @model_validator] → [6. Return or Error]
```

**Step 1 — Input validation (Pydantic):**
```python
try:
    ticket = JiraTicket(**body)
except ValidationError as e:
    return JSONResponse(status_code=400, content=ErrorResponse(
        error="Invalid request payload", details=str(e)
    ).model_dump(mode="json"))
```
If `ticket_id` or `summary` is missing, returns 400 with structured error. Pydantic validates types, required fields, and default values automatically from the model definition.

**Step 4 — JSON parsing:**
```python
try:
    parsed = json.loads(raw_json)
except json.JSONDecodeError:
    return JSONResponse(status_code=500, content=ErrorResponse(
        error="LLM returned invalid JSON",
        details="The model did not return parseable JSON. Please try again."
    ).model_dump(mode="json"))
```
Even with JSON mode, `json.loads()` is wrapped in try/except. If the model returns garbage, returns 500 with a human-readable message.

**Step 5 — Output validation with @model_validator:**
```python
class GenerateTestCasesResponse(BaseModel):
    ticket_id: str
    summary: str
    generated_test_cases: list[TestCase]

    @model_validator(mode="after")
    def check_test_case_count(self) -> "GenerateTestCasesResponse":
        count = len(self.generated_test_cases)
        if count < 3 or count > 6:
            raise ValueError(f"Expected 3-6 test cases, got {count}")
        return self
```

**Why @model_validator?** Unlike Zod where codegen doesn't map `minItems`/`maxItems`, Pydantic's `@model_validator` lets us enforce the 3–6 count constraint directly in the model definition. The validation runs automatically when constructing `GenerateTestCasesResponse(**parsed)`.

**model_dump(mode="json"):** Pydantic v2 models may contain Python-specific types like `Enum` instances. Using `model_dump(mode="json")` ensures all values are serialized as JSON-safe primitives (e.g., `"high"` instead of `PriorityEnum.HIGH`).

**Error response strategy:**

| HTTP Code | When | Example |
|-----------|------|---------|
| 400 | Request body fails Pydantic validation | Missing ticket_id |
| 500 (JSON) | LLM returned non-parseable output | Model returns prose |
| 500 (Schema) | LLM output fails Pydantic validation | Missing expected_result field |
| 500 (Catch-all) | OpenAI API errors | Rate limit (429), auth failure |

---

### Step 5: Frontend — React Architecture & Generated Hooks

**File:** `artifacts/ai-jira-qa-copilot/src/pages/Home.tsx`

**Provider stack (App.tsx):**
```
QueryClientProvider → TooltipProvider → WouterRouter → Routes
```

React Query manages all server state. No `useState` for API responses.

**Using the generated hook:**
```typescript
import { useGenerateTestCases } from "@workspace/api-client-react";
import type { GenerateTestCasesResponse, JiraTicket } from "@workspace/api-client-react";

const mutation = useGenerateTestCases();

// Orval wraps the body in { data: payload }
mutation.mutate({ data: payload });

// Derived state — no manual loading/error tracking
const result = mutation.data;            // GenerateTestCasesResponse | undefined
const isGenerating = mutation.isPending; // boolean
const isError = mutation.isError;        // boolean
```

**Why generated hooks?** Zero chance of mismatched types between what the frontend sends and what the backend expects. The hook knows the exact request shape, response shape, and error shape — all from the OpenAPI spec.

**Form data transformation:**

| Form Field | Stored As | Sent As |
|------------|-----------|---------|
| acceptance_criteria | Newline-separated string | string[] (split by \n) |
| labels | Comma-separated string | string[] (split by ,) |
| Empty optional fields | Empty string "" | undefined (omitted from JSON) |

**Layout: 12-column CSS grid**
- Left (3 cols): Jira ticket input form with 9 fields
- Center (6 cols): Generated test case cards with animations
- Right (3 cols): System architecture reference panel (sticky)

---

### Step 6: UI States

| State | Visual | Implementation |
|-------|--------|----------------|
| Empty | Centered prompt with sparkle icon | Shown before first mutation |
| Loading | 3 skeleton cards with pulse animation | `mutation.isPending` (2–5 seconds) |
| Error | Red card with AlertCircle icon | `mutation.isError` with error message |
| Success | Animated test case cards | Rendered from `mutation.data` |

**Test case card features:**
- Staggered entry animation (each card delayed by 100ms × index)
- Priority badges — color-coded: critical=red, high=orange, medium=green, low=gray
- Automation candidacy pill (green "Auto Candidate" or gray "Manual")
- Tag chips (#smoke, #regression, #boundary, etc.)
- 4 collapsible accordion sections: Preconditions, Test Steps, Test Data, Expected Result
- Raw JSON toggle with syntax highlighting (vscDarkPlus theme)

---

### Step 7: Evaluation — What Gets Rejected

| Failure Mode | Caught At | Response |
|-------------|-----------|----------|
| Missing ticket_id in request | Step 1 (Pydantic input) | 400 + validation details |
| Model returns prose instead of JSON | Step 4 (json.loads) | 500 + "LLM returned invalid JSON" |
| Model returns 1 test case | Step 5 (@model_validator) | 500 + "Expected 3-6 test cases" |
| Model omits expected_result | Step 5 (Pydantic model) | 500 + schema validation error |
| Model sets priority: "urgent" | Step 5 (PriorityEnum) | 500 + invalid enum value |
| OpenAI rate limit (429) | Step 3 (except) | 500 + rate limit message |

**Only clean data reaches the frontend.** Only responses with exactly 3–6 test cases, each with all 9 fields correctly typed, pass through.

---

### Step 8: Scalability Considerations

| Concern | Current Approach | Production Enhancement |
|---------|-----------------|----------------------|
| Horizontal Scaling | Stateless API (no sessions) | Run N instances behind load balancer |
| Rate Limiting | OpenAI built-in limits | Add express-rate-limit per user |
| Caching | None | Redis cache keyed on ticket hash |
| Batch Processing | Single ticket per request | Extend prompt module for batching |
| Model Swapping | GPT-4o-mini hardcoded | Environment variable for model |
| Export | JSON response only | Add XRAY, Zephyr, TestRail export |

**Production checklist:**
1. Add authentication middleware (JWT or session-based)
2. Add request rate limiting per user
3. Add response caching (Redis)
4. Add structured logging (already using Pino)
5. Add monitoring/alerting on 500 error rates
6. Add retry logic with exponential backoff for OpenAI 429s
7. Add request queuing for high-traffic scenarios

---

## How to Download & Run from GitHub

### Prerequisites
- Node.js 20+ installed
- pnpm installed (`npm install -g pnpm`)
- Python 3.12+ installed (for the Python backend)
- An OpenAI API key with credits (from platform.openai.com)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/asif786ka/asif-ai-jira-qa-copilot.git
cd asif-ai-jira-qa-copilot

# 2. Install all dependencies
pnpm install
pip install fastapi uvicorn openai pydantic

# 3. Set your OpenAI API key
export OPENAI_API_KEY=sk-your-key-here

# 4. Start the Node.js API server (Terminal 1)
export PORT=8080
pnpm --filter @workspace/api-server run dev

# 5. Start the Python API server (Terminal 2)
cd artifacts/api-server-python
PORT=5000 python main.py

# 6. Start the frontend (Terminal 3)
export PORT=3000
export BASE_PATH=/
pnpm --filter @workspace/ai-jira-qa-copilot run dev

# 7. Open http://localhost:3000 in your browser
# 8. Use the backend switcher in the header to toggle between Node.js and Python
```

### Troubleshooting
- **429 errors:** Your OpenAI account needs credits — add billing at platform.openai.com
- **Codegen issues:** Run `pnpm --filter @workspace/api-spec run codegen`
- **Stale types:** Rebuild declarations with `npx tsc --build` in lib/api-zod and lib/api-client-react
- **Python backend not starting:** Ensure Python 3.12+ is installed and `pip install fastapi uvicorn openai pydantic` ran successfully

---

## Deployment Guide — Vercel vs AWS

### Recommendation

| | Vercel (Recommended) | AWS |
|---|---|---|
| Best for | Fast deployment, zero DevOps | Full control, enterprise compliance |
| Cost | Free tier available | Pay-per-use (EC2/ECS/Lambda) |
| Difficulty | Easy | Moderate to Advanced |
| Time to deploy | ~10 minutes | 30–60 minutes |
| HTTPS | Automatic | Manual (ACM + ALB/CloudFront) |
| CDN | Built-in | CloudFront setup required |

**Start with Vercel, migrate to AWS only when you need** VPC isolation, enterprise compliance (HIPAA/SOC2), custom infrastructure (Redis, queues), or multi-region control.

---

### Option A: Deploy to Vercel

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Create `vercel.json` in the project root
```json
{
  "buildCommand": "pnpm install && pnpm --filter @workspace/ai-jira-qa-copilot run build && pnpm --filter @workspace/api-server run build",
  "outputDirectory": "artifacts/ai-jira-qa-copilot/dist/public",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Step 3: Set environment variables
```bash
vercel env add OPENAI_API_KEY     # Your OpenAI key
vercel env add PORT               # 8080
vercel env add BASE_PATH          # /
```

#### Step 4: Deploy
```bash
vercel login
vercel          # Preview deployment
vercel --prod   # Production deployment
```

**What Vercel gives you:**
- Automatic HTTPS with custom domain support
- Global CDN for the React frontend
- Serverless functions for the Express API
- Automatic deployments on git push
- Preview deployments for pull requests

---

### Option B: Deploy to AWS

**Architecture:**
```
CloudFront (CDN) → S3 (React static files)
                 → ALB → ECS Fargate (Express API)
                      → Secrets Manager (OPENAI_API_KEY)
```

#### Step 1: Build both artifacts
```bash
pnpm --filter @workspace/ai-jira-qa-copilot run build
pnpm --filter @workspace/api-server run build
```

#### Step 2: Deploy frontend to S3 + CloudFront
```bash
aws s3 mb s3://asif-ai-jira-qa-copilot
aws s3 sync artifacts/ai-jira-qa-copilot/dist/public s3://asif-ai-jira-qa-copilot --delete
# Create CloudFront distribution pointing to S3
# Set error page 404 → /index.html with 200 status (SPA routing)
```

#### Step 3: Deploy API to ECS Fargate

Create a `Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY artifacts/api-server/dist/ ./dist/
COPY artifacts/api-server/package.json ./
COPY node_modules/ ./node_modules/
ENV PORT=8080
EXPOSE 8080
CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
```

Build and push:
```bash
docker build -t asif-ai-qa-copilot-api .
aws ecr create-repository --repository-name asif-ai-qa-copilot-api
docker tag asif-ai-qa-copilot-api:latest YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/asif-ai-qa-copilot-api
docker push YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/asif-ai-qa-copilot-api
# Create ECS service with Fargate launch type
# Set OPENAI_API_KEY via AWS Secrets Manager
```

**AWS cost estimate:**
- S3 + CloudFront: ~$1–5/month (low traffic)
- ECS Fargate: ~$15–30/month (0.25 vCPU, 0.5 GB RAM)
- Alternative: AWS Lambda + API Gateway for serverless API (~$0.50–5/month)

---

## The Complete Pipeline (Summary)

```
User fills form → Submit
  ↓
Frontend transforms form → JiraTicket payload
  ↓
useGenerateTestCases() → POST /api/generate
  ↓
[Pydantic validates request body (JiraTicket model)]
  ↓
[build_system_prompt() + build_user_prompt(ticket)]
  ↓
[call_openai() → AsyncOpenAI → GPT-4o-mini with JSON mode]
  ↓
[json.loads() the raw response]
  ↓
[Pydantic validates output + @model_validator count check]
  ↓
Return validated GenerateTestCasesResponse.model_dump(mode="json")
  ↓
Frontend renders animated TestCaseCards
```

Every layer has a specific job. If any layer fails, it returns a structured error instead of crashing or showing garbage. That's the philosophy: **fail explicitly, never silently.**

## API Reference

### `POST /api/generate`

**Request Body** (`JiraTicket`):
```json
{
  "ticket_id": "APP-1024",
  "summary": "User can update profile picture",
  "description": "Add support for changing profile image...",
  "acceptance_criteria": ["User can upload JPG/PNG", "Max 5 MB"],
  "issue_type": "story",
  "priority": "high",
  "component": "profile",
  "labels": ["ui", "upload"],
  "environment": "staging"
}
```

**Response** (`GenerateTestCasesResponse`):
```json
{
  "ticket_id": "APP-1024",
  "summary": "User can update profile picture",
  "generated_test_cases": [
    {
      "test_case_id": "TC-001",
      "test_scenario": "Upload valid JPG profile image",
      "preconditions": ["User is logged in", "User is on settings page"],
      "test_steps": ["Click profile picture", "Select valid JPG file", "Click Save"],
      "test_data": ["sample.jpg (2 MB)"],
      "expected_result": "Profile picture updates and displays the new image",
      "priority": "high",
      "automation_candidate": true,
      "tags": ["happy-path", "smoke", "ui"]
    }
  ]
}
```

## License

MIT
