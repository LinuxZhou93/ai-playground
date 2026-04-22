import { useState } from 'react';

export function useCognitiveTask(config: any) {
    const [status, setStatus] = useState('IDLE');
    const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
    const [isStimulusVisible, setIsStimulusVisible] = useState(false);
    const [results, setResults] = useState<any[]>([]);

    const startTask = () => {
        setStatus('RUNNING');
    };

    const recordResponse = (type: any, data: any) => {
        setResults((prev: any) => [...prev, { type, data }]);
    };

    return {
        status,
        currentTrialIndex,
        isStimulusVisible,
        startTask,
        recordResponse,
        results
    };
}
