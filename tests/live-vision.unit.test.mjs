import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../public/assets/js/live-vision.js', import.meta.url), 'utf8');
const instrumentedSource = source.replace(
  /window\.titanLiveVision = new LiveVisionCopilot\(\);\s*$/,
  'globalThis.LiveVisionCopilotForTest = LiveVisionCopilot;'
);

const storage = new Map();
const context = {
  console: { log() {}, warn() {}, error() {}, debug() {} },
  Blob,
  Date,
  JSON,
  Math,
  Promise,
  String,
  Array,
  Error,
  AbortController,
  performance,
  queueMicrotask,
  setTimeout,
  clearTimeout,
  requestAnimationFrame: () => 1,
  cancelAnimationFrame: () => {},
  localStorage: {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value)
  },
  window: {
    SubscriptionManager: { user: { id: 'unit-user' } },
    EdgeTTS: null,
    speechSynthesis: {
      cancel() {},
      getVoices: () => [],
      speak() {}
    }
  }
};
context.globalThis = context;
vm.createContext(context);
vm.runInContext(instrumentedSource, context, { filename: 'live-vision.js' });

const LiveVisionCopilot = context.LiveVisionCopilotForTest;

function createBareInstance() {
  const instance = Object.create(LiveVisionCopilot.prototype);
  instance.maxHistoryMessages = 24;
  instance.historyStorageKey = 'titan_live_vision_history_v2:unit-user';
  instance.liveHistory = [];
  instance.liveContextMessages = [];
  // These behavior tests exercise the legacy direct-audio branch explicitly.
  // Production defaults to the server-owned transcription pipeline.
  instance.pipelineConfig = { mode: 'direct', transcriptionModel: '', reasoningModel: '', transcriptionEndpoint: '' };
  instance.turnQueue = [];
  instance.pendingSpeech = null;
  instance.suspendedSpeech = null;
  instance.currentSpeechText = '';
  instance.maxQueuedTurns = 3;
  instance.runId = 1;
  instance.requestId = 1;
  instance.speechId = 1;
  instance.isActive = true;
  instance.isListening = true;
  instance.isProcessing = false;
  instance.isTtsPlaying = false;
  instance.isSpeaking = false;
  instance.isCandidateRecording = false;
  instance.recorderPendingStop = false;
  instance.isDiscardingNextAudio = false;
  instance.voiceCandidateSince = null;
  instance.candidateLastVoiceAt = 0;
  instance.candidateConfirmMs = 300;
  instance.speechWatchdog = null;
  instance.maxRecordingTimer = null;
  instance.noiseFloor = 18;
  instance.ttsNoiseFloor = 18;
  instance.audioChunks = [];
  instance.realtimeAsr = null;
  instance.realtimeTurn = null;
  instance.realtimeFinals = new Map();
  instance.realtimeCompletedTranscripts = new Map();
  instance.realtimeTurnSequence = 0;
  instance.statusText = { innerText: '' };
  instance.subtitle = { textContent: '' };
  return instance;
}

test('parses structured transcript/reply payload and fenced JSON', () => {
  const instance = createBareInstance();
  assert.deepEqual(
    { ...instance.parseModelPayload('```json\n{"transcript":"上一句","reply":"我记得","ignore":false}\n```') },
    { transcript: '上一句', reply: '我记得', ignore: false }
  );
});

test('falls back to a plain reply when a provider ignores the JSON protocol', () => {
  const instance = createBareInstance();
  assert.deepEqual(
    { ...instance.parseModelPayload('直接回答') },
    { transcript: '', reply: '直接回答', ignore: false }
  );
});

test('persists text history without image or audio Base64', () => {
  const instance = createBareInstance();
  instance.rememberTextTurn('用户原话', '助手回答');
  const saved = storage.get(instance.historyStorageKey);
  assert.match(saved, /用户原话/);
  assert.match(saved, /助手回答/);
  assert.doesNotMatch(saved, /input_audio|image_url|base64/);
});

test('retains twelve recent text turns and trims older context', () => {
  const instance = createBareInstance();
  for (let index = 1; index <= 15; index++) {
    instance.rememberTextTurn(`问题${index}`, `回答${index}`);
  }
  assert.equal(instance.liveContextMessages.length, 24);
  assert.equal(instance.liveContextMessages[0].content, '问题4');
  assert.equal(instance.liveContextMessages.at(-1).content, '回答15');
});

test('keeps untranscribed audio in memory but never writes it to localStorage', () => {
  const instance = createBareInstance();
  const currentUserMessage = {
    role: 'user',
    content: [
      { type: 'text', text: '当前语音' },
      { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,IMAGE_SECRET' } },
      { type: 'input_audio', input_audio: { data: 'AUDIO_SECRET', format: 'wav' } }
    ]
  };

  instance.rememberAudioTurn(currentUserMessage, '根据这段语音作答');
  const saved = storage.get(instance.historyStorageKey);
  assert.equal(instance.liveContextMessages[0].content.some(part => part.type === 'input_audio'), true);
  assert.equal(instance.liveContextMessages[0].content.some(part => part.type === 'image_url'), false);
  assert.doesNotMatch(saved, /AUDIO_SECRET|IMAGE_SECRET|input_audio|image_url/);
});

test('keeps only the latest untranscribed raw audio in request context', () => {
  const instance = createBareInstance();
  const audioMessage = secret => ({
    role: 'user',
    content: [{ type: 'input_audio', input_audio: { data: secret, format: 'wav' } }]
  });

  instance.rememberAudioTurn(audioMessage('AUDIO_OLD'), '第一答');
  instance.rememberAudioTurn(audioMessage('AUDIO_LATEST'), '第二答');

  const rawAudioMessages = instance.liveContextMessages.filter(message =>
    Array.isArray(message.content) && message.content.some(part => part.type === 'input_audio')
  );
  assert.equal(rawAudioMessages.length, 1);
  assert.equal(rawAudioMessages[0].content[0].input_audio.data, 'AUDIO_LATEST');
  assert.doesNotMatch(JSON.stringify(instance.liveContextMessages), /AUDIO_OLD/);
});

test('builds requests as system + ordered recent context + current multimodal turn', () => {
  const instance = createBareInstance();
  instance.liveContextMessages = [
    { role: 'user', content: '第一句' },
    { role: 'assistant', content: '第一答' }
  ];
  const current = { role: 'user', content: [{ type: 'input_audio' }] };
  const messages = instance.buildConversationMessages(current);
  assert.equal(messages[0].role, 'system');
  assert.equal(messages[1].content, '第一句');
  assert.equal(messages[2].content, '第一答');
  assert.equal(messages[3], current);
});

test('marks an interrupted assistant reply as not necessarily heard in the next request', () => {
  const instance = createBareInstance();
  instance.suspendedSpeech = { reply: '尚未播完', runId: 1 };
  const messages = instance.buildConversationMessages({ role: 'user', content: '继续刚才的' });
  assert.match(messages[0].content, /尚未完整播放/);
  assert.match(messages[0].content, /继续、刚才、那个/);
});

test('encodes decoded browser audio as a real mono PCM WAV', async () => {
  const instance = createBareInstance();
  const samples = new Float32Array(480);
  samples[0] = 0.5;
  const wavBlob = instance.encodePcmWav({
    sampleRate: 48000,
    duration: 0.01,
    numberOfChannels: 1,
    getChannelData: () => samples
  }, 16000);
  const header = new TextDecoder().decode((await wavBlob.arrayBuffer()).slice(0, 4));
  assert.equal(wavBlob.type, 'audio/wav');
  assert.equal(header, 'RIFF');
});

test('uses the site transcription gateway by default and honors an explicit relay endpoint', () => {
  const instance = createBareInstance();
  assert.equal(
    instance.getTranscriptionEndpoint('https://relay.example/v1/chat/completions'),
    '/api/transcription'
  );
  assert.equal(
    instance.getTranscriptionEndpoint('/v1beta/openai/chat/completions'),
    '/api/transcription'
  );
  assert.equal(
    instance.getTranscriptionEndpoint('https://relay.example/v1/chat/completions', 'https://asr.example/transcribe'),
    'https://asr.example/transcribe'
  );
});

test('discovers configured server ASR providers without reading client secrets', async () => {
  const instance = createBareInstance();
  let requestedUrl = '';
  context.fetch = async url => {
    requestedUrl = url;
    return { ok: true, json: async () => ({ success: true, data: { asr: { 'openai-whisper': {} } } }) };
  };

  const providers = await instance.probeServerAsr();
  assert.equal(requestedUrl, '/api/server-providers');
  assert.deepEqual({ ...providers }, { 'openai-whisper': {} });
});

test('uses a configured reasoning model after transcription rather than forcing the audio model', async () => {
  const instance = createBareInstance();
  instance.pipelineConfig = {
    mode: 'transcribe',
    transcriptionModel: 'asr-model',
    reasoningModel: 'strong-reasoning-model',
    transcriptionEndpoint: '/audio/transcriptions'
  };
  instance.prepareAudioForModel = async blob => blob;
  instance.transcribeAudio = async () => '请继续上一段';
  instance.rememberTextTurn = () => {};
  let requestBody;
  context.window.titanAIAssistant = {
    settings: { endpoint: '/v1/chat/completions', model: 'legacy-audio-model', apiKey: '' },
    _buildMultimodalMessage: text => ({ role: 'user', content: text })
  };
  context.fetch = async (_url, options) => {
    requestBody = JSON.parse(options.body);
    return { ok: true, json: async () => ({ choices: [{ message: { content: '{"reply":"我接着说","ignore":false}' } }] }) };
  };
  instance.startSpeech = () => true;

  const started = await instance.processTurn(
    { audioBlob: new Blob(['voice'], { type: 'audio/wav' }), imageData: null },
    1,
    1,
    new AbortController().signal
  );
  assert.equal(started, true);
  assert.equal(requestBody.model, 'strong-reasoning-model');
  assert.match(requestBody.messages.at(-1).content, /请继续上一段/);
});

test('records the candidate from its first frame and discards an unconfirmed short sound', () => {
  const instance = createBareInstance();
  const recorder = {
    state: 'inactive',
    start() { this.state = 'recording'; },
    stop() { this.state = 'inactive'; }
  };
  instance.mediaRecorder = recorder;
  instance.beginCandidateRecording(100);
  assert.equal(instance.isCandidateRecording, true);
  assert.equal(recorder.state, 'recording');

  instance.cancelCandidateRecording();
  assert.equal(instance.isDiscardingNextAudio, true);
  assert.equal(instance.recorderPendingStop, true);
  assert.equal(recorder.state, 'inactive');
});

test('queues the first realtime turn while the websocket is still connecting', () => {
  const instance = createBareInstance();
  const socket = { readyState: 0, send() {} };
  instance.realtimeAsr = { socket, ready: false, runId: 1, pendingEvents: [] };

  const turn = instance.beginRealtimeTurn();
  assert.ok(turn?.id);
  assert.equal(instance.sendRealtimeEvent({ type: 'audio', audio: 'PCM' }), true);
  instance.commitRealtimeTurn(turn);
  assert.deepEqual(
    instance.realtimeAsr.pendingEvents.map(event => event.type),
    ['audio', 'commit']
  );
});

test('flushes cached audio and commit after the realtime websocket opens', () => {
  const instance = createBareInstance();
  const sent = [];
  class FakeWebSocket {
    constructor() { this.readyState = 0; }
    send(payload) { sent.push(JSON.parse(payload)); }
    close() { this.readyState = 3; }
  }
  const originalWebSocket = context.WebSocket;
  const originalWindowWebSocket = context.window.WebSocket;
  const originalWindowLocation = context.window.location;
  context.WebSocket = FakeWebSocket;
  context.window.WebSocket = FakeWebSocket;
  context.window.location = { protocol: 'https:', host: 'preview.example' };

  instance.connectRealtimeAsr(1);
  const turn = instance.beginRealtimeTurn();
  instance.sendRealtimeEvent({ type: 'audio', audio: 'PCM' });
  instance.commitRealtimeTurn(turn);
  instance.realtimeAsr.socket.readyState = 1;
  instance.realtimeAsr.socket.onopen();

  assert.deepEqual(sent.map(event => event.type), ['start', 'audio', 'commit']);
  context.WebSocket = originalWebSocket;
  context.window.WebSocket = originalWindowWebSocket;
  context.window.location = originalWindowLocation;
});

test('uses the latest realtime partial when the final event is slightly late', async () => {
  const instance = createBareInstance();
  instance.realtimeAsr = { ready: true };
  const transcript = await instance.waitForRealtimeFinal({ id: 'turn-partial', partial: '第一句话' }, 1);
  assert.equal(transcript, '第一句话');
});

test('freezes the adaptive noise floor while a real voice candidate is being confirmed', () => {
  const instance = createBareInstance();
  let now = 0;
  let nextFrame = null;
  const originalPerformance = context.performance;
  const originalRequestAnimationFrame = context.requestAnimationFrame;
  const originalAudioContext = context.window.AudioContext;
  context.performance = { now: () => now };
  context.requestAnimationFrame = callback => {
    nextFrame = callback;
    return 1;
  };

  const analyser = {
    frequencyBinCount: 256,
    getByteFrequencyData(data) {
      data.fill(29);
      for (let index = 2; index <= 44; index++) data[index] = 35;
    }
  };
  context.window.AudioContext = class FakeAudioContext {
    constructor() { this.sampleRate = 48000; }
    createAnalyser() { return analyser; }
    createMediaStreamSource() { return { connect() {} }; }
  };
  instance.mediaRecorder = {
    state: 'inactive',
    start() { this.state = 'recording'; },
    stop() { this.state = 'inactive'; }
  };
  instance.canvasWave = { width: 800, height: 80 };
  instance.ctxWave = {
    clearRect() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {}
  };

  instance.setupAudioVisualizerAndVAD({});
  const floorAfterFirstFrame = instance.noiseFloor;
  for (now = 60; now <= 300; now += 60) {
    const frame = nextFrame;
    nextFrame = null;
    frame();
  }

  assert.equal(instance.noiseFloor, floorAfterFirstFrame);
  assert.equal(instance.isSpeaking, true);
  clearTimeout(instance.maxRecordingTimer);
  instance.maxRecordingTimer = null;
  context.performance = originalPerformance;
  context.requestAnimationFrame = originalRequestAnimationFrame;
  context.window.AudioContext = originalAudioContext;
});

test('stale request and speech tokens cannot overwrite a newer turn', () => {
  const instance = createBareInstance();
  assert.equal(instance.isRequestCurrent(1, 1), true);
  instance.requestId = 2;
  assert.equal(instance.isRequestCurrent(1, 1), false);

  instance.isTtsPlaying = true;
  instance.isProcessing = true;
  instance.finishSpeech(0);
  assert.equal(instance.isTtsPlaying, true);
  assert.equal(instance.isProcessing, true);
});

test('a reply that returns during a barge-in candidate is saved but not spoken over the user', async () => {
  const instance = createBareInstance();
  instance.isCandidateRecording = true;
  instance.prepareAudioForModel = async blob => blob;
  instance.blobToBase64 = async () => 'AUDIO';
  instance.rememberTextTurn = () => {};
  let speechCalls = 0;
  instance.startSpeech = () => {
    speechCalls++;
    return true;
  };

  context.window.titanAIAssistant = {
    settings: { endpoint: '/mock', model: 'mock-model', apiKey: '' },
    _buildMultimodalMessage: () => ({ role: 'user', content: [{ type: 'input_audio' }] })
  };
  context.fetch = async () => ({
    ok: true,
    json: async () => ({
      choices: [{ message: { content: '{"transcript":"等一下","reply":"好的，我先停一下","ignore":false}' } }]
    })
  });

  const started = await instance.processTurn(
    { audioBlob: new Blob(['voice'], { type: 'audio/webm' }), imageData: null },
    1,
    1,
    new AbortController().signal
  );
  assert.equal(started, false);
  assert.equal(speechCalls, 0);
});

test('semantic background classification resumes the suspended answer', async () => {
  const instance = createBareInstance();
  instance.suspendedSpeech = { reply: '继续旧回答', runId: 1 };
  instance.prepareAudioForModel = async blob => blob;
  instance.blobToBase64 = async () => 'AUDIO';
  let allowWhileProcessing;
  instance.resumeSuspendedSpeech = allow => {
    allowWhileProcessing = allow;
    return true;
  };

  context.window.titanAIAssistant = {
    settings: { endpoint: '/mock', model: 'mock-model', apiKey: '' },
    _buildMultimodalMessage: () => ({ role: 'user', content: [{ type: 'input_audio' }] })
  };
  context.fetch = async () => ({
    ok: true,
    json: async () => ({
      choices: [{ message: { content: '{"transcript":"","reply":"","ignore":true}' } }]
    })
  });

  const started = await instance.processTurn(
    { audioBlob: new Blob(['noise'], { type: 'audio/webm' }), imageData: null },
    1,
    1,
    new AbortController().signal
  );
  assert.equal(started, true);
  assert.equal(allowWhileProcessing, true);
  assert.match(instance.subtitle.textContent, /继续刚才/);
});

test('does not resume or speak over a confirmed recording whose stop event is still pending', async () => {
  const instance = createBareInstance();
  instance.recorderPendingStop = true;
  instance.isDiscardingNextAudio = false;
  instance.prepareAudioForModel = async blob => blob;
  instance.blobToBase64 = async () => 'AUDIO';
  instance.rememberTextTurn = () => {};
  let speechCalls = 0;
  instance.startSpeech = () => { speechCalls++; return true; };

  context.window.titanAIAssistant = {
    settings: { endpoint: '/mock', model: 'mock-model', apiKey: '' },
    _buildMultimodalMessage: () => ({ role: 'user', content: [{ type: 'input_audio' }] })
  };
  context.fetch = async () => ({
    ok: true,
    json: async () => ({
      choices: [{ message: { content: '{"transcript":"补充中","reply":"旧轮回答","ignore":false}' } }]
    })
  });

  const started = await instance.processTurn(
    { audioBlob: new Blob(['voice'], { type: 'audio/webm' }), imageData: null },
    1,
    1,
    new AbortController().signal
  );
  assert.equal(started, false);
  assert.equal(speechCalls, 0);
  assert.equal(instance.suspendedSpeech.reply, '旧轮回答');
});

test('background classification waits for an uncommitted newer recording before resuming', async () => {
  const instance = createBareInstance();
  instance.suspendedSpeech = {
    reply: '暂停中的旧回答',
    runId: 1,
    canResume: false,
    speechToken: null
  };
  instance.recorderPendingStop = true;
  instance.isDiscardingNextAudio = false;
  instance.prepareAudioForModel = async blob => blob;
  instance.blobToBase64 = async () => 'AUDIO';

  context.window.titanAIAssistant = {
    settings: { endpoint: '/mock', model: 'mock-model', apiKey: '' },
    _buildMultimodalMessage: () => ({ role: 'user', content: [{ type: 'input_audio' }] })
  };
  context.fetch = async () => ({
    ok: true,
    json: async () => ({
      choices: [{ message: { content: '{"transcript":"","reply":"","ignore":true}' } }]
    })
  });

  const started = await instance.processTurn(
    { audioBlob: new Blob(['noise'], { type: 'audio/webm' }), imageData: null },
    1,
    1,
    new AbortController().signal
  );
  assert.equal(started, false);
  assert.equal(instance.suspendedSpeech.reply, '暂停中的旧回答');
});

test('a validation failure does not leave the old answer permanently suspended', async () => {
  const instance = createBareInstance();
  instance.turnQueue = [{ runId: 1, audioBlob: new Blob(['voice']) }];
  instance.processTurn = async () => { throw new Error('temporary network error'); };
  let allowWhileProcessing;
  instance.resumeSuspendedSpeech = allow => {
    allowWhileProcessing = allow;
    return true;
  };

  await instance.drainTurnQueue();

  assert.equal(allowWhileProcessing, true);
  assert.equal(instance.isProcessing, true);
  assert.match(instance.subtitle.textContent, /继续原回答/);
});

test('pausing while idle does not discard the first phrase after resume', () => {
  const instance = createBareInstance();
  instance.mediaRecorder = { state: 'inactive' };
  instance.currentAbortController = null;
  instance.micToggleBtn = { innerText: '', style: {} };
  instance.cancelSpeechPlayback = () => {};
  instance.isDiscardingNextAudio = false;
  instance.pauseListening();
  assert.equal(instance.isDiscardingNextAudio, false);
});

test('a short unconfirmed interruption resumes the pending assistant reply', () => {
  const instance = createBareInstance();
  instance.isCandidateRecording = true;
  instance.voiceCandidateSince = 10;
  instance.mediaRecorder = {
    state: 'recording',
    stop() { this.state = 'inactive'; }
  };
  instance.pendingSpeech = { reply: '继续原回答', runId: 1, requestId: 1 };
  let spoken = '';
  instance.startSpeech = reply => {
    spoken = reply;
    instance.isTtsPlaying = true;
    return true;
  };

  instance.cancelCandidateRecording();
  assert.equal(spoken, '继续原回答');
  assert.equal(instance.pendingSpeech, null);
  assert.equal(instance.isDiscardingNextAudio, true);
});

test('a confirmed interruption preserves a pending old reply for semantic background filtering', () => {
  const instance = createBareInstance();
  instance.isCandidateRecording = true;
  instance.pendingSpeech = { reply: '稍后可以继续播报', runId: 1, requestId: 1 };
  instance.confirmCandidateRecording();
  assert.equal(instance.pendingSpeech, null);
  assert.equal(instance.suspendedSpeech.reply, '稍后可以继续播报');
  assert.equal(instance.suspendedSpeech.canResume, false);
  assert.equal(instance.isSpeaking, true);
  clearTimeout(instance.maxRecordingTimer);
  instance.maxRecordingTimer = null;
});

test('confirmed speech pauses an active reply and background classification resumes it', async () => {
  const instance = createBareInstance();
  let pauseCalls = 0;
  let resumeCalls = 0;
  context.window.EdgeTTS = {
    pause() { pauseCalls++; return true; },
    resume() { resumeCalls++; return true; },
    cancel() {}
  };
  instance.isTtsPlaying = true;
  instance.isProcessing = true;
  instance.currentSpeechText = '正在播报的旧回答';
  instance.speechId = 8;

  assert.equal(instance.suspendSpeechPlaybackForCandidate(), true);
  assert.equal(pauseCalls, 1);
  assert.equal(instance.isTtsPlaying, false);
  assert.equal(instance.suspendedSpeech.reply, '正在播报的旧回答');

  assert.equal(instance.resumeSuspendedSpeech(), true);
  assert.equal(resumeCalls, 1);
  assert.equal(instance.isTtsPlaying, true);
  assert.equal(instance.speechId, 8);
  clearTimeout(instance.speechWatchdog);
  instance.speechWatchdog = null;
  context.window.EdgeTTS = null;
});

test('a suspended reply cannot resume while a newer voice turn is queued', () => {
  const instance = createBareInstance();
  instance.suspendedSpeech = {
    reply: '旧回答',
    runId: 1,
    canResume: false,
    speechToken: null
  };
  instance.turnQueue.push({ runId: 1 });
  let replayCalls = 0;
  instance.startSpeech = () => { replayCalls++; return true; };

  assert.equal(instance.resumeSuspendedSpeech(), false);
  assert.equal(replayCalls, 0);
  assert.equal(instance.suspendedSpeech.reply, '旧回答');
});

test('replaying an unpausable suspended reply keeps the processing lock', () => {
  const instance = createBareInstance();
  instance.suspendedSpeech = {
    reply: '从头继续旧回答',
    runId: 1,
    canResume: false,
    speechToken: null
  };
  context.window.EdgeTTS = {
    cancel() {},
    speak: () => new Promise(() => {})
  };

  assert.equal(instance.resumeSuspendedSpeech(), true);
  assert.equal(instance.isTtsPlaying, true);
  assert.equal(instance.isProcessing, true);
  clearTimeout(instance.speechWatchdog);
  instance.speechWatchdog = null;
  context.window.EdgeTTS = null;
});

test('a short candidate cannot resume old audio while a newer model request is active', () => {
  const instance = createBareInstance();
  instance.isProcessing = true;
  instance.suspendedSpeech = {
    reply: '旧回答',
    runId: 1,
    canResume: false,
    speechToken: null
  };
  let replayCalls = 0;
  instance.startSpeech = () => { replayCalls++; return true; };

  assert.equal(instance.resumeSuspendedSpeech(), false);
  assert.equal(replayCalls, 0);
  assert.equal(instance.suspendedSpeech.reply, '旧回答');
});

test('start creates MediaRecorder from the audio track only', async () => {
  const instance = createBareInstance();
  instance.isActive = false;
  instance.videoStream = null;
  instance.hud = { style: { display: 'none' } };
  instance.video = { srcObject: null };
  instance.subtitle = { innerText: '', innerHTML: '', textContent: '' };
  instance.statusText = { innerText: '' };
  instance.refreshHistoryForCurrentUser = () => {};
  instance.setupAudioVisualizerAndVAD = () => {};

  const audioTrack = { kind: 'audio', stop() {} };
  const videoTrack = { kind: 'video', stop() {} };
  const sourceStream = {
    getAudioTracks: () => [audioTrack],
    getTracks: () => [audioTrack, videoTrack]
  };
  let recorderStream;

  context.navigator = {
    mediaDevices: { getUserMedia: async () => sourceStream }
  };
  context.MediaStream = class FakeMediaStream {
    constructor(tracks) { this.tracks = tracks; }
  };
  context.MediaRecorder = class FakeMediaRecorder {
    static isTypeSupported(type) { return type === 'audio/webm;codecs=opus'; }
    constructor(stream, options) {
      recorderStream = stream;
      this.state = 'inactive';
      this.mimeType = options?.mimeType || '';
    }
  };

  await instance.start();
  assert.deepEqual(recorderStream.tracks, [audioTrack]);
  assert.equal(recorderStream.tracks.includes(videoTrack), false);
});

test('a stale getUserMedia rejection cannot tear down a newer live session', async () => {
  const instance = createBareInstance();
  instance.isActive = false;
  instance.phase = 'STOPPED';
  instance.videoStream = null;
  instance.audioContext = null;
  instance.hud = { style: { display: 'none' } };
  instance.video = { srcObject: null };
  instance.subtitle = { innerText: '', innerHTML: '', textContent: '' };
  instance.statusText = { innerText: '' };
  instance.refreshHistoryForCurrentUser = () => {};

  let rejectOldPermission;
  context.navigator = {
    mediaDevices: {
      getUserMedia: () => new Promise((resolve, reject) => {
        rejectOldPermission = reject;
      })
    }
  };

  const oldStart = instance.start();
  let newTrackStopped = false;
  let newAudioClosed = false;
  instance.runId++;
  instance.isActive = true;
  instance.phase = 'LISTENING';
  instance.videoStream = {
    getTracks: () => [{ stop() { newTrackStopped = true; } }]
  };
  instance.audioContext = {
    close() { newAudioClosed = true; return Promise.resolve(); }
  };

  rejectOldPermission(new Error('old permission request failed'));
  await oldStart;

  assert.equal(instance.isActive, true);
  assert.equal(instance.phase, 'LISTENING');
  assert.equal(newTrackStopped, false);
  assert.equal(newAudioClosed, false);
});
