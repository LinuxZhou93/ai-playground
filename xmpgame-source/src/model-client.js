const wait = (ms, signal) => new Promise((resolve, reject) => {
  const timer = setTimeout(resolve, ms);
  signal?.addEventListener("abort", () => {
    clearTimeout(timer);
    reject(new DOMException("Aborted", "AbortError"));
  }, { once: true });
});

const modelBase = `${import.meta.env?.BASE_URL || "/"}v1`.replace(/\/{2,}/g, "/").replace(/\/$/, "");
const imageFields = ["artworkImage", "sourceImage"];

function loadDataImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });
}

async function compactImage(dataUrl, { preserveAlpha = false } = {}) {
  if (!String(dataUrl || "").startsWith("data:image/")) return dataUrl;
  const image = await loadDataImage(dataUrl);
  const maxWidth = preserveAlpha ? 1366 : 1280;
  const maxHeight = preserveAlpha ? 768 : 1280;
  const scale = Math.min(1, maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d", { alpha: preserveAlpha });
  if (!preserveAlpha) {
    context.fillStyle = "#06122d";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return preserveAlpha
    ? canvas.toDataURL("image/png")
    : canvas.toDataURL("image/jpeg", 0.86);
}

async function compactPayload(payload = {}) {
  const compacted = { ...payload };
  // The UI already holds the source artwork for local fallback rendering.
  // Never duplicate that base64 image in a nested request field.
  delete compacted.fallback;
  await Promise.all(imageFields.map(async (field) => {
    if (!compacted[field]) return;
    compacted[field] = await compactImage(compacted[field], { preserveAlpha: field === "interactionImage" });
  }));
  return compacted;
}

export async function getModelStatus() {
  try {
    const response = await fetch(`${modelBase}/status`, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`STATUS_${response.status}`);
    return await response.json();
  } catch {
    return {
      status: "unreachable",
      capabilities: { text: false, vision: false, image: false, video: false },
      models: {},
    };
  }
}

export async function createModelTask(kind, payload, { signal, timeoutMs = 180000 } = {}) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const preparedPayload = await compactPayload(payload);
    const response = await fetch(`${modelBase}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, payload: preparedPayload }),
      signal: controller.signal,
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error?.code || `MODEL_${response.status}`);
    if (body.status !== "queued") return body;

    while (!controller.signal.aborted) {
      await wait(3000, controller.signal);
      const poll = await fetch(`${modelBase}/tasks/${encodeURIComponent(body.id)}`, { signal: controller.signal });
      const job = await poll.json().catch(() => ({}));
      if (!poll.ok) throw new Error(job.error?.code || `POLL_${poll.status}`);
      if (job.status === "succeeded") return job;
      if (job.status === "failed") throw new Error(job.error?.code || "MODEL_TASK_FAILED");
    }
    throw new DOMException("Aborted", "AbortError");
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}

export async function assetToDataUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`ASSET_${response.status}`);
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
