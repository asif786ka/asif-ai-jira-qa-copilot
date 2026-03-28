/**
 * @module routes/generate
 * @description POST /api/generate — Core QA test case generation endpoint.
 *
 * Request Pipeline:
 * 1. Validate incoming JiraTicket payload against generated Zod schema
 * 2. Build system + user prompts via the prompt engineering module
 * 3. Call OpenAI GPT-4o-mini with JSON response mode
 * 4. Parse raw JSON string from the LLM response
 * 5. Validate parsed output against GenerateTestCasesResponse schema
 *    with superRefine enforcement of 3-6 test case count constraint
 * 6. Return validated, type-safe response or structured error JSON
 *
 * Error Handling Strategy:
 * - 400: Request body fails Zod validation (malformed ticket data)
 * - 500 (JSON parse): LLM returned non-parseable output
 * - 500 (Schema validation): LLM output parsed but failed structural validation
 * - 500 (Catch-all): OpenAI API errors (rate limits, auth, network)
 *
 * All error responses follow the ErrorResponse schema: { error, details }
 *
 * @author Asif
 */

import { Router, type IRouter, type Request, type Response } from "express";
import { GenerateTestCasesBody, GenerateTestCasesResponse } from "@workspace/api-zod";
import { callOpenAI } from "../openai.js";
import { buildSystemPrompt, buildUserPrompt } from "../prompt.js";
import type { z } from "zod";

/** Inferred TypeScript type from the GenerateTestCasesResponse Zod schema */
type GenerateTestCasesOutput = z.infer<typeof GenerateTestCasesResponse>;

/**
 * Extended validation schema that enforces the 3-6 test case count constraint.
 * Orval's codegen does not map OpenAPI minItems/maxItems to Zod .min()/.max()
 * for arrays, so we apply this business rule via superRefine at runtime.
 */
const StrictGenerateTestCasesResponse = GenerateTestCasesResponse.superRefine(
  (val: GenerateTestCasesOutput, ctx: z.RefinementCtx) => {
    const count = val.generated_test_cases.length;
    if (count < 3 || count > 6) {
      ctx.addIssue({
        code: "custom",
        path: ["generated_test_cases"],
        message: `Expected between 3 and 6 test cases, got ${count}`,
      });
    }
  },
);

const router: IRouter = Router();

/**
 * POST /api/generate
 * Accepts a Jira-style ticket and returns AI-generated QA test cases.
 */
router.post("/generate", async (req: Request, res: Response) => {
  // Step 1: Validate request body against the OpenAPI-generated Zod schema
  const parseResult = GenerateTestCasesBody.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      error: "Invalid request payload",
      details: JSON.stringify(parseResult.error.flatten()),
    });
    return;
  }

  const ticket = parseResult.data;

  try {
    // Step 2: Build structured prompts from the validated ticket data
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(ticket);

    // Step 3: Call OpenAI and receive raw JSON string
    const rawJson = await callOpenAI(systemPrompt, userPrompt);

    // Step 4: Parse the raw JSON — LLM output is not guaranteed to be valid JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      req.log.error({ rawJson }, "OpenAI returned non-JSON response");
      res.status(500).json({
        error: "LLM returned invalid JSON",
        details: "The model did not return parseable JSON. Please try again.",
      });
      return;
    }

    // Step 5: Validate the parsed output against strict schema (including count constraint)
    const validated = StrictGenerateTestCasesResponse.safeParse(parsed);
    if (!validated.success) {
      req.log.error(
        { issues: validated.error.issues, parsed },
        "OpenAI response failed Zod validation",
      );
      res.status(500).json({
        error: "LLM response failed schema validation",
        details: JSON.stringify(validated.error.flatten()),
      });
      return;
    }

    // Step 6: Return the fully validated, type-safe response
    res.json(validated.data);
  } catch (err) {
    req.log.error({ err }, "Error calling OpenAI");
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({
      error: "Failed to generate test cases",
      details: message,
    });
  }
});

export default router;
