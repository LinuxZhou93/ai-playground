/**
 * PSYCHE-X DATA MANAGER
 * Simulates a secure backend for storing assessment results and generating reports.
 */

class DataManager {
    constructor() {
        this.dbName = 'psyche_x_db_v1';
        this.init();
        // Background Sync
        setTimeout(() => this.sync(), 1000);
    }

    init() {
        if (!localStorage.getItem(this.dbName)) {
            localStorage.setItem(this.dbName, JSON.stringify([]));
        }
    }

    async sync() {
        if (window.DataClient && window.DataClient.useCloud) {
            try {
                const cloudHistory = await window.DataClient.getHistory(); // This is async fetch
                if (Array.isArray(cloudHistory)) {
                    // Safe Merge Strategy: Cloud + Local Unsynced
                    const localHistory = this.getHistory();
                    const merged = [...cloudHistory];

                    localHistory.forEach(localItem => {
                        // Deduplicate: If local item ID or Timestamp is NOT in cloud list, keep it
                        const exists = merged.find(c =>
                            (c.id && localItem.id && c.id === localItem.id) ||
                            (c.created_at === localItem.timestamp) ||
                            (c.timestamp === localItem.timestamp)
                        );
                        if (!exists) {
                            merged.push(localItem);
                        }
                    });

                    // Sort Descending
                    merged.sort((a, b) => new Date(b.timestamp || b.created_at || 0) - new Date(a.timestamp || a.created_at || 0));

                    localStorage.setItem(this.dbName, JSON.stringify(merged));
                    console.log(`[DataManager] Sync Complete. Total: ${merged.length}`);

                    // Optional: Refresh simple UI elements if needed
                    if (document.getElementById('kpi-sessions')) document.getElementById('kpi-sessions').innerText = merged.length;
                }
            } catch (e) { console.error("Sync failed", e); }
        }
    }

    /**
     * Submit a new assessment result.
     * @param {Object} data - { title, domain, score, metrics, difficulty }
     */
    submitResult(data) {
        const history = this.getHistory();

        const record = {
            id: 'ID-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            timestamp: new Date().toISOString(),
            title: data.title || 'Unknown Protocol',
            domain: data.domain || 'GENERAL',
            score: data.score || 0,
            metrics: data.metrics || {},
            difficulty: data.difficulty || 'Normal',
            hash: this.generateHash(data)
        };

        history.unshift(record); // Add to top
        localStorage.setItem(this.dbName, JSON.stringify(history));

        // Cloud Upload (Fire and Forget)
        if (window.DataClient) {
            window.DataClient.submitResult(record);
        }

        console.log(`[DataManager] Record saved: ${record.id}`);
        return record;
    }

    getHistory() {
        return JSON.parse(localStorage.getItem(this.dbName) || '[]');
    }

    getDailyStats() {
        const history = this.getHistory();
        const today = new Date().toISOString().split('T')[0];
        const todayRecords = history.filter(r => r.timestamp.startsWith(today));

        return {
            count: todayRecords.length,
            avgScore: todayRecords.reduce((acc, r) => acc + r.score, 0) / (todayRecords.length || 1),
            domains: this.groupByDomain(todayRecords)
        };
    }

    groupByDomain(records) {
        const counts = {};
        records.forEach(r => {
            counts[r.domain] = (counts[r.domain] || 0) + 1;
        });
        return counts;
    }

    generateHash(data) {
        // Fake crypto hash for "Authenticity" feel
        return Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    }

    reset() {
        localStorage.setItem(this.dbName, JSON.stringify([]));
    }

    // --- Gamification Hooks ---

    getXP() {
        if (!window.Gamification) return 0;
        return window.Gamification.calculateXP(this.getHistory());
    }

    getRank() {
        if (!window.Gamification) return { current: { name: 'Offline' }, progress: 0 };
        return window.Gamification.getRank(this.getXP());
    }

    getBadges() {
        if (!window.Gamification) return [];
        return window.Gamification.checkBadges(this.getHistory());
    }
}

// Instantiation moved to end of script execution to ensure Dependencies are loaded
// or attached to window
window.DataManager = new DataManager();
