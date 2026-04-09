import { createClient } from '@supabase/supabase-js'
import os from 'os'
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local explicitly
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// --- 🚀 Swarm Pulse Engine (Optimized v2) ---
const NODE_ID = process.env.NODE_ID || 'unit1';
const ROLE = NODE_ID === 'unit3' ? 'Forge' : NODE_ID === 'unit2' ? 'Scout' : 'Prime';

async function getSystemStats() {
  return {
    cpu: Math.round(os.loadavg()[0] * 10),
    mem: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)
  }
}

async function sendPulse() {
    const stats = await getSystemStats();
    console.log(`📡 [${NODE_ID}] Sending Pulse (${ROLE}) - CPU: ${stats.cpu}%, MEM: ${stats.mem}%`);

    const { error } = await supabase
        .from('node_status')
        .upsert({
            node_id: NODE_ID,
            hostname: `${NODE_ID}-${ROLE}`,
            status: 'ONLINE',
            cpu_usage: stats.cpu,
            mem_usage: stats.mem,
            last_pulse: new Date().toISOString(),
            current_task_id: ROLE === 'Forge' ? 'EVOLUTION_SYNC' : 'NEURAL_SCAN'
        });

    if (error) console.error('❌ Pulse Failed:', error.message);
}

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local')
    process.exit(1)
}

console.log(`🚀 Chronos Pulse Engine started for ${NODE_ID}...`)
setInterval(sendPulse, 30000)
sendPulse()
