import { experimental_upgradeWebSocket, type WebSocketData } from '@vercel/functions';
import WebSocket from 'ws';

export const runtime = 'nodejs';
export const maxDuration = 300;

type ClientEvent =
  | { type: 'start'; language?: string }
  | { type: 'audio'; audio: string }
  | { type: 'commit'; turnId: string }
  | { type: 'discard' }
  | { type: 'close' };

function realtimeUrl() {
  const explicit = process.env.ASR_QWEN_REALTIME_URL?.trim();
  if (explicit) return explicit;

  const baseUrl = process.env.ASR_QWEN_BASE_URL?.trim();
  if (!baseUrl) throw new Error('实时 ASR 尚未配置服务地址。');
  const url = new URL(baseUrl);
  url.protocol = url.protocol === 'http:' ? 'ws:' : 'wss:';
  url.pathname = url.pathname.replace(/\/api\/v1\/?$/, '/api-ws/v1/realtime');
  url.search = '';
  return url.toString();
}

function parseClientEvent(raw: WebSocketData): ClientEvent | null {
  try {
    const event = JSON.parse(raw.toString()) as ClientEvent;
    if (!event || typeof event.type !== 'string') return null;
    return event;
  } catch {
    return null;
  }
}

function send(socket: WebSocket, event: Record<string, unknown>) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(event));
}

export async function GET(request: Request) {
  // 浏览器实时通道只允许同源页面接入，避免它被当作公开 ASR 中转站消耗额度。
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    return new Response('Forbidden', { status: 403 });
  }

  return experimental_upgradeWebSocket(async (client) => {
    let upstream: WebSocket | null = null;
    let started = false;
    let upstreamReady = false;
    let language = 'zh';
    const queuedAudio: string[] = [];
    const committedTurnIds: string[] = [];

    const closeUpstream = () => {
      if (upstream && upstream.readyState < WebSocket.CLOSING) upstream.close(1000, 'client closed');
      upstream = null;
      upstreamReady = false;
    };

    const appendAudio = (audio: string) => {
      if (!upstreamReady || !upstream || upstream.readyState !== WebSocket.OPEN) {
        queuedAudio.push(audio);
        return;
      }
      upstream.send(JSON.stringify({ type: 'input_audio_buffer.append', audio }));
    };

    const connectUpstream = () => {
      const apiKey = process.env.ASR_QWEN_API_KEY?.trim();
      if (!apiKey) {
        send(client, { type: 'error', code: 'ASR_NOT_CONFIGURED', message: '实时语音服务尚未配置。' });
        return;
      }

      let url: URL;
      try {
        url = new URL(realtimeUrl());
        url.searchParams.set('model', process.env.ASR_QWEN_REALTIME_MODEL?.trim() || 'qwen3-asr-flash-realtime');
      } catch (error) {
        send(client, { type: 'error', code: 'ASR_BAD_CONFIG', message: error instanceof Error ? error.message : '实时语音服务配置无效。' });
        return;
      }

      upstream = new WebSocket(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'OpenAI-Beta': 'realtime=v1',
        },
      });

      upstream.on('open', () => {
        if (!upstream) return;
        upstream.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text'],
            input_audio_format: 'pcm',
            sample_rate: 16000,
            input_audio_transcription: { language },
            // 本地 VAD 会先过滤背景音；它确认一句结束后主动 commit，减少等待时间。
            turn_detection: null,
          },
        }));
      });

      upstream.on('message', (raw) => {
        let event: Record<string, unknown>;
        try {
          event = JSON.parse(raw.toString()) as Record<string, unknown>;
        } catch {
          return;
        }
        const type = String(event.type || '');
        if (type === 'session.updated') {
          upstreamReady = true;
          for (const audio of queuedAudio.splice(0)) appendAudio(audio);
          send(client, { type: 'ready' });
          return;
        }
        if (type === 'conversation.item.input_audio_transcription.text') {
          send(client, { type: 'partial', text: `${event.text || ''}${event.stash || ''}`.trim() });
          return;
        }
        if (type === 'conversation.item.input_audio_transcription.completed') {
          send(client, { type: 'final', turnId: committedTurnIds.shift() || '', text: String(event.transcript || '').trim() });
          return;
        }
        if (type === 'error') {
          const detail = event.error as { message?: string } | undefined;
          send(client, { type: 'error', code: 'ASR_UPSTREAM_ERROR', message: detail?.message || '实时转写服务暂不可用。' });
        }
      });

      upstream.on('error', () => {
        send(client, { type: 'error', code: 'ASR_CONNECTION_ERROR', message: '实时转写连接失败，已自动切换为普通转写。' });
      });
      upstream.on('close', () => {
        upstreamReady = false;
      });
    };

    client.on('message', (raw) => {
      const event = parseClientEvent(raw);
      if (!event) return send(client, { type: 'error', code: 'BAD_EVENT', message: '实时语音数据格式无效。' });

      if (event.type === 'start') {
        if (started) return;
        started = true;
        language = /^[a-z-]{2,12}$/i.test(event.language || '') ? String(event.language) : 'zh';
        connectUpstream();
        return;
      }
      if (event.type === 'audio') {
        // 只接收短 PCM 帧，阻止任意大字符串占满函数内存。
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(event.audio) || event.audio.length > 96_000) return;
        appendAudio(event.audio);
        return;
      }
      if (event.type === 'commit' && event.turnId) {
        committedTurnIds.push(event.turnId);
        if (upstreamReady && upstream?.readyState === WebSocket.OPEN) upstream.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
        return;
      }
      if (event.type === 'discard') {
        queuedAudio.splice(0);
        if (upstreamReady && upstream?.readyState === WebSocket.OPEN) upstream.send(JSON.stringify({ type: 'input_audio_buffer.clear' }));
        return;
      }
      if (event.type === 'close') closeUpstream();
    });
    client.on('close', closeUpstream);
    client.on('error', closeUpstream);
  }, { maxPayload: 128 * 1024 });
}
