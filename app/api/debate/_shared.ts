type DebateSide = "student" | "ai";

declare const process: {
  env: Record<string, string | undefined>;
};

export type DebateHistoryItem = {
  side: DebateSide;
  text: string;
};

export type DebateRequestBase = {
  topic?: string;
  studentSide?: "pro" | "con";
  history?: DebateHistoryItem[];
};

export type DebateScore = {
  player: { content: number; style: number; strategy: number };
  ai: { content: number; style: number; strategy: number };
  winner: "player" | "ai" | "tie";
  comment: string;
};

const MAX_TOPIC_LENGTH = 180;
const MAX_SPEECH_LENGTH = 1200;
const MAX_HISTORY_ITEMS = 12;

export function jsonError(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}

export function sanitizeText(value: unknown, maxLength = MAX_SPEECH_LENGTH) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function normalizeSide(value: unknown): "pro" | "con" {
  return value === "con" ? "con" : "pro";
}

export function validateBasePayload(payload: DebateRequestBase): {
  topic: string;
  studentSide: "pro" | "con";
  history: DebateHistoryItem[];
} {
  const topic = sanitizeText(payload.topic, MAX_TOPIC_LENGTH);
  if (!topic) throw new Error("请填写辩题。");

  const history: DebateHistoryItem[] = Array.isArray(payload.history)
    ? payload.history.slice(-MAX_HISTORY_ITEMS).map((item) => ({
        side: item?.side === "ai" ? "ai" as const : "student" as const,
        text: sanitizeText(item?.text)
      })).filter((item) => item.text)
    : [];

  return {
    topic,
    studentSide: normalizeSide(payload.studentSide),
    history
  };
}

export function oppositeSide(side: "pro" | "con") {
  return side === "pro" ? "con" : "pro";
}

export function sideLabel(side: "pro" | "con") {
  return side === "pro" ? "正方（支持）" : "反方（反对）";
}

export function modelEnvReady() {
  return Boolean(process.env.DEBATE_MODEL_API_KEY && process.env.DEBATE_GAME_MODEL);
}

export async function callDebateModel(messages: Array<{ role: "system" | "user" | "assistant"; content: string }>) {
  const apiKey = process.env.DEBATE_MODEL_API_KEY;
  const model = process.env.DEBATE_GAME_MODEL;
  const baseUrl = (process.env.DEBATE_MODEL_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");

  if (!apiKey || !model) {
    throw new Error("MODEL_ENV_MISSING");
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error("MODEL_REQUEST_FAILED");
  }

  const data = await response.json();
  return String(data?.choices?.[0]?.message?.content || "").trim();
}

export function demoTurnReply(topic: string, studentSide: "pro" | "con", history: DebateHistoryItem[]) {
  const last = history.filter((item) => item.side === "student").at(-1)?.text || "";
  const aiSide = sideLabel(oppositeSide(studentSide));
  const hasEvidence = /数据|研究|evidence|report|source|证据/i.test(last);
  const hasImpact = /影响|impact|therefore|所以|导致|结果/i.test(last);
  const evidenceLine = hasEvidence
    ? "你提到了证据，但还需要说明来源可信度，以及它如何直接支撑结论。"
    : "你现在更像是在表达立场，还缺少一个清晰证据或例子来支撑机制。";
  const impactLine = hasImpact
    ? "接下来我会比较影响大小：哪一方更直接、更可验证、更难逆转。"
    : "如果没有影响比较，裁判很难判断这个论点为什么重要。";
  return `围绕“${topic}”，作为${aiSide}，我的回应是：${evidenceLine}${impactLine}`;
}

export function demoJudgeScore(history: DebateHistoryItem[]): DebateScore {
  const playerTurns = history.filter((item) => item.side === "student").map((item) => item.text).join(" ");
  const hasEvidence = /数据|研究|evidence|report|source|证据/i.test(playerTurns);
  const hasImpact = /影响|impact|therefore|所以|导致|结果/i.test(playerTurns);
  const player = {
    content: hasEvidence ? 29 : 25,
    style: playerTurns.length > 120 ? 30 : 27,
    strategy: hasImpact ? 15 : 12
  };
  const ai = {
    content: hasEvidence ? 28 : 29,
    style: 29,
    strategy: hasImpact ? 14 : 15
  };
  const playerTotal = player.content + player.style + player.strategy;
  const aiTotal = ai.content + ai.style + ai.strategy;
  return {
    player,
    ai,
    winner: playerTotal > aiTotal ? "player" : aiTotal > playerTotal ? "ai" : "tie",
    comment: "练习反馈：你的表达完成了基本立场和回应。下一步建议补充明确证据来源，并在结尾加入影响比较，让裁判更容易判断论点优先级。"
  };
}

export function normalizeScore(value: unknown): DebateScore {
  const raw = value as Partial<DebateScore> | undefined;
  const clamp = (score: unknown, max: number) => Math.max(0, Math.min(max, Number.parseInt(String(score || 0), 10) || 0));
  const player = {
    content: clamp(raw?.player?.content, 40),
    style: clamp(raw?.player?.style, 40),
    strategy: clamp(raw?.player?.strategy, 20)
  };
  const ai = {
    content: clamp(raw?.ai?.content, 40),
    style: clamp(raw?.ai?.style, 40),
    strategy: clamp(raw?.ai?.strategy, 20)
  };
  const playerTotal = player.content + player.style + player.strategy;
  const aiTotal = ai.content + ai.style + ai.strategy;
  const winner = raw?.winner === "player" || raw?.winner === "ai" || raw?.winner === "tie"
    ? raw.winner
    : playerTotal > aiTotal ? "player" : aiTotal > playerTotal ? "ai" : "tie";

  return {
    player,
    ai,
    winner,
    comment: sanitizeText(raw?.comment, 260) || "本轮评分已生成。"
  };
}

export function extractJson(text: string) {
  const cleaned = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("NO_JSON");
  return JSON.parse(cleaned.slice(start, end + 1));
}
