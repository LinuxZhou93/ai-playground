import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../public/assets/js/edge-tts.js', import.meta.url), 'utf8');
const instrumentedSource = source.replace(
  /window\.EdgeTTS = EdgeTTS;\s*$/,
  'globalThis.EdgeTTSForTest = EdgeTTS;'
);

const revoked = [];
const context = {
  console,
  Promise,
  AbortController,
  setTimeout,
  clearTimeout,
  URL: {
    revokeObjectURL: url => revoked.push(url)
  },
  window: {
    speechSynthesis: { cancel() {} }
  }
};
context.globalThis = context;
vm.createContext(context);
vm.runInContext(instrumentedSource, context, { filename: 'edge-tts.js' });

const EdgeTTS = context.EdgeTTSForTest;

test('cancel aborts an in-flight external TTS request and releases its object URL', () => {
  const controller = new AbortController();
  let cancelledPromiseResolved = false;
  let paused = false;
  let sourceRemoved = false;
  context.window.__titan_external_tts_abort__ = controller;
  context.window.__titan_external_audio__ = {
    __titan_object_url__: 'blob:voice-1',
    __titan_cancel_resolve__: () => { cancelledPromiseResolved = true; },
    onended: () => {},
    onerror: () => {},
    currentTime: 5,
    pause() { paused = true; },
    removeAttribute(name) { if (name === 'src') sourceRemoved = true; },
    load() {}
  };

  EdgeTTS.cancel();

  assert.equal(controller.signal.aborted, true);
  assert.equal(context.window.__titan_external_tts_abort__, null);
  assert.equal(context.window.__titan_external_audio__, null);
  assert.equal(paused, true);
  assert.equal(sourceRemoved, true);
  assert.equal(cancelledPromiseResolved, true);
  assert.deepEqual(revoked, ['blob:voice-1']);
});

test('cancel prevents a native voice lookup from starting ghost audio later', async () => {
  let releaseVoiceLookup;
  let speakCalls = 0;
  context.SpeechSynthesisUtterance = class FakeUtterance {};
  context.window.speechSynthesis = {
    cancel() {},
    speak() { speakCalls++; },
    getVoices: () => []
  };
  EdgeTTS._getBestNativeVoice = () => new Promise(resolve => {
    releaseVoiceLookup = resolve;
  });

  const playback = new Promise((resolve, reject) => {
    EdgeTTS.speakViaBrowserNative('不会幽灵播放', {}, resolve, reject);
  });
  EdgeTTS.cancel();
  releaseVoiceLookup(null);
  await playback;

  assert.equal(speakCalls, 0);
});

test('pause and resume preserve external audio instead of cancelling it', () => {
  let pauseCalls = 0;
  let playCalls = 0;
  const audio = {
    ended: false,
    paused: false,
    pause() { pauseCalls++; this.paused = true; },
    play() { playCalls++; this.paused = false; return Promise.resolve(); }
  };
  context.window.__titan_external_audio__ = audio;

  assert.equal(EdgeTTS.pause(), true);
  assert.equal(pauseCalls, 1);
  assert.equal(EdgeTTS.resume(), true);
  assert.equal(playCalls, 1);
  assert.equal(context.window.__titan_external_audio__, audio);
  context.window.__titan_external_audio__ = null;
});
