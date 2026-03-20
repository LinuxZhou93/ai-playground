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
             {name: 'M1 Studio', status: 'offline', cpu: '-', mem: '-'},
             {name: 'M2 Pro', status: 'offline', cpu: '-', mem: '-'},
             {name: 'M3 Max', status: 'offline', cpu: '-', mem: '-'}
         ];
          
         mockData.forEach(mac => {
              const statusDot = '<span class="status-dot red"></span>';
              html += `
                 <div class="mac-status-item">
                     <div class="mac-header">${statusDot} ${mac.name}</div>
                     <div class="mac-details">
                         <span>CPU: ${mac.cpu}</span> | <span>MEM: ${mac.mem}</span>
                     </div>
                 </div>
              `;
         });
         statusContainer.innerHTML = html;
         return;
    }

    let html = '';
    const macs = data.devices || [];
    
    if (macs.length === 0) {
        statusContainer.innerHTML = `<div class="mac-status-item error"><span>No Devices Connected</span></div>`;
        return;
    }
    
    macs.forEach(mac => {
         const isOnline = mac.status === 'online';
         const statusDot = isOnline ? '<span class="status-dot green"></span>' : '<span class="status-dot red"></span>';
         
         const cpuDisplay = mac.cpu || '-';
         const memDisplay = mac.mem || '-';
         
         html += `
            <div class="mac-status-item">
                <div class="mac-header">${statusDot} ${mac.name}</div>
                <div class="mac-details">
                    <span>CPU: ${cpuDisplay}</span> | <span>MEM: ${memDisplay}</span>
                </div>
            </div>
         `;
    });

    statusContainer.innerHTML = html;
}

// Initialization and automatic updates
document.addEventListener('DOMContentLoaded', () => {
    // Initial fetch
    fetchMacStatus();
    // Poll every 5 seconds
    setInterval(fetchMacStatus, 5000);
});
