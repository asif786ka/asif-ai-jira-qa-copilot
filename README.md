# Asif AI Jira QA Copilot

A full-stack TypeScript web application that accepts Jira-style ticket input and uses OpenAI (GPT-4o-mini) to generate 3-6 structured QA test cases per ticket.

Demonstrates **OpenAPI-first design**, **Zod validation**, **generated React Query hooks**, and **modular prompt engineering** with a premium dark-themed UI.

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

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS v4, Framer Motion |
| **Backend** | Express 5, TypeScript, Pino (structured logging) |
| **AI** | OpenAI GPT-4o-mini (JSON mode, temperature 0.3) |
| **Validation** | Zod v3 (generated from OpenAPI via Orval) |
| **API Design** | OpenAPI 3.1 spec → codegen for types, Zod schemas, React Query hooks |
| **State Mgmt** | React Query (TanStack Query v5) |
| **Package Mgmt** | pnpm workspace (monorepo) |

## Key Features

- **9-field Jira ticket form** with pre-populated sample data (APP-1024)
- **3-6 structured test cases** per generation, covering positive/negative/edge cases
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

## Setup

```bash
# Install dependencies
pnpm install

# Set your OpenAI API key
export OPENAI_API_KEY=sk-...

# Run codegen (if modifying the OpenAPI spec)
pnpm --filter @workspace/api-spec run codegen

# Start the API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start the frontend (port 21932)
pnpm --filter @workspace/ai-jira-qa-copilot run dev
```

## API

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

## Author

**Asif** — Senior AI & React Architect

## License

MIT
