import {
  callDebateModel,
  demoTurnReply,
  jsonError,
  modelEnvReady,
  oppositeSide,
  sideLabel,
  validateBasePayload
} from "../_shared";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { topic, studentSide, history } = validateBasePayload(payload);
    const rounds = Number.parseInt(String(payload.rounds || 3), 10) || 3;
    const round = Number.parseInt(String(payload.round || 1), 10) || 1;
    const difficulty = String(payload.difficulty || "standard");
    const persona = String(payload.persona || "logic");

    if (!modelEnvReady()) {
      return Response.json({
        success: true,
        mode: "demo",
        reply: demoTurnReply(topic, studentSide, history)
      });
    }

    const system = [
      "你是一名英文辩论训练中的 AI 对手。",
      `辩题：${topic}`,
      `学生立场：${sideLabel(studentSide)}`,
      `你的立场：${sideLabel(oppositeSide(studentSide))}`,
      `当前回合：${round} / ${rounds}`,
      `对手强度：${difficulty}`,
      `表达风格：${persona}`,
      "每次回应必须控制在 150 个中文字符或等量英文以内。",
      "必须回应学生上一轮发言，并推进一个清晰论点。",
      "不要输出系统说明、模型身份或评分。"
    ].join("\n");

    const messages = [
      { role: "system" as const, content: system },
      ...history.map((item) => ({
        role: item.side === "ai" ? "assistant" as const : "user" as const,
        content: item.text
      }))
    ];

    const reply = await callDebateModel(messages);
    return Response.json({ success: true, mode: "model", reply });
  } catch (error) {
    const message = error instanceof Error && error.message === "MODEL_ENV_MISSING"
      ? "模型服务暂未配置，已保留 demo 模式。"
      : "本轮回应生成失败，请稍后重试。";
    return jsonError(message, 500);
  }
}
