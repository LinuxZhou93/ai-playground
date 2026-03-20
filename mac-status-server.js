const express = require('express');
const os = require('os');
const cors = require('cors');

const app = express();
const port = 18888;

// Use CORS to allow the frontend to access the API
app.use(cors());

// Generate dynamic but realistic mock data
function getMockStatus() {
    const cpuAvg = os.loadavg()[0]; // 1 minute load average
    const cpuCount = os.cpus().length;
    const cpuPercent = Math.round((cpuAvg / cpuCount) * 100);
    
    // Better memory reporting for macOS
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercent = Math.round((usedMem / totalMem) * 100);

    // Mock jitter
    const latencyJitter = Math.floor(Math.random() * 10) + 10;
    const downloadJitter = (800 + Math.random() * 100).toFixed(1);
    const uploadJitter = (100 + Math.random() * 50).toFixed(1);

    return {
        openclaw: {
            status: 'online',
            version: 'v2.1.0-rc.3',
            uptime: '14天 06小时 23分',
            activeAgents: Math.floor(Math.random() * 3) + 1,
            primaryModel: 'gemini-3-flash',
            wechatChannel: 'connected'
        },
        network: {
            status: 'stable',
            latency: `${latencyJitter} ms`,
            bandwidthDown: `${downloadJitter} Mbps`,
            bandwidthUp: `${uploadJitter} Mbps`,
            vpn: 'Disconnected',
            publicIp: '113.118.*.*'
        },
        devices: [
            {
                name: os.hostname().replace('.local', '') || 'Mac Node 1',
                status: 'online',
                cpu: `${Math.min(cpuPercent, 100)}%`, // Basic approximation
                mem: `${memPercent}%`
            },
            {
                name: 'Mac Studio (DingDang Master)',
                status: 'online', 
                cpu: `${Math.floor(Math.random() * 10) + 5}%`,
                mem: '42%'
            },
            {
                name: 'Macbook Air M3 (Portable)',
                status: 'online', 
                cpu: `${Math.floor(Math.random() * 15) + 20}%`,
                mem: '65%'
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
