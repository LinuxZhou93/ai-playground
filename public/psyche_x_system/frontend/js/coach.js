class Coach {
    constructor() {
        this.DOMAINS = ['MEMORY', 'ATTENTION', 'PERCEPTION', 'LOGIC', 'RELAX', 'MOTOR'];
    }

    analyze(history) {
        const stats = {};
        this.DOMAINS.forEach(d => stats[d] = { count: 0, totalScore: 0, avg: 0 });

        history.forEach(h => {
            const d = h.domain ? h.domain.toUpperCase() : 'UNKNOWN';
            if (stats[d]) {
                stats[d].count++;
                stats[d].totalScore += h.score;
            }
        });

        Object.keys(stats).forEach(d => {
            if (stats[d].count > 0) {
                stats[d].avg = Math.round(stats[d].totalScore / stats[d].count);
            }
        });

        // Find Weakest and Strongest
        let weakest = null;
        let strongest = null;
        let min = Infinity;
        let max = -1;

        this.DOMAINS.forEach(d => {
            // Ignore RELAX for skill ranking
            if (d === 'RELAX') return;

            if (stats[d].avg < min && stats[d].count > 0) {
                min = stats[d].avg;
                weakest = d;
            }
            if (stats[d].avg > max && stats[d].count > 0) {
                max = stats[d].avg;
                strongest = d;
            }
        });

        // Fallback defaults
        if (!weakest) weakest = 'MEMORY';
        if (!strongest) strongest = 'PERCEPTION';

        return { stats, weakest, strongest };
    }

    getDailyWorkout(history, catalog) {
        const analysis = this.analyze(history);
        const { weakest, strongest } = analysis;

        // 1. Warm Up: Relax or Perception (Low intensity)
        const warmups = catalog.filter(t => t.domain === 'RELAX' || t.domain === 'PERCEPTION');
        const warmUpTask = warmups[Math.floor(Math.random() * warmups.length)];

        // 2. Focus: Weakest Domain
        const focusTasks = catalog.filter(t => t.domain === weakest);
        const focusTask = focusTasks.length > 0 ? focusTasks[Math.floor(Math.random() * focusTasks.length)] : catalog[0];

        // 3. Challenge: Strongest Domain or High Difficulty Logic
        const challengeTasks = catalog.filter(t => t.domain === strongest || t.domain === 'LOGIC');
        const challengeTask = challengeTasks.length > 0 ? challengeTasks[Math.floor(Math.random() * challengeTasks.length)] : catalog[1];

        return {
            tasks: [warmUpTask, focusTask, challengeTask],
            reasoning: `Focusing on ${weakest} to balance your profile, while maintaining your edge in ${strongest}.`
        };
    }

    getInsight(history) {
        const { weakest, strongest, stats } = this.analyze(history);
        if (stats[weakest].count === 0) return "Start training to generate insights.";

        const insights = [
            `Your ${strongest} is elite, but ${weakest} is lagging behind.`,
            `Balanced training is key. Dedicate more time to ${weakest}.`,
            `You are dominating in ${strongest}. Push your limits there!`,
            `Don't neglect ${weakest}. It's your current bottleneck.`
        ];

        return insights[Math.floor(Math.random() * insights.length)];
    }
}

window.Coach = new Coach();
