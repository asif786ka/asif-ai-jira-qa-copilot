/**
 * @module openai
 * @description OpenAI client wrapper with lazy initialization and response sanitization.
 *
 * Architecture Decision:
 * - Uses lazy singleton pattern to defer client creation until the first API call.
 *   This prevents boot-time failures when OPENAI_API_KEY is missing, allowing the
 *   health endpoint (/api/healthz) to remain operational independently.
 * - Temperature is set to 0.3 for deterministic, structured output generation.
 * - response_format: json_object enforces native JSON mode, eliminating most
 *   markdown fence wrapping — stripFences acts as a safety net.
 *
 * @author Asif
 */

import OpenAI from "openai";

/** Singleton OpenAI client instance — created on first use */
let _client: OpenAI | null = null;

/**
 * Returns the OpenAI client, creating it lazily on first invocation.
 * Throws a descriptive error if the API key is not configured.
 */
function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env["OPENAI_API_KEY"];
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required.");
    }
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

/**
 * Strips optional markdown code fences from LLM output.
 * Even with json_object mode, some models occasionally wrap output in ```json blocks.
 * This normalizes the response to a clean JSON string.
 */
function stripFences(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

/**
 * Sends a structured chat completion request to GPT-4o-mini.
 *
 * @param systemPrompt - The system-level instruction defining QA generation rules
 * @param userPrompt - The user-level prompt containing the Jira ticket context
 * @returns Raw JSON string from the model, with any fences stripped
 *
 * @example
 * const json = await callOpenAI(buildSystemPrompt(), buildUserPrompt(ticket));
 * const parsed = JSON.parse(json);
 */
export async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const client = getClient();

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const raw = completion.choices[0]?.message?.content ?? "";
  return stripFences(raw);
}
