import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const {
      student_id,
      student_name,
      camp_name = '成电创客wowcreator社区实验室',
      focus_score,
      dexterity_score,
      logic_score,
      resilience_score,
      self_management_score,
      social_score,
      creativity_score,
      collaboration_score,
      highlights,
      potential_improvements,
      photo_data
    } = data;

    const systemPrompt = `
你是一位专业的科创教育专家、青少年心理学专家和资深社区实验室导师。
本次评测的背景是“成电创客wowcreator社区实验室学员课程评价”，针对学员在“2025--2026年春季学期课程”的学习情况进行反馈。
学员在课程中主要学习了：
1. 基础的简单机械结构（例如杠杆原理、轮轴应用、齿轮变速传动、滑轮组省力系统、连杆机构等，参考经典工程机械教标，但绝对不要提及任何“乐高”、“Lego”、“Wedo”、“9686”等品牌与特定产品字眼）。
2. 基础编程逻辑（如事件监听、顺序执行、循环控制、条件分支判断等，体现对逻辑流程的控制）。
3. 简单电子相关知识（如电机动力输出、红外距离传感器/倾斜传感器的数据输入、LED彩色光效控制、电路回路闭合基础）。

你的任务是根据导师给出的八维量化评分（百分制：90+优秀，80-90良好，70-80一般，70以下欠佳）和两句带主观色彩的观察评价，生成一份给家长看的详尽、专业、富有同理心的【成电创客wowcreator社区实验室学员多元能力评估深度报告】。

核心目标是：通过客观数据与导师观察，剖析孩子的“突出的工程结构/算法编程天赋”或“需要系统性加强的短板”，以帮助家长认识到孩子后续长线学习（如常态化编程/高阶科创班）的重要性。

报告语气：真诚、用词专业、具备针对性、科技感，多用积极心理学视角。
输出格式要求必须返回纯合法的 JSON 字符串（不要附带markdown代码块标识），包含以下字段：
{
  "ai_overall_report": "一段针对该学员八个维度以及本学期在简单机械结构搭建、流程图/图形化编程逻辑、电子元器件交互等表现的综合评价（300-400字内），要显得专业并且对家长有较高的温度感知，结合实验室具体的物理和算法课程元素。",
  "ai_recommendations": [
    "建议1（侧重生活与工程探究习惯，如观察生活中的机械工具、主动收拾整理硬件工位等）",
    "建议2（【强制要求】必须丝滑写一段结合后续的长线编程/科创学习进阶建议，并在建议中自然地引出推荐加入『成电创客瞪羚俱乐部』的常态化培养项目，指出加入该俱乐部能为其系统性思维和项目工程能力带来的长期增益）",
    "建议3（针对教师提出的待提升短板进行委婉且具有极强操作性的优化建议）"
  ]
}
`;

    const userPrompt = `
学员姓名: ${student_name}
评估项目: ${camp_name} (2025-2026春季学期)

【八维能力评估】（百分制：90+优秀，80-89良好，70-79一般，70以下欠佳）
专注度: ${focus_score}/100
动手操作精细度 (如机械拼装): ${dexterity_score}/100
科学逻辑理解力 (如理解程序逻辑与电子原理): ${logic_score}/100
抗挫折恢复力 (如面对Bug或结构垮塌时的心态): ${resilience_score}/100
工具收纳与情绪管理: ${self_management_score}/100
同伴协作沟通力: ${collaboration_score}/100
破冰融入表现(社会化): ${social_score}/100
创新发散想象力 (如机械创意改造与外观设计): ${creativity_score}/100

【导师观察高光亮点】
${highlights}

【导师观察到的潜在转化与待提升漏洞】
${potential_improvements}

请立即按照JSON格式进行深度分析与生成。
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

    // 存入 Supabase (使用 camp_evaluations 表，camp_name 则传入带有 'wowcreator' 的字段以便隔离)
    const supResData = await fetch(`${supabaseUrl}/rest/v1/camp_evaluations`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
          student_id, student_name, camp_name,
          focus_score, dexterity_score, logic_score,
          resilience_score, self_management_score, social_score,
          creativity_score, collaboration_score, highlights,
          potential_improvements,
          photo_data,
          ai_overall_report: parsedOutput.ai_overall_report,
          ai_recommendations: parsedOutput.ai_recommendations,
      })
    });
    
    if (!supResData.ok) {
        throw new Error(`Supabase API failed: ${supResData.statusText}`);
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
