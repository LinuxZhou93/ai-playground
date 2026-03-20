// --- Mac Status Data Sync ---
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
             {name: 'Mac Node 1', status: 'offline', cpu: '-', mem: '-'},
             {name: 'Mac Studio (DingDang)', status: 'offline', cpu: '-', mem: '-'},
             {name: 'Macbook Air M3', status: 'offline', cpu: '-', mem: '-'}
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
        statusContainer.innerHTML = `<div class="mac-status-item error"><span>No Nodes Connected</span></div>`;
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
    const badgeText = isOnline ? 'ON' : 'OFF';
    
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
    
    // Fallback manual truncation just in case CSS ellipsis isn't enough for very long string
    const safeName = mac.name || 'Unknown Node';
    const titleAttr = safeName.replace(/"/g, '&quot;');

    return `
        <div class="mac-status-item">
            <div class="mac-header">
                <div class="mac-name-block">
                    <span class="status-badge ${badgeClass}">${badgeText}</span>
                    <span class="mac-name-text" title="${titleAttr}">${safeName}</span>
                </div>
            </div>
            
            <div class="mac-details">
                <!-- CPU Bar -->
                <div class="resource-bar-container">
                    <div class="resource-label">CPU</div>
                    <div class="resource-track">
                        <div class="resource-fill ${cpuClass}" style="width: ${cpuVal}%;"></div>
                    </div>
                    <div class="resource-value">${cpuDisplay}</div>
                </div>

                <!-- RAM Bar -->
                <div class="resource-bar-container">
                    <div class="resource-label">RAM</div>
                    <div class="resource-track">
                        <div class="resource-fill ${memClass}" style="width: ${memVal}%;"></div>
                    </div>
                    <div class="resource-value">${memDisplay}</div>
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
