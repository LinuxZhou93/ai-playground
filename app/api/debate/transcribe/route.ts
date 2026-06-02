import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/server/api-response';

export const runtime = 'nodejs';
export const maxDuration = 60;

const BACKGRACE_BASE_URL = 'https://backgrace.com/v1';
const DEFAULT_AUDIO_MODEL = 'gemini-3.5-flash';

function cleanApiKey(key: string | undefined): string {
  if (!key) return '';
  if (key.startsWith('sk-Ob49') || key.startsWith('sk-4nI8') || key.startsWith('sk-YU1Cu')) {
    return '';
  }
  return key;
}

function resolveDebateApiKey() {
  return cleanApiKey(process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY);
}

function resolveDebateBaseUrl() {
  return (process.env.OPENAI_BASE_URL || BACKGRACE_BASE_URL).replace(/\/$/, '');
}

function resolveGeminiAudioUrl() {
  if (process.env.BACKGRACE_GEMINI_AUDIO_URL) {
    return process.env.BACKGRACE_GEMINI_AUDIO_URL;
  }

  const model = process.env.BACKGRACE_GEMINI_AUDIO_MODEL || DEFAULT_AUDIO_MODEL;
  return `https://backgrace.com/v1beta/models/${encodeURIComponent(`${model}:generateContent`)}`;
}

function inferAudioMimeType(audioFile: File) {
  if (audioFile.type && audioFile.type !== 'application/octet-stream') {
    return audioFile.type;
  }

  const name = audioFile.name.toLowerCase();
  if (name.endsWith('.mp3')) return 'audio/mpeg';
  if (name.endsWith('.m4a')) return 'audio/mp4';
  if (name.endsWith('.mp4')) return 'audio/mp4';
  if (name.endsWith('.wav')) return 'audio/wav';
  if (name.endsWith('.webm')) return 'audio/webm';
  if (name.endsWith('.ogg')) return 'audio/ogg';
  return 'audio/mpeg';
}

function extractGeminiText(payload: unknown) {
  const candidate = (payload as any)?.candidates?.[0];
  const parts = candidate?.content?.parts || [];
  const text = parts
    .map((part: { text?: string }) => part?.text || '')
    .filter(Boolean)
    .join('\n')
    .trim();

  return text || String((payload as any)?.text || '').trim();
}

async function createTranscript(audioFile: File, language: string, context: string) {
  const apiKey = resolveDebateApiKey();
  if (!apiKey) {
    throw new Error('Missing server-side ASR API key');
  }

  const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
  const mimeType = inferAudioMimeType(audioFile);
  const languageInstruction =
    language === 'zh'
      ? '主要语言是中文。'
      : language === 'auto'
        ? '自动判断语言。'
        : '主要语言是英文辩论发言，可能夹杂中文或专有名词。';

  const response = await fetch(resolveGeminiAudioUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: [
                '请转写这段学生辩论录音。',
                languageInstruction,
                '要求：',
                '1. 尽量逐字转写，保留原始论证顺序；',
                '2. 语速很快时，请根据上下文合理推测，但不要编造不存在的事实；',
                '3. 保留 debate terms、学校/赛事/人名、专有名词、数字、引用来源；',
                '4. 听不清的位置标注 [unclear] 或 [?]；',
                '5. 按发言段落分行，不要总结，不要改写。',
                context ? `补充背景：${context}` : '',
              ]
                .filter(Boolean)
                .join('\n'),
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: audioBuffer.toString('base64'),
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192,
      },
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.error ||
      `Transcription request failed: ${response.status}`;
    throw new Error(message);
  }

  return extractGeminiText(payload);
}

async function createDebateNotes(params: {
  transcript: string;
  mode: string;
  context: string;
}) {
  const apiKey = resolveDebateApiKey();
  if (!apiKey) {
    throw new Error('Missing server-side LLM API key');
  }

  if (params.mode === 'transcript_only') {
    return {
      output: params.transcript,
      cleaned: '',
      brief: '',
    };
  }

  const modeInstruction =
    params.mode === 'debate_brief'
      ? [
          '输出一份中文辩论复盘简报：',
          '1. 原文忠实摘要',
          '2. 主要论点',
          '3. 证据/例子',
          '4. 反驳点',
          '5. 表达问题',
          '6. 下一轮训练建议',
        ].join('\n')
      : [
          '输出三个部分：',
          'A. Clean English Transcript：轻度加标点、分段，但不要改变原意。',
          'B. 中文理解稿：用自然中文解释这段发言。',
          'C. Debate Coach Notes：提取论证结构、不确定位置和训练建议。',
        ].join('\n');

  const response = await fetch(`${resolveDebateBaseUrl()}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_TRANSLATE_MODEL || 'gemini-3.5-flash',
      messages: [
        {
          role: 'system',
          content: [
            'You are a debate transcription and coaching assistant for international school students.',
            'Never fabricate facts not present in the transcript.',
            'When speech is unclear, preserve uncertainty instead of overcorrecting.',
            'Use concise Chinese labels and keep English debate terms where useful.',
          ].join('\n'),
        },
        {
          role: 'user',
          content: [
            modeInstruction,
            params.context ? `\nContext:\n${params.context}` : '',
            `\nRaw transcript:\n${params.transcript}`,
          ].join('\n'),
        },
      ],
      temperature: 0.2,
      stream: false,
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.error ||
      `Debate polish request failed: ${response.status}`;
    throw new Error(message);
  }

  const output = String(payload?.choices?.[0]?.message?.content || '').trim();
  return {
    output,
    cleaned: output,
    brief: output,
  };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;
    const mode = String(formData.get('mode') || 'clean_bilingual');
    const context = String(formData.get('context') || '');
    const language = String(formData.get('language') || 'en');

    if (!audioFile) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'Audio file is required');
    }

    if (audioFile.size > 25 * 1024 * 1024) {
      return apiError(
        'INVALID_REQUEST',
        413,
        'Audio file is larger than 25MB. Please upload a shorter clip.',
      );
    }

    const transcript = await createTranscript(audioFile, language, context);
    if (!transcript) {
      return apiError(
        'TRANSCRIPTION_FAILED',
        422,
        'No transcript returned. Try a clearer or shorter audio clip.',
      );
    }

    const notes = await createDebateNotes({ transcript, mode, context });

    return apiSuccess({
      transcript,
      ...notes,
    });
  } catch (error) {
    return apiError(
      'TRANSCRIPTION_FAILED',
      500,
      'Debate transcription failed',
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
}
