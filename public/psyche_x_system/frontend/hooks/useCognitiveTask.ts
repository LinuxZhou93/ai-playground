import { useState, useEffect, useRef, useCallback } from 'react';

// --- Type Definitions ---
export interface TrialData {
    trialIndex: number;
    stimulus: any;
    userResponse: any | null;
    isCorrect: boolean;
    reactionTime: number; // milliseconds
    timestamp: number;
}

export type TaskStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';

export interface CognitiveTaskConfig {
    totalTrials: number;
    stimulusDuration: number; // 刺激呈现时间 (ms)
    interStimulusInterval: number; // 刺激间隔 (ms)
    feedbackDuration?: number; // 反馈时间 (ms，可选)
}

// --- The Core Hook ---
export const useCognitiveTask = (config: CognitiveTaskConfig) => {
    const [status, setStatus] = useState<TaskStatus>('IDLE');
    const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
    const [results, setResults] = useState<TrialData[]>([]);
    const [currentStimulus, setCurrentStimulus] = useState<any>(null);
    const [isStimulusVisible, setIsStimulusVisible] = useState(false);

    // High-precision timing refs
    const trialStartTimeRef = useRef<number>(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // 1. Start the Task
    const startTask = useCallback(() => {
        setStatus('RUNNING');
        setCurrentTrialIndex(0);
        setResults([]);
        scheduleNextTrial();
    }, []);

    // 2. Schedule Next Trial (The Loop)
    const scheduleNextTrial = useCallback(() => {
        // 检查是否结束
        // Note: 在实际 Hook 中，这里需要结合具体的 Stimulus 生成逻辑
        // 为了通过 Hook 暴露控制权，我们通常只触发 "Ready for Stimulus" 状态

        // 这里简化逻辑：假设外部会监听 currentTrialIndex 并在变化时提供 Stimulus
        setIsStimulusVisible(true);
        trialStartTimeRef.current = performance.now();

        // 定时器：刺激消失
        timerRef.current = setTimeout(() => {
            setIsStimulusVisible(false);
            // 进入 ISI (间隔期)
            setTimeout(() => {
                advanceTrial();
            }, config.interStimulusInterval);
        }, config.stimulusDuration);

    }, [config]);

    // 3. Advance to Next
    const advanceTrial = useCallback(() => {
        setCurrentTrialIndex(prev => {
            const next = prev + 1;
            if (next >= config.totalTrials) {
                setStatus('COMPLETED');
                return prev;
            }
            // Loop
            requestAnimationFrame(() => {
                // 实际上这里应该再次调用 scheduleNextTrial，但因为 state update 是异步的
                // 我们通常在 useEffect 中监听 index 变化来驱动
            });
            return next;
        });
    }, [config.totalTrials]);

    // 4. Record Response (The Input)
    const recordResponse = useCallback((response: any, correctStimulus: any) => {
        if (status !== 'RUNNING') return;

        const now = performance.now();
        const rt = now - trialStartTimeRef.current;

        // 简单的判断逻辑 (可由外部覆盖)
        const isCorrect = JSON.stringify(response) === JSON.stringify(correctStimulus);

        setResults(prev => [...prev, {
            trialIndex: currentTrialIndex,
            stimulus: correctStimulus, // 这里假设我们知道正确答案
            userResponse: response,
            isCorrect,
            reactionTime: rt,
            timestamp: Date.now()
        }]);
    }, [status, currentTrialIndex]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return {
        status,
        currentTrialIndex,
        isStimulusVisible,
        startTask,
        recordResponse,
        results
    };
};
