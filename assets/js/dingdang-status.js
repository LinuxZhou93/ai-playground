// --- Dingdang Status Data Sync ---
const macStatusUrl = 'http://localhost:18888/status';

async function fetchMacStatus() {
    try {
        const response = await fetch(macStatusUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        updateMacStatusUI(data);
    } catch (e) {
        console.error("Failed to fetch Mac status:", e);
        // Show simulated offline data if the server isn't available
        updateMacStatusUI({
            status: 'error',
            error: e.message
        });
    }
}

function updateMacStatusUI(data) {
    const statusContainer = document.getElementById('mac-status-container');
    if (!statusContainer) return;

    if (data.status === 'error') {
         // Show simulated offline data if the server isn't available
         let html = '';
         const mockData = [
             {name: '叮当主控 (DingDang)', status: 'offline', cpu: '-', mem: '-'},
             {name: '计算节点 01', status: 'offline', cpu: '-', mem: '-'},
             {name: '计算节点 02', status: 'offline', cpu: '-', mem: '-'}
         ];
          
         mockData.forEach(mac => {
             html += createMacStatusHTML(mac);
         });
         statusContainer.innerHTML = html;
         return;
    }

    let html = '';
    const macs = data.devices || [];
    
    if (macs.length === 0) {
        statusContainer.innerHTML = `<div class="dingdang-card" style="text-align: center; color: #ff003c; width: 100%;">
            <div style="font-size: 1.5rem; margin-bottom: 10px;">Warning</div>
            <span>No compute nodes connected to the cluster.</span>
        </div>`;
        return;
    }
    
    macs.forEach(mac => {
        html += createMacStatusHTML(mac);
    });

    statusContainer.innerHTML = html;
}

function createMacStatusHTML(mac) {
    const isOnline = mac.status === 'online';
    const badgeClass = isOnline ? 'online' : 'offline';
    const badgeText = isOnline ? 'ONLINE' : 'OFFLINE';
    
    // Parse values safely
    let cpuVal = 0, memVal = 0;
    if (isOnline) {
       cpuVal = parseInt(mac.cpu) || 0;
       memVal = parseInt(mac.mem) || 0;
    }

    const cpuDisplay = isOnline ? mac.cpu : '-';
    const memDisplay = isOnline ? mac.mem : '-';

    // Determine color class based on load
    const getLoadClass = (val) => {
        if(val < 50) return 'fill-low';
        if(val < 80) return 'fill-med';
        return 'fill-high';
    };

    const cpuClass = getLoadClass(cpuVal);
    const memClass = getLoadClass(memVal);
    
    // Fallback manual truncation
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
    // Initial fetch
    fetchMacStatus();
    // Poll every 3 seconds for smoother updates
    setInterval(fetchMacStatus, 3000);
});
// Attach to global window object so it can be called explicitly if needed
window.fetchMacStatus = fetchMacStatus;
