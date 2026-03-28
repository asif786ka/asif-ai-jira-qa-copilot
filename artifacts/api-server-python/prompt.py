from models import JiraTicket


def build_system_prompt() -> str:
    return """You are a senior QA engineer and test architect. Your job is to generate comprehensive, executable QA test cases from Jira-style tickets.

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
}"""


def build_user_prompt(ticket: JiraTicket) -> str:
    lines: list[str] = []

    lines.append("Generate QA test cases for the following Jira ticket:")
    lines.append("")
    lines.append(f"Ticket ID: {ticket.ticket_id}")
    lines.append(f"Summary: {ticket.summary}")

    if ticket.issue_type and ticket.issue_type.strip():
        lines.append(f"Issue Type: {ticket.issue_type}")
    if ticket.priority and ticket.priority.strip():
        lines.append(f"Priority: {ticket.priority}")
    if ticket.component and ticket.component.strip():
        lines.append(f"Component: {ticket.component}")
    if ticket.labels and len(ticket.labels) > 0:
        lines.append(f"Labels: {', '.join(ticket.labels)}")
    if ticket.environment and ticket.environment.strip():
        lines.append(f"Environment: {ticket.environment}")
    if ticket.description and ticket.description.strip():
        lines.append("")
        lines.append("Description:")
        lines.append(ticket.description)
    if ticket.acceptance_criteria and len(ticket.acceptance_criteria) > 0:
        lines.append("")
        lines.append("Acceptance Criteria:")
        for i, ac in enumerate(ticket.acceptance_criteria):
            lines.append(f"  {i + 1}. {ac}")

    lines.append("")
    lines.append("Return only the JSON object as specified.")

    return "\n".join(lines)
