
const { createClient } = require('@supabase/supabase-js');

// 1. Config
const SUPABASE_URL = "https://znmbkxmnwuurzhevfxtq.supabase.co";
// 注意：这里用的是 Anon Key。如果数据库开启了 RLS 且不允许匿名写入，这里会报错，这是正常的。
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Nzk1MDQsImV4cCI6MjA4MDE1NTUwNH0.y0m9rnug3WduVyuKZLL25PBA4C2Ys0_WSgMrzokSh5g";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runTest() {
    console.log("🚀 Starting Backend Connectivity Test...");

    // 2. Test Read Public Config (if exists) or Just Check Connection
    // We try to read profiles table. Even if empty, it should return array or error.
    console.log("\n1️⃣  Testing Connection (Reading Profiles)...");
    const { data: profiles, error: readError } = await supabase.from('profiles').select('*').limit(1);

    if (readError) {
        console.error("❌ Connection Failed:", readError.message);
        return;
    }
    console.log("✅ Connection Successful! Profiles read check passed.");

    // 3. Test Generate Voucher (Write)
    console.log("\n2️⃣  Testing Write (Generating Voucher)...");
    const testCode = 'TEST-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Note: This might fail if RLS is on and requires admin role. 
    // We expect it to potentially fail if we are strictly secure, 
    // but for this playground, let's see.
    const { data: voucher, error: writeError } = await supabase
        .from('vouchers')
        .insert([{
            code: testCode,
            duration_months: 1,
            status: 'active'
        }])
        .select();

    if (writeError) {
        console.log("⚠️ Write Failed (Expected if RLS is on):", writeError.message);
        console.log("   -> This means your database limits who can create vouchers. Good security!");
        console.log("   -> If you want this script to work, you need the SERVICE_ROLE_KEY.");
    } else {
        console.log("✅ Write Successful! Generated Voucher:", testCode);

        // 4. Verify Read Back
        const { data: verify, error: verifyError } = await supabase
            .from('vouchers')
            .select('*')
            .eq('code', testCode)
            .single();

        if (verify) {
            console.log("✅ Verification Successful! Card found in DB.");
        } else {
            console.error("❌ Verification Failed: Card not found after write.");
        }
    }

    console.log("\n🎉 Backend Flow Test Complete.");
}

runTest();
