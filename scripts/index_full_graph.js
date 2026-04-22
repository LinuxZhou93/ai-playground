import { createClient } from '@supabase/supabase-js'
// @ts-ignore
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'

// --- 🌐 Chronos Global Indexer ---
// 这个脚本会自动扫描代码库并生成知识图谱全量数据

const supabaseUrl = "https://znmbkxmnwuurzhevfxtq.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Nzk1MDQsImV4cCI6MjA4MDE1NTUwNH0.y0m9rnug3WduVyuKZLL25PBA4C2Ys0_WSgMrzokSh5g"
const supabase = createClient(supabaseUrl, supabaseKey)

const ROOT_DIR = process.cwd()

const AI_TRENDS = [
    { label: "Agentic Workflows", category: "AI Trend", metadata: { density: 92, importance: "Critical" } },
    { label: "Multi-Agent Orchestration", category: "AI Trend", metadata: { density: 88, importance: "High" } },
    { label: "MCP Protocol", category: "AI Trend", metadata: { density: 95, importance: "New Standard" } },
    { label: "Zero-Trust Swarms", category: "AI Trend", metadata: { density: 74, importance: "Security" } },
    { label: "Real-time Telemetry", category: "AI Trend", metadata: { density: 91, importance: "Ops" } },
    { label: "Edge Compute", category: "AI Trend", metadata: { density: 68, importance: "Infrastructure" } },
    { label: "Neural Knowledge Graphs", category: "AI Trend", metadata: { density: 85, importance: "Knowledge" } },
    { label: "WebGPU Intelligence", category: "AI Trend", metadata: { density: 72, importance: "Compute" } },
    { label: "Liquid Intelligence", category: "AI Trend", metadata: { density: 45, importance: "Emerging" } },
    { label: "Constitutional AI", category: "AI Trend", metadata: { density: 81, importance: "Ethics" } }
];

async function clearOldData() {
    console.log("🧹 Clearing old knowledge center data...");
    await supabase.from('knowledge_edges').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('knowledge_nodes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
}

async function indexCodebase() {
    const nodes: any[] = [];
    const edges: any[] = [];
    const fileToId = new Map<string, string>();

    // 1. 递归扫描文件
    function scanDir(dir: string, depth = 0) {
        if (depth > 4) return;
        const files = fs.readdirSync(dir);
        for (const file of files) {
            if (file.startsWith('.') || file === 'node_modules' || file === 'dist' || file === '.next') continue;
            const fullPath = path.join(dir, file);
            const relPath = path.relative(ROOT_DIR, fullPath);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                const id = uuidv4();
                nodes.push({ id, label: file, category: "System Module", metadata: { path: relPath, size: "DIR" } });
                fileToId.set(relPath, id);
                scanDir(fullPath, depth + 1);
            } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.mjs')) {
                const id = uuidv4();
                nodes.push({ id, label: file, category: "Source Code", metadata: { path: relPath, size: stat.size } });
                fileToId.set(relPath, id);
            }
        }
    }

    scanDir(ROOT_DIR);

    // 2. 注入 AI 趋势
    const trendIds: string[] = [];
    AI_TRENDS.forEach(trend => {
        const id = uuidv4();
        nodes.push({ id, ...trend });
        trendIds.push(id);
    });

    // 3. 构建关联 (随机/模糊语义关联)
    nodes.forEach(node => {
        if (node.category === "Source Code") {
            // 简单逻辑：根据文件名模糊关联趋势
            if (node.label.includes('pulse') || node.label.includes('node')) {
                const target = trendIds[Math.floor(Math.random() * trendIds.length)];
                edges.push({ id: uuidv4(), source: node.id, target, relation_type: "IMPLEMENTS" });
            }
            if (node.label.includes('swarm') || node.label.includes('consensus')) {
                const target = trendIds[1]; // Multi-Agent Orchestration
                edges.push({ id: uuidv4(), source: node.id, target, relation_type: "DEPENDS_ON" });
            }
        }
        
        // 父目录关联
        const relPath = node.metadata?.path;
        if (relPath) {
            const parentPath = path.dirname(relPath);
            if (fileToId.has(parentPath)) {
                edges.push({ id: uuidv4(), source: fileToId.get(parentPath), target: node.id, relation_type: "CONTAINS" });
            }
        }
    });

    console.log(`🚀 Indexing ${nodes.length} nodes and ${edges.length} edges...`);
    
    // 批量插入
    const { error: nodeError } = await supabase.from('knowledge_nodes').insert(nodes);
    if (nodeError) console.error("❌ Node Insertion Failed:", nodeError.message);
    
    const { error: edgeError } = await supabase.from('knowledge_edges').insert(edges);
    if (edgeError) console.error("❌ Edge Insertion Failed:", edgeError.message);

    console.log("✅ Chronos Knowledge Graph fully indexed.");
}

clearOldData().then(indexCodebase);
