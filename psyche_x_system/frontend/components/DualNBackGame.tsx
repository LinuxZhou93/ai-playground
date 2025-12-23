import React, { useState, useEffect, useCallback } from 'react';
import { useCognitiveTask } from '@/hooks/useCognitiveTask';

// 3x3 Grid
const GRID_SIZE = 9;

interface DualNBackProps {
    nLevel: number; // N-Back Level (e.g., 2-back)
    onComplete: (data: any) => void;
}

const DualNBackGame: React.FC<DualNBackProps> = ({ nLevel, onComplete }) => {
    // 游戏状态
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<'HIT' | 'MISS' | 'FALSE' | null>(null);

    // 认知引擎配置
    const {
        status,
        currentTrialIndex,
        isStimulusVisible,
        startTask,
        recordResponse,
        results
    } = useCognitiveTask({
        totalTrials: 20 + nLevel * 5, // 动态调整试次
        stimulusDuration: 2000,
        interStimulusInterval: 500
    });

    // 这里模拟生成 stimulus 流 (实际上应该预先生成)
    // 简单起见，我们随机生成位置 (0-8) 和 字母 (A-H)
    const [currentStimulus, setCurrentStimulus] = useState<{ position: number, letter: string } | null>(null);
    const [stimulusStream, setStimulusStream] = useState<Array<{ position: number, letter: string }>>([]);

    // 初始化任务流
    useEffect(() => {
        if (status === 'RUNNING' && stimulusStream.length === 0) {
            // 生成序列 (伪代码)
            const stream = Array.from({ length: 50 }).map(() => ({
                position: Math.floor(Math.random() * 9),
                letter: String.fromCharCode(65 + Math.floor(Math.random() * 8))
            }));
            setStimulusStream(stream);
        }
    }, [status]);

    // 监听 Trial 变化，更新当前的 Stimulus
    useEffect(() => {
        if (status === 'RUNNING' && stimulusStream[currentTrialIndex]) {
            setCurrentStimulus(stimulusStream[currentTrialIndex]);
            setFeedback(null); // 重置反馈
        }
    }, [currentTrialIndex, status, stimulusStream]);

    // 处理用户按键 (Keyboard: 'A' for Position, 'L' for Audio)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isStimulusVisible) return;

            if (e.code === 'KeyA') {
                // Check N-Back Match (Position)
                const targetStimulus = stimulusStream[currentTrialIndex - nLevel];
                const isMatch = targetStimulus && targetStimulus.position === currentStimulus?.position;

                if (isMatch) {
                    setFeedback('HIT');
                    setScore(s => s + 10);
                } else {
                    setFeedback('FALSE');
                    setScore(s => s - 5);
                }

                recordResponse({ type: 'position_match' }, { isMatch });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentTrialIndex, isStimulusVisible, nLevel, stimulusStream, currentStimulus]);

    // 渲染网格
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-green-500 font-mono">
            <div className="mb-4">
                <h1 className="text-2xl font-bold">PROTOCOL: DUAL-{nLevel}-BACK</h1>
                <div className="flex justify-between w-96 mt-2">
                    <span>Trial: {currentTrialIndex}</span>
                    <span>Score: {score}</span>
                </div>
            </div>

            {/* Matrix Container */}
            <div className="grid grid-cols-3 gap-2 w-96 h-96 bg-gray-800 p-2 border border-green-700 shadow-[0_0_20px_rgba(0,255,0,0.2)]">
                {Array.from({ length: GRID_SIZE }).map((_, idx) => (
                    <div
                        key={idx}
                        className={`
                            border border-green-900 rounded flex items-center justify-center transition-all duration-100
                            ${isStimulusVisible && currentStimulus?.position === idx ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-black'}
                        `}
                    >
                        {/* Visual Stimulus */}
                    </div>
                ))}
            </div>

            {/* Feedback Overlay */}
            {feedback && (
                <div className={`absolute text-4xl font-bold ${feedback === 'HIT' ? 'text-green-400' : 'text-red-500'}`}>
                    {feedback}
                </div>
            )}

            {/* Controls */}
            {status === 'IDLE' && (
                <button
                    onClick={startTask}
                    className="mt-8 px-8 py-3 bg-green-700 hover:bg-green-600 text-white font-bold rounded shadow-lg"
                >
                    INITIATE SEQUENCE
                </button>
            )}

            {status === 'COMPLETED' && (
                <div className="mt-8 text-center">
                    <p className="text-xl text-blue-400">SEQUENCE COMPLETE</p>
                    <button
                        onClick={() => onComplete(results)}
                        className="mt-4 px-6 py-2 border border-green-500 text-green-500 hover:bg-green-900"
                    >
                        UPLOAD NEURO-DATA
                    </button>
                </div>
            )}

            <div className="mt-8 text-xs text-gray-500">
                [KEY 'A'] MATCH POSITION  |  [KEY 'L'] MATCH AUDIO
            </div>
        </div>
    );
};

export default DualNBackGame;
