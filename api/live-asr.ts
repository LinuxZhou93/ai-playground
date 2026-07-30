import { createServer } from 'node:http';
import { WebSocket, WebSocketServer, type RawData } from 'ws';

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

function parseClientEvent(raw: RawData): ClientEvent | null {
  try {
    const event = JSON.parse(raw.toString()) as ClientEvent;
    return event && typeof event.type === 'string' ? event : null;
  } catch {
    return null;
  }
}

function send(socket: WebSocket, event: Record<string, unknown>) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(event));
}

const server = createServer((_request, response) => {
  response.writeHead(426, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end('WebSocket upgrade required');
});

const sockets = new WebSocketServer({
  server,
  maxPayload: 128 * 1024,
  verifyClient: ({ origin, req }, done) => {
    if (!origin) return done(true);
    const host = req.headers.host;
    try {
      done(Boolean(host && new URL(origin).host === host), 403, 'Forbidden');
    } catch {
      done(false, 403, 'Forbidden');
    }
  },
});

sockets.on('connection', (client) => {
  let upstream: WebSocket | null = null;
  let started = false;
  let upstreamReady = false;
  let language = 'zh';
  const queuedAudio: string[] = [];
  const committedTurnIds: string[] = [];
  let queuedCommits = 0;

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
      send(client, {
        type: 'error',
        code: 'ASR_BAD_CONFIG',
        message: error instanceof Error ? error.message : '实时语音服务配置无效。',
      });
      return;
    }

    upstream = new WebSocket(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'OpenAI-Beta': 'realtime=v1',
      },
    });

    upstream.on('open', () => {
      upstream?.send(JSON.stringify({
        type: 'session.update',
        session: {
          modalities: ['text'],
          input_audio_format: 'pcm',
          sample_rate: 16000,
          input_audio_transcription: { language },
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
        while (queuedCommits > 0 && upstream?.readyState === WebSocket.OPEN) {
          upstream.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
          queuedCommits--;
        }
        send(client, { type: 'ready' });
      } else if (type === 'conversation.item.input_audio_transcription.text') {
        send(client, { type: 'partial', text: `${event.text || ''}${event.stash || ''}`.trim() });
      } else if (type === 'conversation.item.input_audio_transcription.completed') {
        send(client, {
          type: 'final',
          turnId: committedTurnIds.shift() || '',
          text: String(event.transcript || '').trim(),
        });
      } else if (type === 'error') {
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
    if (!event) {
      send(client, { type: 'error', code: 'BAD_EVENT', message: '实时语音数据格式无效。' });
      return;
    }

    if (event.type === 'start') {
      if (started) return;
      started = true;
      language = /^[a-z-]{2,12}$/i.test(event.language || '') ? String(event.language) : 'zh';
      connectUpstream();
    } else if (event.type === 'audio') {
      if (/^[A-Za-z0-9+/]*={0,2}$/.test(event.audio) && event.audio.length <= 96_000) appendAudio(event.audio);
    } else if (event.type === 'commit' && event.turnId) {
      committedTurnIds.push(event.turnId);
      if (upstreamReady && upstream?.readyState === WebSocket.OPEN) {
        upstream.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
      } else {
        queuedCommits++;
      }
    } else if (event.type === 'discard') {
      queuedAudio.splice(0);
      queuedCommits = 0;
      if (upstreamReady && upstream?.readyState === WebSocket.OPEN) {
        upstream.send(JSON.stringify({ type: 'input_audio_buffer.clear' }));
      }
    } else if (event.type === 'close') {
      closeUpstream();
    }
  });

  client.on('close', closeUpstream);
  client.on('error', closeUpstream);
});

export default server;
