"use client";

import React, { useEffect } from 'react';
import Head from 'next/head';

export default function AIEvolutionMap() {
  useEffect(() => {
    // Import mermaid dynamically only on the client side
    import('mermaid').then((mermaid) => {
      mermaid.default.initialize({
        startOnLoad: true,
        theme: 'neutral',
        fontFamily: 'Inter',
        securityLevel: 'loose',
        flowchart: { curve: 'basis' }
      });
      // Try to re-run mermaid init if the DOM wasn't ready
      mermaid.default.run({
        querySelector: '.mermaid',
      });
    }).catch(err => {
      console.error("Failed to load mermaid", err);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting) {
          document.querySelectorAll('#wiki-sidebar-list a').forEach(a => {
            a.classList.remove('bg-gray-200', 'text-gray-900', 'font-medium', 'shadow-sm');
            if(a.getAttribute('href') === `#${entry.target.id}`) {
              a.classList.add('bg-gray-200', 'text-gray-900', 'font-medium', 'shadow-sm');
            }
          });
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });

    const sections = document.querySelectorAll("main section");
    sections.forEach(sec => observer.observe(sec));

    return () => observer.disconnect();
  }, []);

  const sectionsData = [
    {
      title: "01 / 全局系统边界与集群架构 (Global System & Cluster)",
      desc: "定义系统的整体边界，展示 Unit1、Unit2、Unit3 三台主机组成的 Antigravity 分布式算力集群，以及与云端服务、实体机械（OpenClaw 小龙虾）的跨域协同。",
      mermaidContent: `
graph TD
    subgraph UserSpace [用户交互层 User Experience]
        U1(Titan OS Dashboard) 
        U2(Mozi Lab 课程中心)
    end

    subgraph Cluster [Antigravity 分布式算力集群 Cluster]
        C1[Unit 1 : 知识计算/全量处理节点]
        C2[Unit 2 : 视觉/外围任务节点]
        C3[Unit 3 : Mac 主脑路由器]
    end

    subgraph Swarm [蜂群子系统 Swarm Agents]
        S1(代码生成与执行体)
        S2(知识挖掘与整理体)
        S3(视觉与UI合成体)
        S4(具身物理驱动体)
    end

    subgraph Env [物理环境与服务端 Environment]
        E1(外部应用 API/MCP)
        E2(本地大模型 Ollama)
        E3((OpenClaw 小龙虾机械臂))
    end

    UserSpace <-->|WebSocket/HTTP| C3
    C3 <-->|局域网集群通信| C1
    C3 <-->|局域网集群通信| C2
    Cluster -->|分解与分发| Swarm
    Swarm <-->|读写/操作/运动控制| Env
      `
    },
    {
      title: "02 / 多模态交互环与声学通信 (Multimodal Interaction Loop)",
      desc: "详细拆解了如何通过 VAD、Volcengine TTS 以及高保真数字人前端提供沉浸式体验。未来将优化降低整体延迟（Latency）。",
      mermaidContent: `
sequenceDiagram
    participant User as 用户 (User)
    participant Mic as VAD & 麦克风
    participant Server as 本地代理服务器
    participant Core as 大语言模型 (LLM)
    participant TTS as 豆包语音引擎 (TTS)
    
    User->>Mic: 语音流输入
    Mic->>Server: 识别语义 & 截断激活
    Server->>Core: 提交 prompt (打断原有输出)
    Core-->>Server: 流式文本返回 (Streaming Response)
    Server->>TTS: 文本分块传输 (Chunked to TTS)
    TTS-->>User: 毫秒级音频流返回
    
    note right of TTS: 未来优化: 端到端音频大模型<br/>省去文本转化过程
      `
    },
    {
      title: "03 / 知识图谱与长时记忆 (Knowledge & Vector Memory)",
      desc: "展示我们如何将用户积累的学习笔记、课程资料和数据库进行向量化，为 AI 提供精准的 RAG（检索增强生成）支持。",
      mermaidContent: `
flowchart LR
    A[生数据 Raw Data] --> B(Markdown/HTML 解析)
    A1[微信 msg_*.db] --> B
    A2[Evernote 笔记] --> B
    A3[Carbon-X 课件] --> B

    B --> C{Chunking & Embedding}
    C -->|向量化| D[(Vector DB)]
    C -->|结构化| E[(SQLite/Supabase)]

    F[用户 Query] --> G(意图识别)
    G --> H[从 D & E 检索 Top-K]
    H --> I[LLM 上下文合成]
    I --> J[精准回答与溯源]
      `
    },
    {
      title: "04 / MCP 全域协议与工具链 (Model Context Protocol Integration)",
      desc: "借由标准化的 MCP 协议，系统像插拔外设一样集成飞书、NotebookLM 和 Github，构建出“万物皆为我所用”的数字生态。",
      mermaidContent: `
graph TD
    A((Core LLM))
    
    A -->|MCP Client| B[Feishu MCP]
    A -->|MCP Client| C[NotebookLM MCP]
    A -->|MCP Client| D[Github MCP]
    A -->|MCP Client| E[Local Terminal MCP]
    
    B -.-> B1(读写飞书多维表格)
    B -.-> B2(企业级知识库)
    
    C -.-> C1(音视频生成 / 研报生成)
    C -.-> C2(跨笔记本分析)
    
    D -.-> D1(代码 Review 与提交)
    D -.-> D2(Issue 与 PR 跟踪)
    
    E -.-> E1(文件读写 / 依赖安装)
    E -.-> E2(AST 解析 / 编译器执行)
      `
    },
    {
      title: "05 / 蜂群动态协程与调度 (Swarm Task Orchestration)",
      desc: "剖析主节点如何将庞大复杂的指令拆解为并行/串行流，指派给各个专精智能体，保障工程质量。",
      mermaidContent: `
stateDiagram-v2
    [*] --> 分析请求: 用户输入
    分析请求 --> 规划引擎: 确定需要多步骤
    
    state 规划引擎 {
        拆解为 Task A
        拆解为 Task B
        拆解为 Task C
    }
    
    规划引擎 --> Agent代码专家: 派发开发任务
    规划引擎 --> Agent设计专家: 派发 UI 任务
    规划引擎 --> Agent数据分析: 派发处理任务
    
    Agent代码专家 --> 仲裁与组装
    Agent设计专家 --> 仲裁与组装
    Agent数据分析 --> 仲裁与组装
    
    仲裁与组装 --> 逻辑验证与Lint
    
    逻辑验证与Lint --> [*]: 成功 (Output)
    逻辑验证与Lint --> 规划引擎: 失败点重构 (自愈环路)
      `
    },
    {
      title: "06 / 本地大模型脱机管线 (Ollama & Privacy Enclave)",
      desc: "应对高密级、强隐私需求，利用 Ollama 在本地构建的 AI “内耗网络”，保障敏感课程与微信记录不上传云端。",
      mermaidContent: `
graph TD
    subgraph Cloud [云端公有网络]
        C(Gemini 3.1 Pro / GPT-4)
    end
    
    subgraph LocalEnclave [本地安全飞地 (Air-Gapped Equivalent)]
        A(本地私密语料库)
        B(Ollama Llama3 / Qwen 本地模型)
        D(本地向量处理 Nomic-Embed)
        
        A --> D
        D --> B
        B -->|生成结果| E(本地输出端)
    end

    C -.->|无法访问| LocalEnclave
    
    note bottom of LocalEnclave: 未来优化: 使用 Mac 统一内存架构实现大参数模型的极致推理
      `
    },
    {
      title: "07 / 教学工场交付链路 (Educational Content Pipeline)",
      desc: "Mozi Lab 特有的 Carbon-X 知识封装与输出流。从原始 Markdown 到高保真 PPT 与交互式实验室的智能转化。",
      mermaidContent: `
flowchart LR
    Source(Markdown/教案) --> AI[AI教研架构师]
    AI --> HTML(交互式网页 / 实验台)
    AI --> PPT(高保真演示文稿幻灯片)
    AI --> Audio(NotebookLM 生成播客)
    
    HTML --> Gateway[前端发布 Gateway]
    PPT --> Gateway
    Audio --> Gateway
    
    Gateway --> Student[终端学习者沉浸体验]
      `
    },
    {
      title: "08 / 代码级自愈与演进 (Auto-Evolution Mechanism)",
      desc: "这是系统向“通用人工智能雏形”进化的关键。AI 能读取自身源码、理解逻辑并进行热更新部署。",
      mermaidContent: `
sequenceDiagram
    participant Repo as Github 仓库
    participant AI as Antigravity (自身)
    participant Test as CI/CD 与本地测试
    
    AI->>Repo: 拉取最新架构代码
    AI->>AI: 扫描技术债、识别潜在缺陷 (Analysis)
    AI->>AI: 提出重构方案 (Plan)
    AI->>Repo: 派发多线程代码替换 (multi_replace)
    Repo-->>Test: 触发热编译 (npm run build)
    Test-->>AI: 抛出报错信息 (Stderr / Stdout)
    AI->>Repo: 根据报错修复逻辑
    Test-->>AI: 编译通过
    AI->>Repo: 提交 Git Commit, Sync
      `
    },
    {
      title: "09 / 环境破壁：微信与系统资产逆向 (Assets Decryption Pipeline)",
      desc: "为了全面接管个人数字化资产，系统打通了对封闭环境（如微信本地 SQLCipher 数据库）的解析与提取。",
      mermaidContent: `
flowchart TD
    A[系统运行内存 (RAM)] -->|LLDB 提取| B[Raw Key/Salt]
    C[微信本地 msg_*.db] --> D(SQLCipher 解密)
    B --> D
    
    D --> E[纯净 SQLite 数据]
    E -->|脚本清洗| F[Markdown 体系]
    F --> G[接入 NotebookLM/Feishu 知识库]
      `
    },
    {
      title: "10 / AGI 与具身智能演进图 (The Journey to Embodied AI)",
      desc: "全景展示现在所处的阶段以及未来的里程碑。我们正处于“数字自治”阶段，并已经开启接入本地 OpenClaw (小龙虾) 机械臂向实体操控推进的测试阶段。",
      mermaidContent: `
gantt
    title 蜂群与主控进化路线图 (Evolution Roadmap)
    dateFormat  YYYY-MM
    axisFormat  %Y-%m
    
    section 第一阶段：基础设施
    UI重构与设计语言 :done,    des1, 2026-03, 15d
    MCP全域接口接通    :done,    des2, 2026-03, 10d
    本地脱机模型集成    :done,    des3, 2026-04, 7d
    
    section 第二阶段：数字群体自治
    蜂群任务动态分配   :active,  sw1,  2026-04, 15d
    Unit1/2/3分布式组网 :active,  sw2,  2026-04, 15d
    自我代码审查与自愈 :active,  sw3,  2026-04, 20d
    
    section 第三阶段：具身与物理交互
    ★ OpenClaw 小龙虾实体嫁接 : active, emb0, 2026-05, 20d
    VEX硬件实体传感器串流 :         emb1, after emb0, 20d
    物理世界挛生与完全自主操作 :         emb2, 2026-06, 45d
      `
    },
    {
      title: "11 / 智能体协作进化纪事 (Collaboration Timeline)",
      desc: "通过读取本地全维度协作历史（共 11 段核心记忆切片），提取出的我们在短短几周内完成的超密集系统集成与架构演变，包含 Unit1/2/3 组网与硬件雏形（OpenClaw）。",
      mermaidContent: `
timeline
    title 🐝 Antigravity 智能体分布式系统进化编年史
    2026-03-24 : 阶段一：基础视窗重构
               : 沉浸式引擎 / Cyberpunk 新手引导 (CyberTour)
               : 教学工场 (Course Factory) Studio UI 重构
    2026-03-30 : 阶段二：感官与具身控制雏形
               : Titan OS 接入 Doubao V1 / VAD 防打断
               : 初始化 OpenClaw (小龙虾机械臂) 前期架构研究
    2026-04-03 : 阶段三：教育基建与知识输入
               : Carbon-X 课程内核植入 / NotebookLM 环境
    2026-04-06 : 阶段四：分布式全量计算部署
               : 【关键节点】建立 Unit1 / Unit2 / Unit3 (Mac) 三机 Antigravity 节点互联
               : Ollama 本地脱机大模型集成离线 RAG
               : 攻破本地微信运行加密协议，提取私有数据
    2026-04-06晚 : 阶段五：资源池自动化输出与物理延伸
               : 挂接 Feishu / NotebookLM 等 MCP 协议链
               : Geek Blueprint 等专业级 PPT 自动化投递
               : 向 OpenClaw 与物理世界操作迈进的准备阶段
    2026-04-06夜 : 阶段六：Jarvis 神经链路架构与跨机阵列
               : 激活 Unit-2 (Mercury) 破晓黎明自动雷达系统，完成底层 Cron 心跳挂载
               : 确立 Memory OS "工作记忆与潜意识分离"架构 (MEMORY.md/SOUL.md)
               : 集群任务自动化闭环：跨网数据捕获、大模型研报生成、自动邮件触达
               : 完成系统架构视窗向 Notion 风格 Wiki 知识库的重构升维
               : 部署 Evolution Probe (进化探针) 实现系统状态静默自治与自动写库
               : ⚡ Unit-2 (Mercury 游骑兵) 完成前沿侦测：捕获 5 个 HuggingFace 高维 AI 模型情报，并由 gemma4 提纯归档。
      `
    },
    {
      title: "12 / 操作系统级认知与子机阵列雷达 (Memory OS & Mercury Daemon)",
      desc: "解构源自 <b>Unit-2 (Mercury 游骑兵)</b> 及底层 Jarvis 架构的最新全自动演进。跨越单机局限，引入了自主心跳神经元（Cron Daemon）、自动商业情报外参抓取管线，以及面向未来的全息环境记录仪（Screenpipe）和深层潜意识记忆体（Letta/VectorDB）。",
      mermaidContent: `
graph LR
    classDef current fill:#16231d,stroke:#2ea043,stroke-width:2px,color:#fff;
    classDef future fill:#2d1b4e,stroke:#b15cff,stroke-width:2px,stroke-dasharray: 5 5,color:#fff;
    
    subgraph "感知与信息源头 (Input Radar)"
        U2Radar["🛡️ Unit-2 Mercury Radar<br/>(Github/HuggingFace每日全自动嗅探)"]:::current
        Screen["👁️ [未来装甲] Screenpipe<br/>(24/7 本机屏幕静默录影与 OCR)"]:::future
        ExtAPI["💬 外部数据网关<br/>(微信/飞书/音视频采集)"]:::current
    end

    subgraph "执行中枢与工作组区 (Cognition Base)"
        UI["⚡ Antigravity 实时上下文"]:::current
        Daily["📝 YYYY-MM-DD.md<br/>(每日流水碎片提取与过滤)"]:::current
        Cron["⏱️ 神经系统底层心跳<br/>(MacOS Cron Daemon)"]:::current
        Email["📧 自动化触达<br/>(my-email Skill 报告投递)"]:::current
    end

    subgraph "潜意识与无限记忆库 (The Subconscious)"
        Memory["🧠 MEMORY.md + SOUL.md<br/>(底层架构准则/指挥官价值观)"]:::current
        VectorDB["📚 Letta / VectorDB 增强脑库<br/>(外挂无限全生命周期记忆体)"]:::future
    end

    U2Radar -->|每日 8:00 AM Cron 触发| Cron
    Cron -->|大模型进行商业落地重写| Daily
    Daily --> Email
    Screen -.->|夜间脚本归档提纯| VectorDB
    ExtAPI --> UI
    UI <--> Daily
    Daily -->|提取长期价值 /learn| Memory
    UI -.->|触发潜意识溯源检索| VectorDB
      `
    }
  ];

  return (
    <div className="bg-white text-gray-900 min-h-screen flex font-sans antialiased">
      <Head>
        <title>系统架构与演进路线图 | System Architecture & Evolution</title>
      </Head>

      {/* Sidebar Wiki Index */}
      <aside className="fixed top-0 left-0 h-screen w-72 bg-gray-50 border-r border-gray-200 overflow-y-auto hidden md:block z-40 pt-6">
        <div className="px-6 mb-8 flex items-center gap-3">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-800" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          <span className="font-semibold text-lg tracking-tight">Antigravity Wiki</span>
        </div>
        <div className="px-4 mb-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">架构演进图谱 (Index)</div>
        <ul id="wiki-sidebar-list" className="space-y-1 px-2 pb-20">
          {sectionsData.map((sec, i) => (
            <li key={i}>
              <a 
                href={`#wiki-section-${i + 1}`}
                className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors truncate"
              >
                {sec.title}
              </a>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-72 min-h-screen flex flex-col">
        {/* Header Status */}
        <nav className="sticky top-0 w-full z-30 border-b border-gray-200 bg-white/90 backdrop-blur-md px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 md:hidden">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-800" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            <span className="font-semibold text-lg tracking-tight">Wiki</span>
          </div>
          <div className="hidden md:block"></div>
          <div className="flex gap-2">
            <span className="bg-blue-50 text-blue-600 border border-blue-200 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>v2.0 Wiki
            </span>
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">System Repository</span>
          </div>
        </nav>

        <main className="py-12 px-6 sm:px-10 max-w-5xl mx-auto space-y-24 flex-1 w-full">
          {/* Title Section */}
          <header className="max-w-3xl space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
              系统架构与演进路线图
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed">
              借鉴业界顶尖的微服务与Agent集群架构，融合 Apple 的极简交互、Google 的技术深度与 Notion 的知识管理理念。此文档全面解构目前的“蜂群系统”与“AI主控”，共包含 {sectionsData.length} 个层级的深度图谱。
            </p>
          </header>

          {/* Sections */}
          {sectionsData.map((sec, i) => (
            <section key={i} id={`wiki-section-${i + 1}`} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">{sec.title}</h2>
                <p 
                  className="text-gray-600 text-sm" 
                  dangerouslySetInnerHTML={{ __html: sec.desc }}
                />
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-[rgba(15,15,15,0.05)_0px_0px_0px_1px,rgba(15,15,15,0.1)_0px_2px_4px] transition-transform hover:shadow-lg">
                <div className="bg-slate-50 rounded-xl overflow-x-auto flex justify-center p-4">
                  <pre className="mermaid">
                    {sec.mermaidContent}
                  </pre>
                </div>
              </div>
            </section>
          ))}
        </main>
        
        <footer className="border-t border-gray-200 py-8 text-center bg-gray-50">
          <p className="text-sm font-medium text-gray-500">Antigravity Core © 2026. Designed with engineering precision.</p>
        </footer>
      </div>
    </div>
  );
}
