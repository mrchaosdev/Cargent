import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { Agent } from "../agent/agent.js";
import { Logger } from "../core/logger.js";
import { config } from "../core/config.js";

const PORT = Number(process.env.PORT) || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

const logger = Logger.getInstance();
const agent = new Agent();

let initialized = false;

async function ensureAgent(): Promise<void> {
  if (initialized) return;
  try {
    await agent.initialize();
    initialized = true;
    logger.info("Agent initialized for HTTP server");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("Failed to initialize agent", message);
    throw err;
  }
}

function sendSSE(res: ServerResponse, event: string, data: unknown): void {
  const line = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  res.write(line);
}

function sendError(res: ServerResponse, message: string): void {
  sendSSE(res, "ERROR", { content: message });
}

function sendDone(res: ServerResponse): void {
  sendSSE(res, "DONE", {});
}

async function handleChat(req: IncomingMessage, res: ServerResponse): Promise<void> {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Access-Control-Allow-Origin", CORS_ORIGIN);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Request-Id");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  try {
    await ensureAgent();
  } catch {
    res.writeHead(503, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Agent not ready" }));
    return;
  }

  let body = "";
  req.on("data", (chunk) => { body += chunk; });
  req.on("end", async () => {
    try {
      const payload = JSON.parse(body) as { agentId?: unknown; message?: unknown; threadId?: unknown };
      const agentId = (payload.agentId ?? "chaospay") as string;
      const message = payload.message;
      const threadId = payload.threadId as string | undefined;

      if (typeof message !== "string" || !message.trim()) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Message is required" }));
        return;
      }

      logger.info(`[chat] agent=${agentId} thread=${threadId ?? "-"}`);
      sendSSE(res, "MESSAGE", { content: "Thinking…" });

      const response = await agent.process(message.trim());
      const parts = response.text.split(/(\s+)/);
      for (const part of parts) {
        sendSSE(res, "MESSAGE", { content: part });
        await new Promise((r) => setTimeout(r, 15));
      }

      if (response.skills && response.skills.length > 0) {
        sendSSE(res, "MESSAGE", { content: `\n[Skills: ${response.skills.join(", ")}]` });
      }

      sendDone(res);
      res.end();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      logger.error("[chat] error", message);
      sendError(res, message);
      sendDone(res);
      res.end();
    }
  });
}

async function main(): Promise<void> {
  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url ?? "/";

    if (url === "/api/agent/chat") {
      await handleChat(req, res);
      return;
    }

    if (url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", agentReady: initialized }));
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  });

  server.listen(PORT, "0.0.0.0", () => {
    logger.info(`Cagent HTTP server listening on port ${PORT}`);
    logger.info(`Health: http://localhost:${PORT}/health`);
  });

  try {
    await ensureAgent();
  } catch {
    logger.warn("Agent failed to initialize on startup — will retry on first request");
  }

  process.on("SIGTERM", () => { server.close(); process.exit(0); });
  process.on("SIGINT", () => { server.close(); process.exit(0); });
}

main().catch((err) => {
  logger.error("Server failed", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
