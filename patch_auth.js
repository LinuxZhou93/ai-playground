const fs = require('fs');

const file = 'assets/js/subscription.js';
let content = fs.readFileSync(file, 'utf8');

// The file was entirely replaced earlier. Let's make sure it's the new clean one.
// Let's modify the isSubscribed function directly.
content = content.replace(
    /isSubscribed:\s*function\s*\(\)\s*{\s*if\s*\(!this\.user\)\s*return\s*false;[\s\S]*?},/,
    \`isSubscribed: function () {
        if (!this.user) return false;
        
        // Always unlock for logged-in users during development/preview
        console.log('User is logged in (DEV BYPASS for VIP Check)');
        return true; 
        
        // Original logic:
        // const status = this.getSubscriptionStatus();
        // return status.isVIP;
    },\`
);

fs.writeFileSync(file, content);
console.log('Patched subscription.js');
