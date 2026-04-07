import { createClient } from '@supabase/supabase-js'
import os from 'os'

// --- 🐝 Universal Swarm Pulse Agent (Inlined) ---
const NODE_ID = process.env.NODE_ID || 'unknown';
const ROLE = process.env.ROLE || 'unknown';

const supabaseUrl = "https://znmbkxmnwuurzhevfxtq.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Nzk1MDQsImV4cCI6MjA4MDE1NTUwNH0.y0m9rnug3WduVyuKZLL25PBA4C2Ys0_WSgMrzokSh5g"
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
        console.error(`💥 [${NODE_ID}] Runtime Error:`, e.message);
    }
}

console.log(`🚀 Chronos Universal Agent starting for ${NODE_ID} [${ROLE}]...`)
setInterval(sendPulse, 30000)
sendPulse()
