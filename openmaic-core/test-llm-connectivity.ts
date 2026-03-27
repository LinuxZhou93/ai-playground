import { resolveModel } from './lib/server/resolve-model';
import { callLLM } from './lib/ai/llm';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env / .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

async function testBottomUp() {
  console.log('🚀 Starting bottom-up connectivity test...');

  // 1. Test model resolution logic
  console.log('\n[Step 1] Testing model resolution...');
  try {
    const { model, modelInfo, modelString, apiKey } = resolveModel({
      modelString: 'google:gemini-3-flash-preview',
      providerType: 'openai'
    });
    
    console.log('✅ Model resolution success:');
    console.log(`- Model String: ${modelString}`);
    console.log(`- Model ID: ${modelInfo?.id}`);
    console.log(`- API Key: ${apiKey ? apiKey.slice(0, 8) + '...' : 'MISSING'}`);
    
    if (!apiKey) {
      throw new Error('API Key resolution failed. Check the hardcoded fallback logic in provider-config.ts.');
    }

    // 2. Test LLM connectivity (via Backgrace proxy)
    console.log('\n[Step 2] Testing LLM connectivity (Backgrace Proxy)...');
    const result = await callLLM(
      {
        model: model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant. Reply with "CONNECTION_OK" if you receive this.' },
          { role: 'user', content: 'Hello, test connectivity.' },
        ],
        maxOutputTokens: 100,
      },
      'test-connectivity'
    );

    console.log('✅ LLM response success:');
    console.log(`- Response: ${result.text}`);

    if (result.text.includes('CONNECTION_OK')) {
      console.log('\n🎉 Bottom-up test passed! Model calling pipeline is healthy.');
    } else {
      console.log('\n⚠️ LLM response does not contain the expected keyword, but connection was successful.');
    }

  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(error);
    process.exit(1);
  }
}

testBottomUp();
