import { createClient } from '@supabase/supabase-js'
import os from 'os'

// --- 🐝 Universal Swarm Pulse Agent (Inlined) ---
const NODE_ID = process.env.NODE_ID || 'unknown';
const ROLE = process.env.ROLE || 'unknown';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://znmbkxmnwuurzhevfxtq.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

async function getSystemStats() {
  return {
    cpu: Math.round(os.loadavg()[0] * 10),
    mem: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)
  }
}

async function sendPulse() {
    try {
        const stats = await getSystemStats();
        console.log(`📡 [${NODE_ID}] Pulse (${ROLE}) - CPU: ${stats.cpu} %, MEM: ${stats.mem}%`);

        const { error } = await supabase
            .from('node_status')
            .upsert({
                node_id: NODE_ID,
                hostname: `${os.hostname()} (${ROLE})`,
                status: 'ONLINE',
                cpu_usage: stats.cpu,
                mem_usage: stats.mem,
                last_pulse: new Date().toISOString(),
                current_task_id: null
            }, { onConflict: 'node_id' });

        if (error) console.error(`❌ [${NODE_ID}] Pulse Failed:`, error.message);
    } catch (e) {
        console.error(`💥 [${NODE_ID}] Runtime Error:`, e.message || e);
    }
}

console.log(`🚀 Chronos Universal Agent starting for ${NODE_ID} [${ROLE}]...`)
setInterval(sendPulse, 30000)
sendPulse()
