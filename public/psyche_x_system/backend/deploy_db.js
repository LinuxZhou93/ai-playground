const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'mucdbfmxweuminwljlyr';
const PASSWORD = process.argv[2];

if (!PASSWORD) {
    console.error('❌ Error: Please provide your database password as an argument.');
    console.error('Usage: node deploy_db.js <YOUR_DB_PASSWORD>');
    process.exit(1);
}

// Supabase Direct Connection String
// host: db.[ref].supabase.co
const connectionString = `postgresql://postgres:${PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres`;

console.log(`[Deploy] Connecting to Supabase DB (${PROJECT_REF})...`);

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000 // 10s timeout
});

async function deploy() {
    try {
        console.log('[Deploy] Initiating connection...');
        await client.connect();
        console.log('✅ Connected successfully.');

        const sqlPath = path.join(__dirname, 'supabase_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('[Deploy] Running Schema Migration...');
        // Split by semicolon? No, client.query can handle multi-statement if simple, 
        // but pg library sometimes prefers single statements. 
        // Supabase DB is standard Postgres, it supports multi-statement strings usually.

        await client.query(sql);

        console.log('✅ Schema applied successfully!');
        console.log('   - Tables: profiles, game_results, licenses created.');
        console.log('   - Policies: RLS enabled.');

    } catch (err) {
        console.error('❌ Migration Failed:', err.message);
        if (err.message.includes('password')) {
            console.error('   (Hint: Double check your database password)');
        }
    } finally {
        await client.end();
    }
}

deploy();
