class Gamification {
    constructor() {
        this.RANKS = [
            { name: "Novice", minXP: 0 },
            { name: "Adept", minXP: 500 },
            { name: "Expert", minXP: 2000 },
            { name: "Master", minXP: 5000 },
            { name: "Neuromancer", minXP: 10000 }
        ];

        this.BADGES = [
            { id: 'speed_demon', name: 'Speed Demon', desc: 'Reaction Time < 200ms', icon: 'zap', check: (h) => h.find(r => r.url.includes('reaction') && r.metrics && r.metrics.avgMs < 200) },
            { id: 'sniper', name: 'Sniper', desc: 'Aim Trainer 100% Accuracy', icon: 'crosshair', check: (h) => h.find(r => r.url.includes('aim') && r.score >= 1000) }, // Approx high score check or need metric update
            { id: 'memory_palace', name: 'Memory Palace', desc: 'Digit Span Level 10+', icon: 'brain', check: (h) => h.find(r => r.url.includes('number') && r.metrics && r.metrics.level >= 10) },
            { id: 'zen_master', name: 'Zen Master', desc: 'Breath Hold > 30s', icon: 'wind', check: (h) => h.find(r => r.url.includes('breathing') && r.metrics && r.metrics.hold >= 30) },
            { id: 'typing_god', name: 'Typing God', desc: 'WPM > 100', icon: 'keyboard', check: (h) => h.find(r => r.url.includes('typing') && r.metrics && r.metrics.wpm > 100) },
            { id: 'hawk_eye', name: 'Hawk Eye', desc: 'Matrix Level 10+', icon: 'eye', check: (h) => h.find(r => r.url.includes('matrices') && r.metrics && r.metrics.level >= 10) },
            { id: 'iron_mind', name: 'Iron Mind', desc: 'Dual N-Back Level 4+', icon: 'shield', check: (h) => h.find(r => r.url.includes('working') && r.metrics && r.metrics.n >= 4) }
        ];
    }

    calculateXP(history) {
        // Simple heuristic: Sum of scores roughly normalized
        // Assumes most games return score 0-1000ish
        let total = 0;
        history.forEach(h => {
            // Cap per session to avoid exploits
            total += Math.min(100, Math.round(h.score / 10));
        });
        return total;
    }

    getRank(xp) {
        // Find highest rank where xp >= minXP
        let current = this.RANKS[0];
        let next = this.RANKS[1];

        for (let i = 0; i < this.RANKS.length; i++) {
            if (xp >= this.RANKS[i].minXP) {
                current = this.RANKS[i];
                next = this.RANKS[i + 1] || null;
            }
        }

        return {
            current: current,
            next: next,
            progress: next ? ((xp - current.minXP) / (next.minXP - current.minXP)) * 100 : 100
        };
    }

    checkBadges(history) {
        const unlocked = [];
        this.BADGES.forEach(b => {
            if (b.check(history)) {
                unlocked.push(b);
            }
        });
        return unlocked;
    }
}

// Export instance
window.Gamification = new Gamification();
