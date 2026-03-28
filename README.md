# Asif AI Jira QA Copilot

A full-stack TypeScript web application that accepts Jira-style ticket input and uses OpenAI (GPT-4o-mini) to generate 3–6 structured QA test cases per ticket.

Demonstrates **OpenAPI-first design**, **Zod validation**, **generated React Query hooks**, and **modular prompt engineering** with a premium dark-themed UI.

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
| API Server | Express 5 | REST API with middleware pipeline |
| AI Model | OpenAI GPT-4o-mini | Structured JSON generation |
| Validation | Zod v3 | Runtime schema validation (request + response) |
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

## Project Structure

```
├── lib/
│   ├── api-spec/          # OpenAPI 3.1 YAML specification
│   ├── api-zod/           # Generated Zod validation schemas
│   └── api-client-react/  # Generated React Query hooks + TypeScript types
├── artifacts/
│   ├── api-server/        # Express 5 backend
│   │   └── src/
│   │       ├── openai.ts      # Lazy OpenAI client wrapper
│   │       ├── prompt.ts      # System + user prompt builders
│   │       └── routes/
│   │           ├── generate.ts # POST /api/generate endpoint
│   │           └── health.ts   # GET /api/healthz endpoint
│   └── ai-jira-qa-copilot/   # React frontend
│       └── src/
│           ├── pages/Home.tsx          # Main 3-column layout
│           └── components/
│               ├── TestCaseCard.tsx     # Expandable test case card
│               └── ArchitecturePanel.tsx # System architecture sidebar
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

**File:** `artifacts/api-server/src/openai.ts`

**Model choice: GPT-4o-mini**
| Factor | Decision |
|--------|----------|
| Cost | Most cost-effective for structured JSON generation |
| Speed | Fast response times (typically under 3 seconds) |
| Quality | Excellent at following rigid output schemas |
| Temperature | 0.3 — low creativity, high reliability and consistency |
| Response Format | `json_object` mode — native JSON enforcement |

**Lazy singleton pattern:**
```typescript
let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env["OPENAI_API_KEY"];
    if (!apiKey) throw new Error("OPENAI_API_KEY required");
    _client = new OpenAI({ apiKey });
  }
  return _client;
}
```

**Why lazy?** If the API key is missing, the health endpoint (`/api/healthz`) still works. The error only surfaces when someone calls `/api/generate`. Critical for deployment health checks — your load balancer can verify the server is alive without a valid OpenAI key.

**Safety net — fence stripping:**
Even with JSON mode, some edge cases may produce markdown fences. `stripFences()` normalizes the response to a clean JSON string as a safety net.

---

### Step 3: Prompt Engineering — The Brain of the System

**File:** `artifacts/api-server/src/prompt.ts`

The prompt is split into two modular parts:

**System Prompt (persona + rules):**
- Acts as a "senior QA engineer and test architect"
- Must generate 3–6 test cases (enforced by both prompt AND Zod)
- Must cover: positive paths, negative paths, AND edge cases
- Each test step must be atomic (one action per step)
- Expected results must be specific and measurable (not "it works")
- Prefers `automation_candidate: true` unless it requires human judgment
- Defines tag taxonomy: smoke, regression, negative, ui, api, validation, boundary, happy-path, security, performance
- The exact JSON output schema is embedded in the prompt

**User Prompt (dynamic ticket assembly):**
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
- Swap models by changing only `openai.ts` — prompts stay the same
- Version-control prompt iterations alongside code

---

### Step 4: Guardrails — Dual Validation Pipeline

**File:** `artifacts/api-server/src/routes/generate.ts`

LLMs are non-deterministic — you cannot trust raw output. This is the most critical architectural decision: **validate everything twice**.

**The 6-step pipeline:**
```
Request → [1. Zod Input Validation] → [2. Build Prompts] → [3. Call OpenAI]
        → [4. JSON Parse] → [5. Zod Output + superRefine] → [6. Return or Error]
```

**Step 1 — Input validation:**
```typescript
const parseResult = GenerateTestCasesBody.safeParse(req.body);
```
If `ticket_id` or `summary` is missing, returns 400 with structured error.

**Step 4 — JSON parsing:**
Even with JSON mode, `JSON.parse()` is wrapped in try/catch. If the model returns garbage, returns 500 with a human-readable message.

**Step 5 — Output validation with superRefine:**
```typescript
const StrictGenerateTestCasesResponse = GenerateTestCasesResponse.superRefine(
  (val, ctx) => {
    const count = val.generated_test_cases.length;
    if (count < 3 || count > 6) {
      ctx.addIssue({
        code: "custom",
        path: ["generated_test_cases"],
        message: `Expected 3-6 test cases, got ${count}`,
      });
    }
  },
);
```

**Why superRefine?** Orval's codegen does NOT map OpenAPI `minItems`/`maxItems` to Zod `.min()`/`.max()`. So we add the 3–6 count constraint manually at runtime.

**Error response strategy:**

| HTTP Code | When | Example |
|-----------|------|---------|
| 400 | Request body fails Zod validation | Missing ticket_id |
| 500 (JSON) | LLM returned non-parseable output | Model returns prose |
| 500 (Schema) | LLM output fails structural validation | Missing expected_result field |
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
| Missing ticket_id in request | Step 1 (Zod input) | 400 + validation details |
| Model returns prose instead of JSON | Step 4 (JSON parse) | 500 + "LLM returned invalid JSON" |
| Model returns 1 test case | Step 5 (superRefine) | 500 + "Expected 3-6 test cases" |
| Model omits expected_result | Step 5 (Zod schema) | 500 + schema validation error |
| Model sets priority: "urgent" | Step 5 (Zod enum) | 500 + invalid enum value |
| OpenAI rate limit (429) | Step 3 (catch) | 500 + rate limit message |

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
- An OpenAI API key with credits (from platform.openai.com)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/asif786ka/asif-ai-jira-qa-copilot.git
cd asif-ai-jira-qa-copilot

# 2. Install all dependencies
pnpm install

# 3. Set your OpenAI API key
export OPENAI_API_KEY=sk-your-key-here

# 4. Start the API server (Terminal 1)
export PORT=8080
pnpm --filter @workspace/api-server run dev

# 5. Start the frontend (Terminal 2)
export PORT=3000
export BASE_PATH=/
pnpm --filter @workspace/ai-jira-qa-copilot run dev

# 6. Open http://localhost:3000 in your browser
```

### Troubleshooting
- **429 errors:** Your OpenAI account needs credits — add billing at platform.openai.com
- **Codegen issues:** Run `pnpm --filter @workspace/api-spec run codegen`
- **Stale types:** Rebuild declarations with `npx tsc --build` in lib/api-zod and lib/api-client-react

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
[Zod validates request body]
  ↓
[buildSystemPrompt() + buildUserPrompt(ticket)]
  ↓
[callOpenAI() → GPT-4o-mini with JSON mode]
  ↓
[JSON.parse() the raw response]
  ↓
[Zod validates output + superRefine count check]
  ↓
Return validated GenerateTestCasesResponse
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
