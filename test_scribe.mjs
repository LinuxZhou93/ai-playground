import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://znmbkxmnwuurzhevfxtq.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let backgraceKey = process.env.OPENAI_API_KEY;

async function runTest() {
  console.log("=========================================");
  console.log("🧪 启动 FutureClass Scribe AI 测试链路...");
  console.log("=========================================\n");

  const student_name = "未来极客小明";
  const class_name = "Lego 动力机械高阶精英班";
  const course_topic = "火星车红外线自动避障及差速转向系统";
  const positive_tags = ["逻辑极强能举一反三", "动手能力极强", "主动帮助遇到困难的组员"];
  const negative_tags = ["遇到Bug容易情绪激动"];

  const posTagsStr = positive_tags.join('、');
  const negTagsStr = negative_tags.join('、');

  console.log(`👤 学员: ${student_name} | 📍 班级: ${class_name} | 📚 主题: ${course_topic}`);
  console.log(`💚 正面反馈: ${posTagsStr}`);
  console.log(`💔 待提升点: ${negTagsStr}\n`);
  console.log("⏳ 正在请求核心 AI 大脑 (Gemini-3-flash) 进行深度扩写分析...");

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

  const openaiPayload = {
      model: 'gemini-3-flash',
      messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
  };

  try {
      const completionResponse = await fetch('https://backgrace.com/v1/chat/completions', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${backgraceKey}`
          },
          body: JSON.stringify(openaiPayload),
      });

      if (!completionResponse.ok) {
          throw new Error(`OpenAI API failed: ${await completionResponse.text()}`);
      }

      const openaiData = await completionResponse.json();
      let contentStr = openaiData.choices?.[0]?.message?.content || '{}';
      
      const jsonMatch = contentStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
          contentStr = jsonMatch[0];
      }
      const parsedOutput = JSON.parse(contentStr);

      console.log("✅ AI 生成完毕！输出模拟手机微信视觉：\n");
      console.log(`[🤖 AI 温暖寒暄]\n${parsedOutput.ai_greetings}\n`);
      console.log(`[🚀 课堂多维度表现录]\n${parsedOutput.ai_class_performance}\n`);
      console.log(`[💡 居家延伸行动指南]\n${parsedOutput.ai_homework_guide}\n`);
      
      console.log("⬆️ 正在向您的 Supabase 底层云脑进行数据下沉持久化 (erp_growth_archives)...");
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
        throw new Error(`Supabase API failed: ${await supResData.text()}`);
      }
      
      console.log("🎉 测试通过：您的无敌系统一切运转如丝般顺滑！！");
  } catch (e) {
      console.error("❌ 发生错误: ", e.message);
  }
}

runTest();
