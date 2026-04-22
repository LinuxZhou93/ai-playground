import { useState, useRef, useCallback, useEffect } from 'react';
import { createLogger } from '@/lib/logger';
import { useSettingsStore } from '@/lib/store/settings';

const log = createLogger('AudioRecorder');

export interface UseAudioRecorderOptions {
  onTranscription?: (text: string) => void;
  onError?: (error: string) => void;
}

export function useAudioRecorder(options: UseAudioRecorderOptions = {}) {
  const { onTranscription, onError } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Request transcription from backend
  const transcribeAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const { asrProviderId, asrLanguage, asrProvidersConfig } = useSettingsStore.getState();
      const config = asrProvidersConfig[asrProviderId];

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('providerId', asrProviderId);
      formData.append('language', asrLanguage || 'auto');
      
      if (config?.apiKey) formData.append('apiKey', config.apiKey);
      if (config?.baseUrl) formData.append('baseUrl', config.baseUrl);

      const response = await fetch('/api/transcription', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription API error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.data?.text) {
        onTranscription?.(data.data.text);
      } else if (data.success && !data.data?.text) {
        log.warn('Empty transcription result');
      } else {
        throw new Error(data.error || 'Transcription failed');
      }
    } catch (error) {
      log.error('Failed to transcribe audio:', error);
      onError?.('语音转换文字失败，请检查网络或稍后重试');
    } finally {
      setIsProcessing(false);
    }
  };

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 0) {
          await transcribeAudio(audioBlob);
        }
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      log.error('Failed to start recording:', error);
      if (error instanceof Error && (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError')) {
        onError?.('麦克风权限被拒绝，请在浏览器设置中开启权限。');
      } else {
        onError?.('无法开启录音功能，请检查设备。');
      }
    }
  }, [onTranscription, onError]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cancel recording
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      // Clear onstop so we don't transcribe
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
    setIsProcessing(false);
    setRecordingTime(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    isRecording,
    isProcessing,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}

