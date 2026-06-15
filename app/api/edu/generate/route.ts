import { NextResponse } from 'next/server';

export const maxDuration = 60;

function generateRandomId() {
  return Math.random().toString(36).substring(2, 9);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { mode = 'generate_all', topic, content, prompt, currentSlide, slideCount = 8 } = data;

    let systemPrompt = "";
    let userPrompt = "";

    // 阶段一：纯粹推演课程元数据与整体大纲（极速响应）
    if (mode === 'generate_outline') {
      systemPrompt = `
你是一位顶级人工智能科创教研总监。请根据提供的主题、水平和受众，规划一套结构完备的教学资产大纲。
请务必输出合法的 JSON 字符串，格式严格如下：
{
  "lesson_plan": "一份简要的全局配套教辅说明...",
  "course_meta": {
    "name": "课程全名",
    "category": "课程分类",
    "total_lessons": 8,
    "duration_min": 90
  },
  "lessons_outline": [
    {
      "lesson_number": 1,
      "title": "具体的一次课主题",
      "objectives": ["(明确带Bloom层级)"],
      "materials": ["主控板x1"]
    }
  ],
  "slide_outlines": [
    {
      "page_number": 1,
      "title": "单页幻灯片的主标题",
      "core_intent": "这一页需要用来讲什么，核心意图是什么？"
    }
  ]
}
要求：slide_outlines 数组长度必须满足用户要求的总 PPT 页数，构建好起承转合的故事线。
`;
      userPrompt = "主题: \"" + topic + "\"\n补充资料/要求: \"" + (content || '无') + "\"\n绝不遗漏核心要求，严格按照要求生成。立即返回 JSON：";
    } 
    // 阶段二：根据用户在前端审阅过的大纲数据，精确发散为单页幻灯片细节
    // 阶段二：根据用户在前端审阅过的大纲数据，精确发散为单页幻灯片细节
    else if (mode === 'generate_slides') {
      systemPrompt = `
你是一位顶级 PPT 多模态呈现设计师。教学大纲已经固定，请将大纲转化为极其丰富的多模态块级 (Block-Based) 幻灯片。
你需要根据每一页的内容特性，为其精准分配排版版式 (layoutVariant)，并拆解为不同的 Blocks。
请严格输出合法 JSON 字符串，格式如下：
{
  "slides": [
    {
      "id": "随机短id如_abc123",
      "type": "cover 或者 slide",
      "layoutVariant": "选择一种排版：'default'(默认图文) / 'split-comparison'(左右分栏对比) / 'grid-3'(三块内容栅格) / 'timeline'(时间轴节点) / 'focus'(纯核心观点居中)",
      "title": "大标题",
      "blocks": [
        { "type": "text", "content": "文本内容。若是分栏结构，一段独立文本即为一栏。" },
        { "type": "mermaid", "content": "graph TD\\nA-->B" },
        { "type": "image_prompt", "content": "用于交给Midjourney或Unsplash生成配图的英文检索词或详细描述" }
      ],
      "notes": "这页PPT配给老师看的详细讲课逐字稿或提示。"
    }
  ]
}
要求：必须基于各页预审意图判断最美的 layoutVariant，并根据该排版填充等量的 blocks（例如 grid-3 最好配 3个独立的 text blocks 或者 text+image）。
`;
      userPrompt = "预审好的大纲结构：\n" + JSON.stringify(data.slideOutlines, null, 2) + "\n\n请针对上述每一页大纲精雕细琢，给出高高保真多模态幻灯片 JSON：";
    }
    // 模式：针对某个孤立的 Slide 进行微调重生成
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
    // 模式四：随堂测验萃取模式
    else if (mode === 'generate_quizzes') {
      systemPrompt = `
你是一位顶级的命题专家。你需要根据当前的课程纲要，自动生成 3 道兼具启发性与趣味性的【情景选择题】。
每道题将自动成为一个幻灯片卡片。
你返回的 JSON 必须是一个对象，包含一个 \`quizzes\` 数组。
数组里的每一个元素都是完全符合以下 Slide 结构的试题数据：
1. \`type\` 必须为 \`"quiz"\`。
2. \`title\` 是测验标题，如“互动小测 1”。
3. \`layoutVariant\` 必须为 \`"quiz-4-grid"\`。
4. \`blocks\` 数组必须有且仅有 5 个模块，按照固定顺序：
   第1个：\`type: "question"\`，内容为题干。
   第2、3、4、5个：\`type: "option"\`，内容为四个选项。请在正确选项的内容最后原样带上 "[正确答案]" 字样。
5. \`notes\` 为讲师逐字稿说明，请直接给出该题的“解析：...”。

输出 JSON 范例:
{
  "quizzes": [
    {
      "type": "quiz",
      "title": "互动测评 1",
      "layoutVariant": "quiz-4-grid",
      "blocks": [
        { "type": "question", "content": "题干..." },
        { "type": "option", "content": "A. 选项... [正确答案]" },
        { "type": "option", "content": "B. 选项..." },
        { "type": "option", "content": "C. 选项..." },
        { "type": "option", "content": "D. 选项..." }
      ],
      "notes": "解析：正确答案是A，因为..."
    }
  ]
}
`;
      userPrompt = "请根据以下课程大纲和主体方向，生成针对性试题：\n" + prompt + "\n\n请直接输出纯 JSON：";
    }

    const rawKey = process.env.OPENAI_API_KEY;
    const isStale = (key: string | undefined) => 
        !key || key.startsWith('sk-Ob49') || key.startsWith('sk-4nI8') || key.startsWith('sk-YU1Cu');
    const backgraceKey = isStale(rawKey) ? '' : rawKey!;

    const openaiPayload = {
        model: 'gemini-3.5-flash',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

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
