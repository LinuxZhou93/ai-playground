const API_URL = 'http://localhost:18888/status';

async function fetchStatus() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        renderDashboard(data);
    } catch (e) {
        console.error("Fetch failed:", e);
        renderErrorState(e.message);
    }
}

function updateEl(id, text) {
    const el = document.getElementById(id);
    if(el) el.innerText = text;
}

function renderDashboard(data) {
    // 1. Update Telemetry Network Bar
    if (data.network) {
        updateEl('net-latency', data.network.latency);
        updateEl('net-down', data.network.bandwidthDown);
        updateEl('net-up', data.network.bandwidthUp);
        updateEl('net-ip', data.network.publicIp);
        const stNode = document.getElementById('net-status');
        if(stNode) {
            stNode.innerText = data.network.status.toUpperCase();
            stNode.className = `t-badge ${data.network.status === 'stable' ? 'success' : 'warning'}`;
        }
    }

    // 2. Clear Units container
    const container = document.getElementById('units-container');
    if (!container) return;

    if (!data.devices || data.devices.length === 0) {
        container.innerHTML = `<div style="color:var(--accent); grid-column:1/-1; text-align:center;">No compute units found in matrix.</div>`;
        return;
    }

    // 3. Render each unit
    let html = '';
    data.devices.forEach(unit => {
        html += buildUnitCard(unit);
    });
    
    container.innerHTML = html;
}

function renderErrorState(err) {
    updateEl('net-latency', '--');
    updateEl('net-down', '--');
    updateEl('net-up', '--');
    
    const container = document.getElementById('units-container');
    if(container) {
        container.innerHTML = `<div style="color:var(--accent); grid-column:1/-1; text-align:center;">
            <h3>Matrix Connection Lost</h3>
            <p>${err}</p>
        </div>`;
    }
}

function getFillClass(percentStr) {
    const val = parseInt(percentStr) || 0;
    if(val < 50) return 'bg-low';
    if(val < 80) return 'bg-med';
    return 'bg-high';
}

function buildUnitCard(u) {
    const isOnline = u.status === 'online';
    const cpuClass = getFillClass(u.cpu);
    const memClass = getFillClass(u.mem);

    // OpenClaw processing
    let ocHtml = '';
    if (u.openclaw) {
        const ocOnline = u.openclaw.status === 'online';
        const ocDot = ocOnline ? 'active' : (isOnline ? 'error' : 'idle');
        const ocSys = ocOnline ? 'ONLINE' : 'OFFLINE';
        
        ocHtml = `
            <div class="oc-panel">
                <div class="oc-head">
                    <div class="oc-logo"><span>OC</span> OpenClaw</div>
                    <div class="oc-status-dot ${ocDot}" title="${ocSys}"></div>
                </div>
                <div class="oc-grid">
                    <div class="oc-item"><span class="lbl">VERSION</span><span class="val">${u.openclaw.version || '--'}</span></div>
                    <div class="oc-item"><span class="lbl">UPTIME</span><span class="val txt">${u.openclaw.uptime || '--'}</span></div>
                    <div class="oc-item" style="grid-column: 1/-1"><span class="lbl">PRIMARY MODEL</span><span class="val highlight txt">${u.openclaw.model || '--'}</span></div>
                </div>
            </div>
        `;
    }

    return `
    <div class="unit-block">
        <!-- HEADER -->
        <div class="u-head">
            <div class="u-id">${u.id || 'UNIT-XX'}</div>
            <div class="u-status ${isOnline ? 'online' : 'offline'}">${isOnline ? 'ONLINE' : 'OFFLINE'}</div>
        </div>

        <!-- BODY -->
        <div class="u-body">
            
            <!-- Host Info -->
            <div class="hw-section">
                <div class="u-section-title">HOST PLATFORM</div>
                <div class="hw-metric-v">
                    <span class="hm-lbl">NODE ALIAS</span>
                    <span class="hm-val val-txt">${u.name || 'Unknown'}</span>
                </div>
                <div class="hw-metric-v" style="margin-top:10px;">
                    <span class="hm-lbl">ARCHITECTURE</span>
                    <span class="hm-val val-txt" style="color:var(--primary);">${u.platform || 'Unknown'}</span>
                </div>
            </div>

            <!-- Hardware Telemetry -->
            <div class="hw-section">
                <div class="u-section-title">CORE TELEMETRY</div>
                <div class="hw-grid">
                    <div class="hw-metric-v">
                        <span class="hm-lbl">CPU LOAD</span>
                        <div class="hm-val val-num">${isOnline ? u.cpu : '--'}<div class="h-track"><div class="h-fill ${cpuClass}" style="width:${isOnline ? u.cpu : '0%'}"></div></div></div>
                    </div>
                    <div class="hw-metric-v">
                        <span class="hm-lbl">MEM LOAD</span>
                        <div class="hm-val val-num">${isOnline ? u.mem : '--'}<div class="h-track"><div class="h-fill ${memClass}" style="width:${isOnline ? u.mem : '0%'}"></div></div></div>
                    </div>
                </div>
            </div>

            <!-- OpenClaw Block -->
            ${ocHtml}

        </div>
    </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    fetchStatus();
    setInterval(fetchStatus, 3000);
});
window.fetchStatus = fetchStatus;
