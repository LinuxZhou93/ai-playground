import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";

function loadLocalEnv() {
  const envPath = fileURLToPath(new URL("../.env.local", import.meta.url));
  const source = readFileSync(envPath, "utf8");
  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;
    const name = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[name] = value;
  }
}

loadLocalEnv();

// Some workstation shells disable TLS verification globally. The model key must
// never be sent through an unverified HTTPS connection.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";

const { ModelService, ModelServiceError } = await import("../api/model-service.mjs");

const root = fileURLToPath(new URL("..", import.meta.url));
const apiPort = Number(process.env.XMP_MODEL_PORT || 4174);
const webPort = Number(process.env.XMP_WEB_PORT || 4183);
const maxBodyBytes = 28 * 1024 * 1024;
const service = new ModelService(process.env);

function json(response, status, body) {
  response.writeHead(status, {
    "Cache-Control": "no-store, max-age=0",
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(body));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBodyBytes) {
        reject(new ModelServiceError("REQUEST_TOO_LARGE", "请求内容超过 28MB", 413));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch {
        reject(new ModelServiceError("INVALID_JSON", "请求 JSON 无法解析", 400));
      }
    });
    request.on("error", reject);
  });
}

const api = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || "127.0.0.1"}`);
    if (request.method === "GET" && url.pathname === "/v1/status") {
      json(response, 200, await service.getStatus());
      return;
    }
    if (request.method === "POST" && url.pathname === "/v1/tasks") {
      const body = await readJson(request);
      if (!body.kind || typeof body.payload !== "object") {
        json(response, 400, { error: { code: "INVALID_TASK", message: "模型任务格式不正确" } });
        return;
      }
      json(response, 200, await service.create(body.kind, body.payload));
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
});

await new Promise((resolve, reject) => {
  api.once("error", reject);
  api.listen(apiPort, "127.0.0.1", resolve);
});

const vite = await createViteServer({
  root,
  configFile: fileURLToPath(new URL("../vite.config.mjs", import.meta.url)),
  server: { port: webPort, strictPort: true },
});

try {
  await vite.listen();
  const status = await service.getStatus();
  console.log(`本地触屏页面：http://127.0.0.1:${webPort}/`);
  console.log(`本地模型网关：http://127.0.0.1:${apiPort}/v1/status`);
  console.log(`模型状态：${status.status} · ${status.models.vision || "无识图模型"} · ${status.models.image || "无生图模型"}`);
} catch (error) {
  await new Promise((resolve) => api.close(resolve));
  throw error;
}

async function shutdown() {
  await vite.close();
  await new Promise((resolve) => api.close(resolve));
  process.exit(0);
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
