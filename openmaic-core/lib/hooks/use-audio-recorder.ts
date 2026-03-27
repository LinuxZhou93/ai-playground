import { useState, useRef, useCallback } from 'react';
import { createLogger } from '@/lib/logger';

const log = createLogger('AudioRecorder');

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface UseAudioRecorderOptions {
  onTranscription?: (text: string) => void;
  onError?: (error: string) => void;
}

export function useAudioRecorder(options: UseAudioRecorderOptions = {}) {
  const { onTranscription, onError } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const busyRef = useRef(false);

  // Start recording
  const startRecording = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      if (typeof window === 'undefined') return;

      if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
        onError?.('您的浏览器不支持语音识别功能，请使用 Chrome 或 Edge 浏览器。');
        busyRef.current = false;
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = 'zh-CN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingTime(0);
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscription?.(transcript);
      };

      recognition.onerror = (event: any) => {
        log.error('Speech recognition error:', event.error);
        let errorMessage = '语音识别失败';
        switch (event.error) {
          case 'aborted':
            break;
          case 'no-speech':
            errorMessage = '未检测到语音输入';
            break;
          case 'audio-capture':
            errorMessage = '无法访问麦克风';
            break;
          case 'not-allowed':
            errorMessage = '麦克风权限被拒绝';
            break;
          default:
            errorMessage = `语音识别错误: ${event.error}`;
        }
        if (event.error !== 'aborted') onError?.(errorMessage);
        
        setIsRecording(false);
        busyRef.current = false;
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        busyRef.current = false;
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      recognition.start();
      speechRecognitionRef.current = recognition;
    } catch (error) {
      busyRef.current = false;
      log.error('Failed to start recording:', error);
      onError?.('无法启动语音识别');
    }
  }, [onTranscription, onError]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      speechRecognitionRef.current = null;
    }
    setIsRecording(false);
    busyRef.current = false;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cancel recording
  const cancelRecording = useCallback(() => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.onresult = null;
      speechRecognitionRef.current.onerror = null;
      speechRecognitionRef.current.stop();
      speechRecognitionRef.current = null;
    }
    setIsRecording(false);
    busyRef.current = false;
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
