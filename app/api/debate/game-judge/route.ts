import {
  callDebateModel,
  demoJudgeScore,
  extractJson,
  jsonError,
  modelEnvReady,
  normalizeScore,
  oppositeSide,
  sideLabel,
  validateBasePayload
} from "../_shared";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { topic, studentSide, history } = validateBasePayload(payload);

    if (!history.length) {
      return jsonError("没有可评分的辩论记录。");
    }

    if (!modelEnvReady()) {
      return Response.json({
        success: true,
        mode: "demo",
        score: demoJudgeScore(history)
      });
    }

    const transcript = history.map((item) => {
      const who = item.side === "student" ? `学生(${sideLabel(studentSide)})` : `AI(${sideLabel(oppositeSide(studentSide))})`;
      return `${who}: ${item.text}`;
    }).join("\n\n");

    const system = [
      "你是一名国际辩论赛资深裁判，使用 WSDC / TOC 风格评分。",
      "评分维度：content 0-40, style 0-40, strategy 0-20。",
      "总分常见区间应围绕 60-80，不要轻易给极端分。",
      "只输出 JSON，不要代码块，不要额外解释。",
      "JSON 结构：",
      "{\"player\":{\"content\":0,\"style\":0,\"strategy\":0},\"ai\":{\"content\":0,\"style\":0,\"strategy\":0},\"winner\":\"player|ai|tie\",\"comment\":\"180字以内中文点评\"}"
    ].join("\n");

    const raw = await callDebateModel([
      { role: "system", content: system },
      {
        role: "user",
        content: [
          `辩题：${topic}`,
          `学生立场：${sideLabel(studentSide)}`,
          `AI 立场：${sideLabel(oppositeSide(studentSide))}`,
          "完整记录：",
          transcript
        ].join("\n")
      }
    ]);

    const score = normalizeScore(extractJson(raw));
    return Response.json({ success: true, mode: "model", score });
  } catch {
    return jsonError("裁判评分生成失败，请稍后重试。", 500);
  }
}
