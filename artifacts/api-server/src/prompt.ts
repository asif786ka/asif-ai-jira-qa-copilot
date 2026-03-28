/**
 * @module prompt
 * @description Modular prompt engineering for QA test case generation.
 *
 * Architecture Decision:
 * - Prompts are separated from the API route to enable independent testing,
 *   versioning, and future A/B experimentation of prompt strategies.
 * - The system prompt defines rigid output constraints (JSON schema, tag taxonomy,
 *   coverage rules) to maximize Zod validation pass rates.
 * - The user prompt dynamically assembles ticket context, omitting empty fields
 *   to reduce token waste and improve model focus.
 *
 * Coverage Strategy:
 * - Positive paths: Happy-path user flows that exercise core acceptance criteria
 * - Negative paths: Invalid input, permission errors, boundary violations
 * - Edge cases: Empty states, max-length inputs, concurrent operations
 *
 * @author Asif
 */

/**
 * Internal interface representing the Jira ticket data
 * used to construct the user prompt.
 */
interface TicketData {
  ticket_id: string;
  summary: string;
  description?: string;
  acceptance_criteria?: string[];
  issue_type?: string;
  priority?: string;
  component?: string;
  labels?: string[];
  environment?: string;
}

/**
 * Builds the system prompt that instructs GPT-4o-mini to act as a
 * senior QA architect. Defines:
 * - Test case count constraints (3-6)
 * - Coverage requirements (positive, negative, edge cases)
 * - Output JSON schema with all 9 TestCase fields
 * - Tag taxonomy for categorization
 * - Strict JSON-only output rules (no markdown, no prose)
 */
export function buildSystemPrompt(): string {
  return `You are a senior QA engineer and test architect. Your job is to generate comprehensive, executable QA test cases from Jira-style tickets.

Rules:
- Generate between 3 and 6 strong test cases
- Cover positive paths, negative paths, and edge cases
- Keep test steps concise but executable (each step should be an atomic action)
- Expected results must be specific and measurable — never vague
- Prefer automation_candidate = true unless the test requires human judgment (e.g. visual inspection, exploratory)
- Use tags from this set where appropriate: smoke, regression, negative, ui, api, validation, boundary, happy-path, security, performance
- Return ONLY valid JSON — no markdown, no explanation, no code fences, no prose

Output shape (strict JSON):
{
  "ticket_id": "string",
  "summary": "string",
  "generated_test_cases": [
    {
      "test_case_id": "string (TC-001 format)",
      "test_scenario": "string (short descriptive scenario title)",
      "preconditions": ["string"],
      "test_steps": ["string (numbered step descriptions without the number prefix)"],
      "test_data": ["string"],
      "expected_result": "string",
      "priority": "low" | "medium" | "high" | "critical" | null,
      "automation_candidate": true | false,
      "tags": ["string"]
    }
  ]
}`;
}

/**
 * Builds the user prompt by dynamically assembling all provided ticket fields.
 * Empty/undefined fields are omitted to keep the prompt concise and focused.
 *
 * @param ticket - The validated Jira ticket data from the request body
 * @returns Formatted multi-line prompt string ready for the LLM
 */
export function buildUserPrompt(ticket: TicketData): string {
  const lines: string[] = [];

  lines.push(`Generate QA test cases for the following Jira ticket:`);
  lines.push(``);
  lines.push(`Ticket ID: ${ticket.ticket_id}`);
  lines.push(`Summary: ${ticket.summary}`);

  if (ticket.issue_type) {
    lines.push(`Issue Type: ${ticket.issue_type}`);
  }
  if (ticket.priority) {
    lines.push(`Priority: ${ticket.priority}`);
  }
  if (ticket.component) {
    lines.push(`Component: ${ticket.component}`);
  }
  if (ticket.labels && ticket.labels.length > 0) {
    lines.push(`Labels: ${ticket.labels.join(", ")}`);
  }
  if (ticket.environment) {
    lines.push(`Environment: ${ticket.environment}`);
  }
  if (ticket.description) {
    lines.push(``);
    lines.push(`Description:`);
    lines.push(ticket.description);
  }
  if (ticket.acceptance_criteria && ticket.acceptance_criteria.length > 0) {
    lines.push(``);
    lines.push(`Acceptance Criteria:`);
    ticket.acceptance_criteria.forEach((ac, i) => {
      lines.push(`  ${i + 1}. ${ac}`);
    });
  }

  lines.push(``);
  lines.push(`Return only the JSON object as specified.`);

  return lines.join("\n");
}
