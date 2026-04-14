import { NextResponse } from 'next/server';

function generateRandomId() {
  return Math.random().toString(36).substring(2, 9);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { mode = 'generate_all', topic, content, prompt, currentSlide, slideCount = 8 } = data;

    let systemPrompt = "";
    let userPrompt = "";

    // 模式一：全量生成整个 PPT 阵列与全景教案大纲
    if (mode === 'generate_all') {
      systemPrompt = `
你是一位顶级人工智能科创教研总监。你的任务不仅是设计精美的幻灯片，更要在底层架构上落实【新课标信息科技核心素养】与【布鲁姆(Bloom)认知层级】。

请你根据提供的主题、水平和受众，生成一套结构完备的教学资产包。
请务必输出合法的 JSON 字符串，格式严格如下：
{
  "lesson_plan": "一份简要的全局配套教辅说明...",
  "course_meta": {
    "name": "课程的中文全名，如《碳膜传感器穿戴设备开发》",
    "category": "课程分类（机器人, 编程, 电子, 3D打印, 综合）",
    "total_lessons": 8,
    "duration_min": 90
  },
  "lessons_outline": [
    {
      "lesson_number": 1,
      "title": "具体的一次课主题",
      "objectives": ["能够复述XXX的原理 (Bloom 记忆)", "能够独立搭建XXX结构 (Bloom 应用)"],
      "materials": ["主控板x1", "连接线x4"]
    }
  ],
  "slides": [
    {
      "id": "随机短id如_abc123",
      "type": "cover", 
      "title": "大标题或封面标题",
      "content": "核心幻灯片正文内容。注意：【绝对禁止】使用 Markdown（如 ###, **, * 等）！请用纯净文字和空行排版，保持高级科技感，不要有任何特殊符号占位符。",
      "notes": "这页PPT配给老师看的详细讲课逐字稿或提示。"
    }
  ]
}

要求：
1. lessons_outline 必须与要求生成的 total_lessons 数量一致或覆盖首周进程。
2. 每节课必须提炼 2-3 个明确的 objective，必须标注 Bloom 认知层级（记忆/理解/应用/分析/评价/创造）。
`;
      userPrompt = "主题: \"" + topic + "\"\n补充资料/要求: \"" + (content || '无') + "\"\n绝不遗漏核心要求，严格按照要求生成，保持体系级的专业性。立即返回 JSON：";
    } 
    // 模式二：针对某个孤立的 Slide 进行微调重生成
    else if (mode === 'regenerate_slide') {
      systemPrompt = `
你是一位 PPT 微调润色专家。用户将提供目前某一页幻灯片的完整 JSON 数据，以及对其进行修改的要求指令。
请严格遵循以下要求：
1. 你的任务是重新改写这个节点的内容。
2. 【绝对禁止】使用 Markdown（如 ###, **, * 等占位符）。
3. 务必只返回这个单一对象的合法 JSON（字段保持不变：id, type, title, content, notes）。
`;
      userPrompt = "当前页面的原数据：\n" + JSON.stringify(currentSlide, null, 2) + "\n\n微调指令要求：\n\"" + prompt + "\"\n\n请不要使用特殊符号，立即输出更新后的纯 JSON 数据：";
    }
    // 模式三：智能意图捕捉与扩写
    else if (mode === 'enhance_topic') {
      systemPrompt = `
你是一位深谙教育心理学与高级教学设计的特级教师大模型。用户可能会偷懒，只输入一些干瘪的名词（例如“水循环”或“机器人”）。
你的任务是将这些干瘪的需求自动扩展为一句极其专业、丰满、结构化并且有高度的具体课程生成提示（Prompt）。
扩写后的主题不仅要明确方向，还可以顺带点明核心素养要求。

请务必输出合法的 JSON 字符串，格式严格如下：
{
  "enhanced_topic": "（例如：以‘水循环’为线索的自然科学探究课：带领学生通过实验观察与现象解释，理解地球水资源的转化形态与环保意义）"
}
`;
      userPrompt = "用户原始干瘪输入: \"" + topic + "\"\n\n请立刻对其进行专业教育向的发散与扩写，返回 JSON：";
    }

    const backgraceKey = process.env.OPENAI_API_KEY || 'sk-yRWWj3wDJfuUXhddTtdTb59ax9ExqC7DAgbpBt5Oe50yDFjK';

    const openaiPayload = {
        model: 'gemini-3-flash',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const completionResponse = await fetch('https://backgrace.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + backgraceKey
        },
        body: JSON.stringify(openaiPayload),
        signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!completionResponse.ok) {
        throw new Error("LLM API failed (" + completionResponse.status + ")");
    }

    const openaiData = await completionResponse.json();
    let contentStr = openaiData.choices?.[0]?.message?.content || '{}';
    
    // 使用 indexOf 安全提取 JSON，不再使用正则（避免转义灾难）
    const jsonStart = contentStr.indexOf('{');
    const jsonEnd = contentStr.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        contentStr = contentStr.substring(jsonStart, jsonEnd + 1);
    } else {
        throw new Error('AI response is not valid JSON');
    }

    let parsedOutput = JSON.parse(contentStr);
    
    // 如果大模型画蛇添足，把数据嵌套在了顶层某个 key 里，智能解包提取
    if (mode === 'regenerate_slide' && parsedOutput && !parsedOutput.title && !parsedOutput.content && Object.keys(parsedOutput).length === 1) {
        const firstKey = Object.keys(parsedOutput)[0];
        if (typeof parsedOutput[firstKey] === 'object' && parsedOutput[firstKey] !== null) {
            parsedOutput = parsedOutput[firstKey];
        }
    }
    if (mode === 'generate_all' && parsedOutput.slides) {
      parsedOutput.slides = parsedOutput.slides.map((s: any) => ({
        ...s,
        id: s.id || generateRandomId()
      }));
    }

    return NextResponse.json({
      success: true,
      data: parsedOutput
    });

  } catch (error: any) {
    console.error('Generator API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
