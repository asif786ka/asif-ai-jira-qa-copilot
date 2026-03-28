/**
 * @module index
 * @description Application entry point. Reads the PORT environment variable,
 * validates it, and starts the Express HTTP server.
 *
 * The PORT is injected by the runtime environment and must be a positive integer.
 * A descriptive error is thrown on invalid or missing values to fail fast
 * rather than silently binding to a wrong port.
 *
 * @author Asif
 */

import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
