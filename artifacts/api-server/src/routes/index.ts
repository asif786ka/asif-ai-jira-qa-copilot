/**
 * @module routes/index
 * @description Central route aggregator. Mounts all API route modules
 * under the /api prefix (configured in app.ts).
 *
 * Route Registry:
 * - GET  /api/healthz   — Health check (health.ts)
 * - POST /api/generate  — QA test case generation (generate.ts)
 *
 * @author Asif
 */

import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import generateRouter from "./generate.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(generateRouter);

export default router;
