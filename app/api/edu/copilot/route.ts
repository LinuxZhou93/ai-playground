import { streamText } from 'ai';
import { getModel } from '@/lib/ai/providers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { selection, promptType, context } = await request.json();

    const { model } = getModel({
      providerId: 'google',
      modelId: 'gemini-3.5-flash',
      apiKey: process.env.GOOGLE_API_KEY,
    });

    let systemPrompt = "你是专业的科创教育(STEM)课程研发专家。直接输出增补或修改的段落，保持输出纯净的文本或HTML列表标签，不要加任何代码块包裹，也不要寒暄。";
    let userPrompt = "";

    if (promptType === 'expand') {
        userPrompt = `请对以下教学大纲的某一步骤进行专业扩写（适合7-9岁），把它细化为3-4个带有关键动作指令的小步骤。\n当前需要扩写的内容是："${selection}"`;
    } else if (promptType === 'assessment') {
        userPrompt = `请根据这段教学大纲："${selection}"\n生成两项具体的课堂考评指标，用以评估学生是否达成目标。`;
    } else {
        userPrompt = `请帮我续写补充："${selection}"`;
    }

    const result = await streamText({
      model,
      system: systemPrompt,
      prompt: userPrompt,
    });

    return result.toDataStreamResponse();

  } catch (error: any) {
    console.error("Copilot AI Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
