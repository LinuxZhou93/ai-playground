import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const {
      student_id,
      student_name,
      camp_name = '成电研学·2026未来科技营·机甲争锋AI全向移动格斗机器人创造挑战',
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

    const scores = {
      focus_score,
      dexterity_score,
      logic_score,
      resilience_score,
      self_management_score,
      social_score,
      creativity_score,
      collaboration_score
    };
    const invalidScore = Object.values(scores).some(
      score => !Number.isInteger(score) || score < 0 || score > 100
    );

    if (typeof student_name !== 'string' || !student_name.trim()) {
      return NextResponse.json({ error: '请填写学员姓名' }, { status: 400 });
    }
    if (invalidScore) {
      return NextResponse.json({ error: '八维评分必须是 0–100 的整数' }, { status: 400 });
    }
    if (photo_data && (typeof photo_data !== 'string' || photo_data.length > 2_500_000)) {
      return NextResponse.json({ error: '照片过大，请压缩后重新上传' }, { status: 413 });
    }
    if (!supabaseUrl || !supabaseKey) {
      console.error('Camp report service is missing Supabase configuration');
      return NextResponse.json({ error: '报告存储服务暂不可用' }, { status: 503 });
    }

    const systemPrompt = `
你是一位熟悉机器人、机械工程、电子信息、嵌入式控制、青少年工程教育与积极心理学的资深项目导师。
本次评测来自“成电研学·2026未来科技营·机甲争锋AI全向移动格斗机器人创造挑战”。这是一个4天3晚、面向小学高段至初中段、以工程实践驱动和多学科融合为核心的机器人创造项目。项目围绕全向移动格斗机器人从0到1的完整工程闭环展开，包括：底盘与装甲结构设计、电机与传动安装、麦克纳姆轮全向运动、二维坐标与向量分解、电机驱动与PWM调速、电源与电路保护、红外对战与传感、嵌入式控制、蓝牙遥控与指令解析、发射机构、系统联调、竞技对抗、赛后复盘与迭代优化。

你的任务是根据导师给出的八维量化评分（百分制：90+优秀，80-89良好，70-79一般，70以下需重点支持）及两段真实观察，生成一份面向家长的【机甲争锋机器人创造项目多维能力反馈报告】。

写作原则：
1. 以导师观察为事实边界，不得虚构学员完成过的任务、对战结果、奖项、教授评价或具体技术成果。
2. 保持八维观察框架不变，并结合机器人项目中的机械装配、全向运动、软硬件调试、竞技策略、工程记录、团队协作和安全规范解释学员行为。
3. 使用真诚、专业、有温度的积极心理学语气；既指出优势，也给出可执行的成长路径。
4. 可以解释机器人项目中的力学、数学、电子、通信与控制价值；涉及电源、工具、发射机构和竞技操作时强调专业导师指导、场地规则和安全规范。
5. 不要出现“探空火箭”“智能台灯营”“瞪羚俱乐部”、空气动力、遥测、伞降等与本项目无关的内容。
6. 区分“课程涉及”与“学员实际完成”：技能图谱可说明课程内容，综合评价只能写导师观察可以支持的个人表现。

输出格式要求必须返回纯合法的 JSON 字符串（不要附带markdown代码块标识），包含以下字段：
{
  "ai_overall_report": "一段300-450字的综合评价。结合八维评分和导师观察，分析学员在全向移动格斗机器人创造项目中的工程潜质、真实表现、优势维度及下一步突破点。",
  "ai_recommendations": [
    "建议1：侧重工程笔记、数理基础、数据记录或复盘习惯，必须具体可执行",
    "建议2：结合机械、电子、通信、自动控制、计算机或人工智能给出后续跨学科进阶路径，并联系科创竞赛、研究性学习、项目报告或专业启蒙",
    "建议3：针对导师提出的待提升点给出委婉、分步骤、可观察的训练建议"
  ]
}
`;

    const userPrompt = `
学员姓名: ${student_name}
所属营地: ${camp_name}

【八维能力评估】（百分制：90+优秀，80-89良好，70-79一般，70以下欠佳）
专注度（参与机器人创造与执行任务时的持续投入）: ${focus_score}/100
动手精细度（结构装配、线路连接与工具使用）: ${dexterity_score}/100
逻辑理解力（理解机械、电子、通信、程序与系统关系）: ${logic_score}/100
抗挫折恢复（面对调试失败、控制异常或对战失利时的状态）: ${resilience_score}/100
情绪与收纳（情绪调节、材料工具整理与任务秩序）: ${self_management_score}/100
社会化融入（与同伴、导师的互动及团队适应）: ${social_score}/100
创新想象力（结构方案、技术应用与问题解决创意）: ${creativity_score}/100
协作沟通力（项目分工、信息同步、共同调试与赛后复盘）: ${collaboration_score}/100

【导师观察高光亮点】
${highlights}

【导师观察到的待提升点】
${potential_improvements}

请严格依据上述信息分析；如果某一环节没有导师观察证据，不得写成该学员已经完成。请立即按照JSON格式生成。
    `;

    const rawKey = process.env.OPENAI_API_KEY;
    const isStale = (key: string | undefined) => 
        !key || key.startsWith('sk-Ob49') || key.startsWith('sk-4nI8') || key.startsWith('sk-YU1Cu');
    const backgraceKey = isStale(rawKey) ? '' : rawKey!;

    if (!backgraceKey) {
      console.error('Camp report service is missing a valid AI API key');
      return NextResponse.json({ error: 'AI 报告服务暂不可用' }, { status: 503 });
    }

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

    let completionResponse: Response;
    try {
      completionResponse = await fetch('https://backgrace.com/v1/chat/completions', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${backgraceKey}`
          },
          body: JSON.stringify(openaiPayload),
          signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!completionResponse.ok) {
        throw new Error(`AI API failed (${completionResponse.status})`);
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

    if (
      typeof parsedOutput.ai_overall_report !== 'string' ||
      !Array.isArray(parsedOutput.ai_recommendations) ||
      parsedOutput.ai_recommendations.length === 0
    ) {
      throw new Error('AI response schema was invalid');
    }

    const supResData = await fetch(`${supabaseUrl}/rest/v1/camp_evaluations`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
          student_id, student_name: student_name.trim(), camp_name,
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
    const isTimeout = error?.name === 'AbortError';
    return NextResponse.json(
      { error: isTimeout ? 'AI 生成超时，请重试' : '报告生成失败，请稍后重试' },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
