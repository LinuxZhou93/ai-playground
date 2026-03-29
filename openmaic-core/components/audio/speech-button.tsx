'use client';

import { useState, useCallback } from 'react';
import { Mic, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAudioRecorder } from '@/lib/hooks/use-audio-recorder';
import { useI18n } from '@/lib/hooks/use-i18n';
import { cn } from '@/lib/utils';

export interface SpeechButtonProps {
  onTranscription: (text: string) => void;
  className?: string;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export function SpeechButton({ 
  onTranscription, 
  className,
  textareaRef 
}: SpeechButtonProps) {
  const { t } = useI18n();
  const [showPanel, setShowPanel] = useState(false);
  
  const { 
    isRecording, 
    isProcessing, 
    recordingTime, 
    startRecording, 
    stopRecording, 
    cancelRecording 
  } = useAudioRecorder({
    onTranscription: (text) => {
      onTranscription(text);
      setShowPanel(false);
    },
    onError: (error) => {
      // Error is handled by useAudioRecorder (logs and potentially toasts)
      setShowPanel(false);
    }
  });

  const handleToggle = useCallback(() => {
    if (showPanel) {
      if (isRecording) stopRecording();
      setShowPanel(false);
    } else {
      setShowPanel(true);
      startRecording();
    }
  }, [showPanel, isRecording, startRecording, stopRecording]);

  const handleCancel = useCallback(() => {
    cancelRecording();
    setShowPanel(false);
  }, [cancelRecording]);

  return (
    <div className="relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleToggle}
            className={cn(
              "rounded-full transition-all duration-300",
              showPanel ? "bg-accent text-accent-foreground shadow-inner" : "text-muted-foreground hover:text-foreground",
              className
            )}
          >
            {isProcessing ? (
              <Loader2 className="size-4 animate-spin text-purple-500" />
            ) : (
              <Mic className={cn("size-4", showPanel && "text-purple-500")} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {t('roundtable.voiceInput')}
        </TooltipContent>
      </Tooltip>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 w-64 p-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-purple-200 dark:border-purple-800 rounded-2xl shadow-2xl ring-1 ring-purple-500/10"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="flex justify-between w-full items-center mb-1">
                <span className="text-[10px] font-bold tracking-widest text-purple-600 dark:text-purple-400 uppercase">
                  {isProcessing ? t('roundtable.processing') : t('roundtable.listening')}
                </span>
                <span className="text-xs font-mono text-muted-foreground w-10 text-right">
                  {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
              
              <div className="relative flex items-center justify-center w-20 h-20">
                {/* Background ripples */}
                {isRecording && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full border border-purple-400 dark:border-purple-600"
                    />
                    <motion.div
                      animate={{ scale: [1, 2.2], opacity: [0.2, 0] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full border border-purple-300 dark:border-purple-500"
                    />
                  </>
                )}
                
                {/* Main button */}
                <button
                  onClick={handleToggle}
                  className={cn(
                    "relative z-10 size-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
                    isProcessing 
                      ? "bg-gray-100 dark:bg-gray-700 cursor-wait" 
                      : "bg-gradient-to-br from-purple-500 to-indigo-600 hover:scale-105 active:scale-95 text-white"
                  )}
                >
                  {isProcessing ? (
                    <Loader2 className="size-6 animate-spin text-purple-500" />
                  ) : (
                    <Mic className="size-6" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-6 mt-1 w-full justify-center">
                <button
                  onClick={handleCancel}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="size-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-gray-900 group-hover:bg-red-50 dark:group-hover:bg-red-950/20 group-hover:border-red-200 dark:group-hover:border-red-800 transition-colors">
                    <X className="size-3.5 text-muted-foreground group-hover:text-red-500 transition-colors" />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground group-hover:text-red-500 transition-colors">
                    {t('common.cancel')}
                  </span>
                </button>
                
                {!isProcessing && (
                  <button
                    onClick={stopRecording}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div className="size-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-gray-900 group-hover:bg-purple-50 dark:group-hover:bg-purple-950/20 group-hover:border-purple-200 dark:group-hover:border-purple-800 transition-colors">
                      <div className="size-2 rounded-[1px] bg-purple-600" />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground group-hover:text-purple-600 transition-colors">
                      {t('roundtable.stopRecording')}
                    </span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-8 border-transparent border-t-white/95 dark:border-t-gray-800/95" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
