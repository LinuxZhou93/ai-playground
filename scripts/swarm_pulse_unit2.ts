import { createClient } from '@supabase/supabase-js'
import os from 'os'

// --- 🚀 Swarm Pulse Engine (Unit-2 Hardcoded) ---
const NODE_ID = 'unit2';
const ROLE = 'Scout';

const supabaseUrl = "https://znmbkxmnwuurzhevfxtq.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

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
            current_task_id: 'NEURAL_SCAN'
        });

    if (error) console.error('❌ Pulse Failed:', error.message);
}

console.log(`🚀 Chronos Pulse Engine started for ${NODE_ID}...`)
setInterval(sendPulse, 30000)
sendPulse()
