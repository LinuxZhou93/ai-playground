import { ModelService, ModelServiceError } from "./model-service.mjs";

const service = new ModelService(process.env);
const windows = new Map();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 16;

function json(response, status, value) {
  response.status(status);
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.send(JSON.stringify(value));
}

function allowedOrigin(request) {
  const origin = String(request.headers.origin || "");
  if (!origin) return true;
  try {
    const host = new URL(origin).hostname;
    return host === "zhouxiaomai.com"
      || host.endsWith(".zhouxiaomai.com")
      || host === "127.0.0.1"
      || host === "localhost"
      || host.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

function withinRateLimit(request) {
  const now = Date.now();
  const ip = String(request.headers["x-forwarded-for"] || request.socket?.remoteAddress || "unknown").split(",")[0].trim();
  const current = windows.get(ip);
  if (!current || now - current.startedAt >= WINDOW_MS) {
    windows.set(ip, { startedAt: now, count: 1 });
    return true;
  }
  current.count += 1;
  return current.count <= MAX_REQUESTS;
}

export default async function handler(request, response) {
  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }
  if (!allowedOrigin(request)) {
    json(response, 403, { error: { code: "ORIGIN_NOT_ALLOWED", message: "请求来源不允许" } });
    return;
  }
  if (!withinRateLimit(request)) {
    json(response, 429, { error: { code: "RATE_LIMITED", message: "本轮创作请求较多，请稍后继续" } });
    return;
  }

  try {
    const route = String(request.query?.route || "");
    if (request.method === "GET" && route === "status") {
      json(response, 200, await service.getStatus());
      return;
    }
    if (request.method === "POST" && route === "tasks") {
      const body = typeof request.body === "string" ? JSON.parse(request.body) : request.body || {};
      if (!body.kind || typeof body.payload !== "object") {
        json(response, 400, { error: { code: "INVALID_TASK", message: "模型任务格式不正确" } });
        return;
      }
      const result = await service.create(body.kind, body.payload);
      json(response, 200, result);
      return;
    }
    json(response, 404, { error: { code: "NOT_FOUND", message: "接口不存在" } });
  } catch (error) {
    const known = error instanceof ModelServiceError;
    json(response, known ? error.httpStatus : 500, {
      error: {
        code: known ? error.code : "MODEL_GATEWAY_ERROR",
        message: known ? error.message : "模型服务暂时不可用",
      },
    });
  }
}
