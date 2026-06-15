import { NextResponse } from 'next/server';
import https from 'https';

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
你是一位专业的科创教育专家、青少年物理与算法教学专家和成电创客资深社区实验室导师。
本次评测的背景是“成电创客wowcreator社区实验室学员课程评价”，针对学员在“2025--2026年春季学期课程”的学习情况进行反馈。
学员在课程中主要学习了：
1. 基础的简单机械结构（例如杠杆原理、轮轴应用、齿轮传动、滑轮组省力系统、连杆结构等，参考经典工程机械教标，但绝对不要提及任何“乐高”、“Lego”、“Wedo”、“9686”等品牌与特定产品字眼）。
2. 图形化简单编程与流程控制（如顺序指令执行、动作循环控制、基于传感器输入的简单条件触发）。
3. 物理传感器应用与电机控制（如电机启动/停止、顺逆时针旋转与不同档位速度控制，红外距离传感器与倾斜传感器信号触发与软硬件连接基础调试）。

你的任务是根据导师给出的八维量化评分（百分制：90+优秀，80-90良好，70-80一般，70以下欠佳）和两句带主观色彩的观察评价，生成一份给家长看的详尽、专业、富有同理心的【成电创客wowcreator社区实验室学员多元能力评估深度报告】。

核心目标是：通过客观数据与导师观察，剖析孩子的“突出的工程结构/算法编程天赋”或“需要系统性加强的短板”，以帮助家长认识到孩子后续长线系统性学习的重要性。

【极度重要要求】
1. 报告语气：真诚、用词专业、具备针对性、科技感，多用积极心理学视角。
2. 身份口吻：你的发言和报告口气必须完全代表“成电创客学术委员会与主审导师团队”，本报告是人工综合评审得出的结论。
3. 绝对禁忌：报告内容和建议中绝对不能出现任何“AI”、“人工智能”、“大模型生成”、“自动评语”或“根据算法分析”等字眼，不能有任何让家长察觉到这篇报告是由人工智能撰写的痕迹。
4. 篇幅饱满：为了让报告显得详尽和充实，防止页面有太多空白，你的综合评价字数必须控制在 500-600 字之间，务必加入丰富具体的机械结构（如简单杠杆、轮轴应用、齿轮传动咬合）与编程调试细节（如图形化顺序编程、循环动作控制、传感器交互触发与软硬件连接排查）等实战描述。

输出格式要求必须返回纯合法的 JSON 字符串（不要附带markdown代码块标识），包含以下字段：
{
  "ai_overall_report": "一段代表学术委员会与主审导师团队针对该学员八个维度以及本学期在基础机械结构技能、图形化简单编程与流程控制、物理传感器与电机控制交互表现的详细综合定性评估（500-600字），要显得极其专业、充满行业洞见、且对家长有较高的温度感知，结合实验室具体的物理机械和图形化编程课程元素。字数必须足够饱满，防止页面空白。",
  "ai_recommendations": [
    "建议1（侧重生活与工程探究习惯，如观察生活中的机械工具、主动收拾整理硬件工位、培养5S工程规范等）",
    "建议2（【强制要求】必须丝滑地写一段结合后续的长线编程/科创学习进阶建议，在建议中自然地引出推荐后续进阶加入成电创客wowcreator科创俱乐部的『飞鹰阶段 (LEVEL 05-08) 课程』（如控制逻辑与系统集成）。指出飞鹰阶段专注于传感器深度应用、多传感器融合与变量控制，能有效帮助其攻克当前遇到的控制流与多层算法逻辑难点，深度建立系统工程思维，并为后续更高级的『雄鹰阶段 (LEVEL 09-11)』机电系统集成控制及 VEX 世界机器人大赛等竞技挑战打下扎实的硬件与算法基础）",
    "建议3（针对教师提出的待提升短板，提供委婉且具有极强操作性的具体训练方法）"
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

    // Helper to perform POST using Node's native https module
    const httpsPost = (urlStr: string, headers: any, body: any): Promise<any> => {
      return new Promise((resolve, reject) => {
        const url = new URL(urlStr);
        const bodyStr = JSON.stringify(body);
        const options = {
          hostname: url.hostname,
          port: url.port || 443,
          path: url.pathname + url.search,
          method: 'POST',
          headers: {
            ...headers,
            'Content-Length': Buffer.byteLength(bodyStr)
          },
          rejectUnauthorized: false
        };

        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            resolve({
              ok: res.statusCode && res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              statusText: res.statusMessage,
              json: async () => JSON.parse(data),
              text: async () => data
            });
          });
        });

        req.on('error', (e) => reject(e));
        req.write(bodyStr);
        req.end();
      });
    };

    // 存入 Supabase (使用 camp_evaluations 表，camp_name 则传入带有 'wowcreator' 的字段以便隔离)
    const supHeaders = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
    const supBody = {
      student_id, student_name, camp_name,
      focus_score, dexterity_score, logic_score,
      resilience_score, self_management_score, social_score,
      creativity_score, collaboration_score, highlights,
      potential_improvements,
      photo_data,
      ai_overall_report: parsedOutput.ai_overall_report,
      ai_recommendations: parsedOutput.ai_recommendations,
    };

    let supResData: any = null;
    let lastError: any = null;

    for (let i = 0; i < 3; i++) {
      try {
        console.log(`[Supabase Save] Attempt ${i + 1} to save evaluation to Supabase...`);
        supResData = await httpsPost(`${supabaseUrl}/rest/v1/camp_evaluations`, supHeaders, supBody);
        if (supResData.ok) {
          break;
        } else {
          const errText = await supResData.text();
          throw new Error(`HTTP ${supResData.status}: ${errText}`);
        }
      } catch (err: any) {
        console.warn(`[Supabase Save] Attempt ${i + 1} failed: ${err.message}`);
        lastError = err;
        if (i < 2) await new Promise(r => setTimeout(r, 1500));
      }
    }

    if (!supResData || !supResData.ok) {
      throw new Error(`Supabase API failed after 3 attempts: ${lastError?.message || 'Unknown error'}`);
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
