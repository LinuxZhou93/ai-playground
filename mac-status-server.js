const express = require('express');
const os = require('os');
const cors = require('cors');

const app = express();
const port = 18888;

app.use(cors());

function getMockStatus() {
    const cpuAvg = os.loadavg()[0];
    const cpuCount = os.cpus().length;
    const cpuPercent = Math.round((cpuAvg / cpuCount) * 100);
    
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercent = Math.round((usedMem / totalMem) * 100);

    const latencyJitter = Math.floor(Math.random() * 10) + 10;
    const downloadJitter = (800 + Math.random() * 100).toFixed(1);
    const uploadJitter = (100 + Math.random() * 50).toFixed(1);

    return {
        network: {
            status: 'stable',
            latency: `${latencyJitter} ms`,
            bandwidthDown: `${downloadJitter} Mbps`,
            bandwidthUp: `${uploadJitter} Mbps`,
            publicIp: '113.118.*.*'
        },
        devices: [
            {
                id: 'UNIT-01',
                name: 'DingDang Master',
                platform: 'Mac Studio',
                status: 'online',
                cpu: `${Math.floor(Math.random() * 10) + 5}%`,
                mem: '42%',
                openclaw: {
                    status: 'online',
                    version: 'v2.1.0',
                    uptime: '14d',
                    model: 'gemini-3-flash'
                }
            },
            {
                id: 'UNIT-02',
                name: 'Alpha Node',
                platform: 'MacBook Air M1',
                status: 'online',
                cpu: `${Math.min(cpuPercent, 100)}%`, // Reflects current machine
                mem: `${memPercent}%`,
                openclaw: {
                    status: 'online',
                    version: 'v2.1.0',
                    uptime: '5d',
                    model: 'gpt-4o'
                }
            },
            {
                id: 'UNIT-03',
                name: 'Beta Node',
                platform: 'MacBook Air M3',
                status: 'online', 
                cpu: `${Math.floor(Math.random() * 15) + 20}%`,
                mem: '65%',
                openclaw: {
                    status: 'offline',
                    version: 'v2.0.5',
                    uptime: '0d',
                    model: 'claude-3-opus'
                }
            }
        ]
    };
}

app.get('/status', (req, res) => {
    res.json(getMockStatus());
});

app.listen(port, () => {
    console.log(`Mac Status Server listening at http://localhost:${port}`);
});
