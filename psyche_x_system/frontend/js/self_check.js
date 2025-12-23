window.runSelfCheck = function () {
    console.clear();
    console.log("%c PSYCHE-X SYSTEM DIAGNOSTIC ", "background: #222; color: #bada55; font-size: 20px; font-weight: bold; padding: 10px;");

    let score = 100;
    let issues = [];

    // 1. Core Modules Check
    const modules = ['Kernel', 'DataManager', 'Coach', 'Gamification'];
    modules.forEach(m => {
        if (window[m] || (window.DataManager && m === 'DataManager') || (window.Coach && m === 'Coach')) { // Adjust for strict window attachment if needed
            console.log(`✅ [CORE] ${m} is online.`);
        } else {
            console.error(`❌ [CORE] ${m} is MISSING.`);
            issues.push(`${m} not loaded`);
            score -= 20;
        }
    });

    // 2. Storage Check
    try {
        localStorage.setItem('test', '1');
        localStorage.removeItem('test');
        console.log("✅ [DATA] LocalStorage is writable.");
    } catch (e) {
        console.error("❌ [DATA] LocalStorage Error:", e);
        issues.push("LocalStorage unavailable");
        score -= 20;
    }

    // 3. Audio Context Check
    if (window.Kernel && window.Kernel.audio && window.Kernel.audio.ctx) {
        console.log(`✅ [AUDIO] Context State: ${window.Kernel.audio.ctx.state}`);
    } else {
        console.warn("⚠️ [AUDIO] Kernel Audio not initialized.");
    }

    // 4. Catalog Consistency (If on Hub)
    if (typeof CURATED_CATALOG !== 'undefined') {
        console.log(`✅ [HUB] Catalog contains ${CURATED_CATALOG.length} protocols.`);
        const domains = new Set(CURATED_CATALOG.map(x => x.domain));
        console.log(`ℹ️ [HUB] Operating Domains:`, Array.from(domains));
    }

    // Report
    console.log("%c DIAGNOSTIC COMPLETE ", "background: #fff; color: #000; font-weight: bold;");
    console.log(`Health Score: ${score}/100`);

    if (issues.length > 0) {
        alert(`System Issues Detected:\n- ${issues.join('\n- ')}\n\nCheck Console for details.`);
    } else {
        alert("All Systems Nominal.\nPsyche-X Protocol Ready.");
    }
};
