// --- Dingdang Status Data Sync ---
const macStatusUrl = 'http://localhost:18888/status';

async function fetchMacStatus() {
    try {
        const response = await fetch(macStatusUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        updateDashboardUI(data);
    } catch (e) {
        console.error("Failed to fetch dashboard status:", e);
        // Show simulated offline data 
        updateDashboardUI({
            status: 'error',
            error: e.message
        });
    }
}

function setBadge(id, isOnline) {
    const el = document.getElementById(id);
    if (!el) return;
    if (isOnline) {
        el.className = 'status-badge online';
        el.innerText = 'ONLINE';
    } else {
        el.className = 'status-badge offline';
        el.innerText = 'OFFLINE';
    }
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerText = text || '--';
}

function updateDashboardUI(data) {
    const statusContainer = document.getElementById('mac-status-container');
    
    // Process error state
    if (data.status === 'error') {
        setBadge('oc-status-badge', false);
        setBadge('net-status-badge', false);
        
        ['oc-version', 'oc-uptime', 'oc-agents', 'oc-model', 'oc-wechat', 'net-latency', 'net-down', 'net-up', 'net-ip', 'net-vpn'].forEach(id => setText(id, '--'));
        
        if (statusContainer) {
            let html = '';
            const mockData = [
                {name: '叮当主控 (DingDang Master)', status: 'offline', cpu: '-', mem: '-'},
                {name: '计算节点 01', status: 'offline', cpu: '-', mem: '-'}
            ];
            mockData.forEach(mac => { html += createMacStatusHTML(mac); });
            statusContainer.innerHTML = html;
        }
        return;
    }

    // Update OpenClaw Panel
    const oc = data.openclaw || {};
    setBadge('oc-status-badge', oc.status === 'online');
    setText('oc-version', oc.version);
    setText('oc-uptime', oc.uptime);
    setText('oc-agents', oc.activeAgents);
    setText('oc-model', oc.primaryModel);
    setText('oc-wechat', oc.wechatChannel);

    // Update Network Panel
    const net = data.network || {};
    setBadge('net-status-badge', net.status === 'stable' || net.status === 'online');
    setText('net-latency', net.latency);
    setText('net-down', net.bandwidthDown);
    setText('net-up', net.bandwidthUp);
    setText('net-ip', net.publicIp);
    setText('net-vpn', net.vpn);

    // Update Compute Nodes Panel
    if (statusContainer) {
        let html = '';
        const macs = data.devices || [];
        
        if (macs.length === 0) {
            statusContainer.innerHTML = `<div class="dingdang-card" style="text-align: center; color: #ff003c; width: 100%;">
                <div style="font-size: 1.5rem; margin-bottom: 10px;">Warning</div>
                <span>No compute nodes connected to the cluster.</span>
            </div>`;
        } else {
            macs.forEach(mac => {
                html += createMacStatusHTML(mac);
            });
            statusContainer.innerHTML = html;
        }
    }
}

function createMacStatusHTML(mac) {
    const isOnline = mac.status === 'online';
    const badgeClass = isOnline ? 'online' : 'offline';
    const badgeText = isOnline ? 'ONLINE' : 'OFFLINE';
    
    let cpuVal = 0, memVal = 0;
    if (isOnline) {
       cpuVal = parseInt(mac.cpu) || 0;
       memVal = parseInt(mac.mem) || 0;
    }

    const cpuDisplay = isOnline ? mac.cpu : '-';
    const memDisplay = isOnline ? mac.mem : '-';

    const getLoadClass = (val) => {
        if(val < 50) return 'fill-low';
        if(val < 80) return 'fill-med';
        return 'fill-high';
    };

    const cpuClass = getLoadClass(cpuVal);
    const memClass = getLoadClass(memVal);
    
    const safeName = mac.name || 'Unknown Node';
    const titleAttr = safeName.replace(/"/g, '&quot;');

    return `
        <div class="dingdang-card">
            <div class="card-header-row">
                <div class="card-title-group">
                    <span class="node-name" title="${titleAttr}">${safeName}</span>
                </div>
                <div class="status-badge ${badgeClass}">${badgeText}</div>
            </div>
            
            <div class="resource-section">
                <!-- CPU Bar -->
                <div class="resource-row">
                    <div class="res-label">CPU</div>
                    <div class="res-track">
                        <div class="res-fill ${cpuClass}" style="width: ${cpuVal}%;"></div>
                    </div>
                    <div class="res-value">${cpuDisplay}</div>
                </div>

                <!-- RAM Bar -->
                <div class="resource-row">
                    <div class="res-label">RAM</div>
                    <div class="res-track">
                        <div class="res-fill ${memClass}" style="width: ${memVal}%;"></div>
                    </div>
                    <div class="res-value">${memDisplay}</div>
                </div>
            </div>
        </div>
    `;
}

// Initialization and automatic updates
document.addEventListener('DOMContentLoaded', () => {
    fetchMacStatus();
    setInterval(fetchMacStatus, 3000);
});
window.fetchMacStatus = fetchMacStatus;
