const express = require('express');
const os = require('os');
const cors = require('cors');

const app = express();
const port = 18888;

// Use CORS to allow the frontend to access the API
app.use(cors());

app.get('/status', (req, res) => {
    
    const cpuAvg = os.loadavg()[0]; // 1 minute load average
    const cpuCount = os.cpus().length;
    const cpuPercent = Math.round((cpuAvg / cpuCount) * 100);
    
    // Better memory reporting for macOS
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercent = Math.round((usedMem / totalMem) * 100);
    
    const statusData = {
        devices: [
            {
                name: os.hostname().replace('.local', '') || 'Mac Node 1',
                status: 'online',
                cpu: `${Math.min(cpuPercent, 100)}%`, // Basic approximation
                mem: `${memPercent}%`
            },
            {
                name: 'Mac Studio (DingDang)',
                status: 'online', // Example
                cpu: '15%',
                mem: '42%'
            },
            {
                name: 'Macbook Air M3',
                status: 'online', 
                cpu: '30%',
                mem: '65%'
            }
        ]
    };
    
    res.json(statusData);
});

app.listen(port, () => {
    console.log(`Mac Status Server listening at http://localhost:${port}`);
});
