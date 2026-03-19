const { createClient } = require('@supabase/supabase-js');
const url = 'https://znmbkxmnwuurzhevfxtq.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Nzk1MDQsImV4cCI6MjA4MDE1NTUwNH0.y0m9rnug3WduVyuKZLL25PBA4C2Ys0_WSgMrzokSh5g';
const supabase = createClient(url, key);

const codesToInsert = [
    { code: 'VIP-365D-64GK-V4Q3-JNZ9', duration_months: 12, status: 'Active' },
    { code: 'VIP-365D-WQWR-JKJ9-7P3K', duration_months: 12, status: 'Active' },
    { code: 'VIP-365D-BK2N-6F5Y-A63W', duration_months: 12, status: 'Active' },
    { code: 'VIP-365D-DGWQ-2WZF-SLE3', duration_months: 12, status: 'Active' },
    { code: 'VIP-365D-ZSTL-JEZL-77NF', duration_months: 12, status: 'Active' },
    { code: 'VIP-365D-5K2D-B62Z-XDRG', duration_months: 12, status: 'Active' },
    { code: 'VIP-365D-H5PF-SUGL-8NK2', duration_months: 12, status: 'Active' },
    { code: 'VIP-365D-SYJW-BHD6-GETL', duration_months: 12, status: 'Active' },
    { code: 'VIP-365D-ZDSP-6QKE-E32G', duration_months: 12, status: 'Active' }
];

async function insertVouchers() {
    try {
        // Since I don't have INSERT RLS for ANON, I'll try it. 
        // If it fails, I'll tell the user to run SQL.
        const { data, error } = await supabase
            .from('vouchers')
            .insert(codesToInsert);
        
        if (error) {
            console.log('ERROR:', error.message);
        } else {
            console.log('SUCCESS: Inserted 9 vouchers');
        }
    } catch (e) {
        console.log('EXCEPTION:', e.message);
    }
}
insertVouchers();
