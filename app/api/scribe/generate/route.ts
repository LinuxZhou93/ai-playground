import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const {
      student_name,
      class_name,
      course_topic,
      positive_tags = [],
      negative_tags = []
    } = data;

    if (!student_name || !class_name || !course_topic) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const posTagsStr = positive_tags.length > 0 ? positive_tags.join('、') : '无';
    const negTagsStr = negative_tags.length > 0 ? negative_tags.join('、') : '无';

    const systemPrompt = `
你是一位极其专业、懂儿童心理学且文笔温暖的少儿科创教育导师。
你的任务是根据任课教师在课堂上随手标记的“学员表现胶囊（Tag）”，为该学员自动扩写生成一份【课后家校成长报告（Scribe）】。

生成的点评需要发给家长看，所以：
1. 语气必须真诚、专业。
2. 评价要具体结合本节课的主题，不要太空泛。
3. 如果有缺点/待提升的部分（负面胶囊），要用【积极心理学】的话术委婉地告诉家长，并给出建议，避免引发家长焦虑。

【强制格式要求】必须返回纯合法的 JSON 字符串，包含以下三个字段：
{
  "ai_greetings": "一段带温度的问候语，感谢家长对教学的支持，以及一句对该学员整体感觉的概括句（大约50字）。",
  "ai_class_performance": "结合正向标签、待提升标签以及本节课主题，详细描述孩子本节课的亮眼抓手和可进步空间（200-300字）。",
  "ai_homework_guide": "根据本节课主题，给家长的生活互动延伸或复习建议（约100字以内）。"
}
`;

    const userPrompt = `
学员姓名: ${student_name}
所属班级: ${class_name}
本节课程主题: ${course_topic}

【教师圈出的正向表现】: ${posTagsStr}
【教师圈出的待提升项】: ${negTagsStr}

请深度结合所学课程主题，扩写一份发给家长的点评反馈。确保返回 JSON 格式。
    `;

    const rawKey = process.env.OPENAI_API_KEY;
    let backgraceKey = (rawKey && !rawKey.startsWith('sk-Ob49') && !rawKey.startsWith('sk-4nI8'))
        ? rawKey
        : 'sk-YU1CuYxkbWCqLpqG6VevPLgSuaUugYlKzwrBXsl1JhSCKJZ4';

    const openaiPayload = {
        model: 'gemini-3-flash',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
    };

    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const completionResponse = await fetch('https://backgrace.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${backgraceKey}`
        },
        body: JSON.stringify(openaiPayload),
        signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!completionResponse.ok) {
        const errText = await completionResponse.text();
        throw new Error(`OpenAI API failed (${completionResponse.status}): ${errText}`);
    }

    const openaiData = await completionResponse.json();
    let contentStr = openaiData.choices?.[0]?.message?.content || '{}';
    
    // Robust JSON extraction
    const jsonMatch = contentStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        contentStr = jsonMatch[0];
    } else {
        console.error('No JSON found in AI response:', contentStr);
        throw new Error('AI response did not contain a valid JSON object');
    }

    const parsedOutput = JSON.parse(contentStr);

    const supResData = await fetch(`${supabaseUrl}/rest/v1/erp_growth_archives`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
          student_name, 
          class_name, 
          course_topic,
          positive_tags, 
          negative_tags,
          ai_greetings: parsedOutput.ai_greetings,
          ai_class_performance: parsedOutput.ai_class_performance,
          ai_homework_guide: parsedOutput.ai_homework_guide
      })
    });
    
    if (!supResData.ok) {
        const errorDetails = await supResData.text();
        throw new Error(`Supabase API failed: ${supResData.statusText} - ${errorDetails}`);
    }

    const insertedJson = await supResData.json();
    const insertedData = Array.isArray(insertedJson) ? insertedJson[0] : insertedJson;

    return NextResponse.json({
      success: true,
      id: insertedData.id,
      ...parsedOutput
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
