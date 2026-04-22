import { getModel } from './lib/ai/providers';
import { generateText } from 'ai';

async function testGemma() {
  try {
    console.log('正在调用本地 Gemma 2 27B...');
    const { model } = getModel({
      providerId: 'ollama',
      modelId: 'gemma4:31b',
      apiKey: '', // Ollama 不需要 API Key
    });

    const { text } = await generateText({
      model: model,
      prompt: '你好，请介绍一下你自己。',
    });

    console.log('模型回复：\n', text);
  } catch (error) {
    console.error('测试失败。可能原因：模型尚未下载完成或 Ollama 服务未启动。', error);
  }
}

testGemma();
