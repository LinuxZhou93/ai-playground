const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://znmbkxmnwuurzhevfxtq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Nzk1MDQsImV4cCI6MjA4MDE1NTUwNH0.y0m9rnug3WduVyuKZLL25PBA4C2Ys0_WSgMrzokSh5g";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testRegistration() {
    console.log("🚀 Starting Registration Flow Test...");

    // 1. Generate fake user details
    const testEmail = `testuser_${Date.now()}@ai.com`;
    const testPassword = "Password123!";
    const testUsername = testEmail.split('@')[0];

    console.log(`\n1️⃣  Testing Sign Up (Email: ${testEmail})...`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
            data: { username: testUsername }
        }
    });

    if (authError) {
        console.error("❌ Sign Up Failed:", authError.message);
        return;
    }
    
    // Check if auto-login or requires email confirmation
    const user = authData.user;
    if (!user) {
        console.log("✅ Sign Up succeeded but user requires email confirmation.");
        return;
    }
    
    console.log("✅ Sign Up Successful! User ID:", user.id);

    console.log("\n2️⃣  Testing initNewUser profile upsert...");
    const defaultExpiry = null;

    const { error: pError } = await supabase.from('profiles').upsert({
        id: user.id,
        username: testUsername,
        expiry_date: defaultExpiry
    });

    if (pError) {
        console.error("❌ Profile Upsert Failed (Schema error?):", pError.message);
        return;
    }
    console.log("✅ Profile Upsert Successful!");

    console.log("\n3️⃣  Testing initNewUser dashboard_data upsert...");
    const { error: dError } = await supabase.from('user_dashboard_data').upsert({
        username: testEmail,
        is_logged_in: true,
        prog_self: 10,
        prog_basic: 5,
        mod_launch: true
    });

    if (dError) {
        console.error("❌ Dashboard Data Upsert Failed:", dError.message);
        return;
    }
    console.log("✅ Dashboard Data Upsert Successful!");

    console.log("\n🎉 Full Registration Flow Test Complete Without Errors!");
}

testRegistration();
