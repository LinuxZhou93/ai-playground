"use client";

import {
  Activity,
  AlertTriangle,
  Box,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  CloudOff,
  Cpu,
  Database,
  Download,
  Gauge,
  HardDrive,
  History,
  LockKeyhole,
  MicOff,
  Network,
  PackageCheck,
  Play,
  Radio,
  RefreshCw,
  RotateCcw,
  Router,
  Search,
  ShieldCheck,
  ShieldOff,
  SlidersHorizontal,
  Sparkles,
  Tablet,
  TicketCheck,
  Wifi,
  WifiOff,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useXmpEvents, XMP_DEMO_CORRELATION_ID } from "./event-store";

type DeviceStatus = "online" | "degraded" | "offline" | "maintenance";
type FleetPane = "telemetry" | "policy" | "updates";
type DiagnosticState = "idle" | "running" | "complete";

type FleetDevice = {
  id: string;
  name: string;
  type: "companion" | "classroom" | "hub" | "audio";
  location: string;
  status: DeviceStatus;
  version: string;
  lastSeen: string;
  ip: string;
  latency: string;
  temperature: string;
  storage: number;
};

const deviceSeed: FleetDevice[] = [
  {
    id: "C-03",
    name: "奇妙宠 C-03",
    type: "companion",
    location: "大一班 · 探究区",
    status: "degraded",
    version: "XMP Edge 2.4.1",
    lastSeen: "刚刚",
    ip: "10.21.4.33",
    latency: "42 ms",
    temperature: "48°C",
    storage: 64,
  },
  {
    id: "T-01",
    name: "课堂主控 T-01",
    type: "classroom",
    location: "大一班 · 教师台",
    status: "online",
    version: "XMP Class 3.2.0",
    lastSeen: "刚刚",
    ip: "10.21.4.20",
    latency: "18 ms",
    temperature: "41°C",
    storage: 48,
  },
  {
    id: "E-01",
    name: "边缘中枢 E-01",
    type: "hub",
    location: "一层 · 弱电间",
    status: "online",
    version: "XMP Hub 1.8.3",
    lastSeen: "刚刚",
    ip: "10.21.4.2",
    latency: "7 ms",
    temperature: "44°C",
    storage: 72,
  },
  {
    id: "A-07",
    name: "互动音箱 A-07",
    type: "audio",
    location: "大二班 · 阅读角",
    status: "offline",
    version: "XMP Audio 1.5.7",
    lastSeen: "18 分钟前",
    ip: "10.21.5.47",
    latency: "—",
    temperature: "—",
    storage: 37,
  },
  {
    id: "C-08",
    name: "奇妙宠 C-08",
    type: "companion",
    location: "中三班 · 建构区",
    status: "online",
    version: "XMP Edge 2.4.1",
    lastSeen: "刚刚",
    ip: "10.21.3.38",
    latency: "31 ms",
    temperature: "46°C",
    storage: 59,
  },
];

const statusLabel: Record<DeviceStatus, string> = {
  online: "在线",
  degraded: "降级运行",
  offline: "离线",
  maintenance: "维护中",
};
const deviceIcon = {
  companion: Sparkles,
  classroom: Tablet,
  hub: Router,
  audio: Radio,
};

export function EdgeFleet() {
  const { emit } = useXmpEvents();
  const [devices, setDevices] = useState(deviceSeed);
  const [selectedId, setSelectedId] = useState("C-03");
  const [pane, setPane] = useState<FleetPane>("telemetry");
  const [diagnostic, setDiagnostic] = useState<DiagnosticState>("idle");
  const [actionConfirm, setActionConfirm] = useState<
    "restart" | "rollback" | "deploy" | null
  >(null);
  const [incidentState, setIncidentState] = useState<
    "open" | "ticketed" | "resolved"
  >("open");
  const [rollout, setRollout] = useState<"ready" | "canary" | "complete">(
    "ready",
  );
  const [filter, setFilter] = useState<"all" | DeviceStatus>("all");

  const selected =
    devices.find((device) => device.id === selectedId) ?? devices[0];
  const counts = useMemo(
    () => ({
      online: devices.filter((device) => device.status === "online").length,
      degraded: devices.filter((device) => device.status === "degraded").length,
      offline: devices.filter((device) => device.status === "offline").length,
    }),
    [devices],
  );
  const visibleDevices = devices.filter(
    (device) => filter === "all" || device.status === filter,
  );
  const SelectedDeviceIcon = deviceIcon[selected.type];

  const runDiagnostic = () => {
    setDiagnostic("running");
    window.setTimeout(() => {
      setDiagnostic("complete");
      emit({
        correlationId: XMP_DEMO_CORRELATION_ID,
        kind: "device.diagnostic_completed",
        domain: "fleet",
        title: `${selected.name} 安全诊断完成`,
        detail: "硬件与网络正常，语音推理进程内存偏高；未扩大数据采集。",
        actor: "园所管理者",
        entity: selected.id,
        privacy: "aggregate",
      });
    }, 700);
  };

  const restartService = () => {
    setDevices((items) =>
      items.map((item) =>
        item.id === selected.id
          ? { ...item, status: "online", latency: "24 ms", temperature: "45°C" }
          : item,
      ),
    );
    setActionConfirm(null);
    setIncidentState("resolved");
    setDiagnostic("complete");
    emit({
      correlationId: XMP_DEMO_CORRELATION_ID,
      kind: "device.recovered",
      domain: "fleet",
      title: `${selected.name} 已受控恢复`,
      detail: "仅重启语音推理服务，物理静音、教师接管与本地安全应答持续有效。",
      actor: "园所管理者",
      entity: selected.id,
      privacy: "aggregate",
    });
  };

  const advanceRollout = () => {
    if (rollout === "ready") setRollout("canary");
    else setRollout("complete");
    setActionConfirm(null);
  };

  return (
    <div className="xmp-fleet">
      <section className="xmp-fleet-head">
        <div>
          <span>EDGE FLEET</span>
          <h1>每一台设备都可见、可控、可降级、可追责。</h1>
          <p>
            统一管理奇妙宠、课堂主控、边缘中枢与音频终端；网络不稳定时保持安全底线，任何远程操作都留下审计记录。
          </p>
        </div>
        <div>
          <span>
            <ShieldCheck size={14} /> 物理控制优先于远程策略
          </span>
          <button onClick={() => setPane("updates")}>
            <PackageCheck size={15} /> 内容与版本发布
          </button>
        </div>
      </section>

      <section className="xmp-fleet-kpis">
        <article>
          <span>
            <Box size={15} />
          </span>
          <div>
            <b>24</b>
            <small>演示租户已注册终端</small>
          </div>
          <em>4 类设备</em>
        </article>
        <article>
          <span>
            <Wifi size={15} />
          </span>
          <div>
            <b>21</b>
            <small>在线且策略同步</small>
          </div>
          <em>过去 5 分钟</em>
        </article>
        <article>
          <span>
            <AlertTriangle size={15} />
          </span>
          <div>
            <b>{counts.degraded + 1}</b>
            <small>降级运行</small>
          </div>
          <em className="warn">交互仍安全</em>
        </article>
        <article>
          <span>
            <WifiOff size={15} />
          </span>
          <div>
            <b>{counts.offline}</b>
            <small>离线终端</small>
          </div>
          <em className="danger">已创建事件</em>
        </article>
      </section>

      <section className="xmp-fleet-workbench">
        <aside className="xmp-fleet-list">
          <header>
            <div>
              <span>CAMPUS TOPOLOGY</span>
              <h2>锦江园 · 设备舰队</h2>
            </div>
            <button aria-label="园区切换">
              <ChevronDown size={14} />
            </button>
          </header>
          <div className="xmp-site-health">
            <span>
              <i />
            </span>
            <div>
              <b>园区边缘网络稳定</b>
              <small>中枢 E-01 · 双链路在线</small>
            </div>
            <em>99.96%</em>
          </div>
          <label>
            <Search size={13} />
            <input placeholder="搜索设备 ID 或空间" />
          </label>
          <div className="xmp-fleet-filters">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              全部 {devices.length}
            </button>
            <button
              className={filter === "degraded" ? "active" : ""}
              onClick={() => setFilter("degraded")}
            >
              降级 {counts.degraded}
            </button>
            <button
              className={filter === "offline" ? "active" : ""}
              onClick={() => setFilter("offline")}
            >
              离线 {counts.offline}
            </button>
          </div>
          <div className="xmp-device-list">
            {visibleDevices.map((device) => {
              const Icon = deviceIcon[device.type];
              return (
                <button
                  key={device.id}
                  className={selected.id === device.id ? "active" : ""}
                  onClick={() => {
                    setSelectedId(device.id);
                    setDiagnostic("idle");
                    setActionConfirm(null);
                  }}
                >
                  <span className={device.type}>
                    <Icon size={14} />
                  </span>
                  <div>
                    <b>{device.name}</b>
                    <small>{device.location}</small>
                    <em>{device.version}</em>
                  </div>
                  <i className={device.status}>{statusLabel[device.status]}</i>
                </button>
              );
            })}
          </div>
          <section className="xmp-edge-map">
            <div className="xmp-fleet-section-title">
              <span>LOCAL EDGE</span>
              <h3>本地服务拓扑</h3>
            </div>
            <div>
              <span className="node hub">
                <Router size={14} />
                <b>E-01</b>
              </span>
              <i />
              <span className="node">
                <Cpu size={14} />
                <b>推理</b>
              </span>
              <i />
              <span className="node">
                <Database size={14} />
                <b>缓存</b>
              </span>
            </div>
            <p>
              <CloudOff size={12} />{" "}
              外网中断时保留本地课程、静音、教师接管与安全应答。
            </p>
          </section>
          <footer>
            <ShieldOff size={13} />
            <span>
              设备页不显示或回传原始儿童音视频；遥测仅包含运行健康和脱敏事件。
            </span>
          </footer>
        </aside>

        <main className="xmp-device-detail">
          <header>
            <div className="xmp-device-identity">
              <span className={selected.type}>
                <SelectedDeviceIcon size={19} />
              </span>
              <div>
                <small>
                  {selected.id} · {selected.location}
                </small>
                <h2>{selected.name}</h2>
                <p>
                  <i className={selected.status} />{" "}
                  {statusLabel[selected.status]} · 最近心跳 {selected.lastSeen}
                </p>
              </div>
            </div>
            <div>
              <button>
                <History size={14} /> 操作历史
              </button>
              <button className="more">
                <SlidersHorizontal size={14} /> 设备设置
              </button>
            </div>
          </header>
          <nav>
            <button
              className={pane === "telemetry" ? "active" : ""}
              onClick={() => setPane("telemetry")}
            >
              实时遥测
            </button>
            <button
              className={pane === "policy" ? "active" : ""}
              onClick={() => setPane("policy")}
            >
              安全策略
            </button>
            <button
              className={pane === "updates" ? "active" : ""}
              onClick={() => setPane("updates")}
            >
              版本与内容
            </button>
          </nav>
          {pane === "telemetry" ? (
            <TelemetryPanel
              device={selected}
              diagnostic={diagnostic}
              onDiagnostic={runDiagnostic}
              onRestart={() => setActionConfirm("restart")}
            />
          ) : pane === "policy" ? (
            <PolicyPanel />
          ) : (
            <UpdatePanel
              rollout={rollout}
              onDeploy={() => setActionConfirm("deploy")}
              onRollback={() => setActionConfirm("rollback")}
            />
          )}
          <section className="xmp-fleet-safety">
            <MicOff size={16} />
            <div>
              <b>物理静音与教师接管始终有效</b>
              <p>
                远程策略不能解除设备物理静音，不能覆盖教师端“立即停止交互”，也不能在离线时扩大采集范围。
              </p>
            </div>
            <em>最高优先级</em>
          </section>
        </main>

        <aside className="xmp-incident-rail">
          <header>
            <div>
              <span>INCIDENT RESPONSE</span>
              <h2>事件与处置</h2>
            </div>
            <em className={incidentState}>
              {incidentState === "open"
                ? "P2 处理中"
                : incidentState === "ticketed"
                  ? "工单已创建"
                  : "已恢复"}
            </em>
          </header>
          <section className="xmp-incident-card">
            <div className="xmp-incident-title">
              <span>
                <AlertTriangle size={15} />
              </span>
              <div>
                <b>C-03 语音服务延迟升高</b>
                <small>INC-0728-03 · 09:28 触发</small>
              </div>
            </div>
            <dl>
              <div>
                <dt>影响</dt>
                <dd>响应延迟，已切换为短句模式</dd>
              </div>
              <div>
                <dt>安全</dt>
                <dd className="safe">静音与教师接管正常</dd>
              </div>
              <div>
                <dt>范围</dt>
                <dd>仅大一班 C-03</dd>
              </div>
            </dl>
            <div className="xmp-cause-chain">
              <span className="done">
                <Check size={10} />
                检测
              </span>
              <i />
              <span className={diagnostic !== "idle" ? "done" : ""}>
                {diagnostic !== "idle" ? <Check size={10} /> : "2"}诊断
              </span>
              <i />
              <span className={incidentState === "resolved" ? "done" : ""}>
                {incidentState === "resolved" ? <Check size={10} /> : "3"}恢复
              </span>
            </div>
            {diagnostic === "idle" ? (
              <button onClick={runDiagnostic}>
                <Play size={13} /> 运行安全诊断
              </button>
            ) : diagnostic === "running" ? (
              <button disabled>
                <RefreshCw size={13} className="spin" /> 检查本地服务…
              </button>
            ) : (
              <div className="xmp-diagnostic-result">
                <CheckCircle2 size={14} />
                <p>
                  <b>硬件与网络正常</b>
                  <span>语音推理进程内存占用异常，建议仅重启该服务。</span>
                </p>
              </div>
            )}
          </section>
          {diagnostic === "complete" && incidentState !== "resolved" && (
            <section className="xmp-recovery-plan">
              <div className="xmp-fleet-section-title">
                <span>SAFE RECOVERY</span>
                <h3>建议处置</h3>
              </div>
              <article>
                <span>
                  <RefreshCw size={14} />
                </span>
                <div>
                  <b>重启语音推理服务</b>
                  <small>不中断物理静音 · 不重启整机 · 预计 18 秒</small>
                </div>
              </article>
              <button onClick={() => setActionConfirm("restart")}>
                <Wrench size={13} /> 执行受控恢复
              </button>
              <button
                className="secondary"
                onClick={() => setIncidentState("ticketed")}
              >
                <TicketCheck size={13} /> 转人工维护工单
              </button>
            </section>
          )}
          <section className="xmp-fleet-audit">
            <div className="xmp-fleet-section-title">
              <span>AUDIT TRAIL</span>
              <h3>最近操作</h3>
            </div>
            <article>
              <time>09:30</time>
              <span />
              <p>
                <b>自动降级为短句模式</b>
                <small>策略引擎 · 无数据扩采</small>
              </p>
            </article>
            <article>
              <time>09:28</time>
              <span />
              <p>
                <b>检测到 P95 延迟超过阈值</b>
                <small>边缘中枢 E-01</small>
              </p>
            </article>
            <article>
              <time>昨天</time>
              <span />
              <p>
                <b>安全策略 v12 校验通过</b>
                <small>园所管理员 · 双人复核</small>
              </p>
            </article>
          </section>
        </aside>
      </section>

      {actionConfirm && (
        <div className="xmp-fleet-modal" role="dialog" aria-modal="true">
          <section>
            <header>
              <span>
                {actionConfirm === "restart" ? (
                  <RefreshCw size={18} />
                ) : actionConfirm === "rollback" ? (
                  <RotateCcw size={18} />
                ) : (
                  <Download size={18} />
                )}
              </span>
              <div>
                <b>
                  {actionConfirm === "restart"
                    ? "确认重启语音推理服务"
                    : actionConfirm === "rollback"
                      ? "确认回滚到上一稳定版本"
                      : "确认开始小范围发布"}
                </b>
                <small>LOCAL DEMO · 不会操作真实设备</small>
              </div>
              <button
                aria-label="关闭确认"
                onClick={() => setActionConfirm(null)}
              >
                <X size={16} />
              </button>
            </header>
            <div>
              <CircleAlert size={15} />
              <p>
                {actionConfirm === "restart"
                  ? "仅重启 C-03 的语音推理进程；物理静音、教师接管和本地安全应答保持有效。"
                  : actionConfirm === "rollback"
                    ? "回滚只影响内容与模型包，不回退安全策略和设备身份凭证。"
                    : "先向 3 台演示终端发布，观察 15 分钟后才能扩大范围。"}
              </p>
            </div>
            <dl>
              <div>
                <dt>操作人</dt>
                <dd>园所管理者（本地演示）</dd>
              </div>
              <div>
                <dt>审计编号</dt>
                <dd>AUD-LOCAL-0728</dd>
              </div>
            </dl>
            <footer>
              <button onClick={() => setActionConfirm(null)}>取消</button>
              <button
                className="confirm"
                onClick={
                  actionConfirm === "restart"
                    ? restartService
                    : actionConfirm === "deploy"
                      ? advanceRollout
                      : () => {
                          setRollout("ready");
                          setActionConfirm(null);
                        }
                }
              >
                <LockKeyhole size={13} /> 二次确认并执行
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}

function TelemetryPanel({
  device,
  diagnostic,
  onDiagnostic,
  onRestart,
}: {
  device: FleetDevice;
  diagnostic: DiagnosticState;
  onDiagnostic: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="xmp-telemetry">
      <section className="xmp-telemetry-cards">
        <article>
          <span>
            <Network size={14} />
          </span>
          <div>
            <small>边缘延迟 P95</small>
            <b>{device.latency}</b>
            <em className={device.status === "degraded" ? "warn" : ""}>
              {device.status === "degraded" ? "高于基线" : "正常"}
            </em>
          </div>
        </article>
        <article>
          <span>
            <Cpu size={14} />
          </span>
          <div>
            <small>推理进程</small>
            <b>{device.status === "offline" ? "不可用" : "82%"}</b>
            <em className={device.status === "degraded" ? "warn" : ""}>
              {device.status === "degraded" ? "内存偏高" : "稳定"}
            </em>
          </div>
        </article>
        <article>
          <span>
            <Gauge size={14} />
          </span>
          <div>
            <small>设备温度</small>
            <b>{device.temperature}</b>
            <em>安全范围</em>
          </div>
        </article>
        <article>
          <span>
            <HardDrive size={14} />
          </span>
          <div>
            <small>本地存储</small>
            <b>{device.storage}%</b>
            <em>保留 21 GB</em>
          </div>
        </article>
      </section>
      <section className="xmp-telemetry-chart">
        <div className="xmp-fleet-section-title">
          <span>LIVE HEALTH · LAST 30 MIN</span>
          <h3>响应延迟与安全服务可用性</h3>
        </div>
        <div className="xmp-chart-legend">
          <span>
            <i />
            响应延迟
          </span>
          <span>
            <i />
            安全服务
          </span>
        </div>
        <div className="xmp-css-chart">
          <div className="grid-lines">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="latency-line">
            <i style={{ height: "28%" }} />
            <i style={{ height: "31%" }} />
            <i style={{ height: "36%" }} />
            <i style={{ height: "43%" }} />
            <i style={{ height: "68%" }} />
            <i style={{ height: "78%" }} />
            <i style={{ height: "61%" }} />
            <i style={{ height: "48%" }} />
            <i style={{ height: "39%" }} />
          </div>
          <div className="safety-line" />
          <span className="event">09:28 自动降级</span>
        </div>
        <footer>
          <span>09:05</span>
          <span>09:15</span>
          <span>09:25</span>
          <span>09:35</span>
        </footer>
      </section>
      <section className="xmp-device-runtime">
        <div className="xmp-fleet-section-title">
          <span>RUNTIME SERVICES</span>
          <h3>边缘服务</h3>
        </div>
        <div>
          <article>
            <span className="ok">
              <Check size={12} />
            </span>
            <p>
              <b>安全策略守护</b>
              <small>独立进程 · 物理控制优先</small>
            </p>
            <em>运行中</em>
          </article>
          <article>
            <span className={device.status === "degraded" ? "warn" : "ok"}>
              {device.status === "degraded" ? (
                <AlertTriangle size={12} />
              ) : (
                <Check size={12} />
              )}
            </span>
            <p>
              <b>语音推理</b>
              <small>本地唤醒 · 本地短句缓存</small>
            </p>
            <em>{device.status === "degraded" ? "降级" : "运行中"}</em>
          </article>
          <article>
            <span className="ok">
              <Check size={12} />
            </span>
            <p>
              <b>内容缓存</b>
              <small>课程包 2.4 GB · 已校验</small>
            </p>
            <em>运行中</em>
          </article>
        </div>
        <footer>
          <button onClick={onDiagnostic} disabled={diagnostic === "running"}>
            <Activity size={13} />{" "}
            {diagnostic === "running" ? "诊断中…" : "运行诊断"}
          </button>
          <button onClick={onRestart}>
            <RefreshCw size={13} /> 重启单项服务
          </button>
        </footer>
      </section>
    </div>
  );
}

function PolicyPanel() {
  return (
    <div className="xmp-policy">
      <section className="xmp-policy-profile">
        <header>
          <span>
            <ShieldCheck size={17} />
          </span>
          <div>
            <b>幼儿交互安全策略 v12</b>
            <small>园所级基线 · 最近校验 今天 08:42</small>
          </div>
          <em>已同步</em>
        </header>
        <div>
          <article>
            <span>
              <MicOff size={14} />
            </span>
            <p>
              <b>物理静音不可远程解除</b>
              <small>任何云端或园所策略均不得覆盖</small>
            </p>
            <i className="locked">
              <LockKeyhole size={12} />
            </i>
          </article>
          <article>
            <span>
              <CloudOff size={14} />
            </span>
            <p>
              <b>断网安全降级</b>
              <small>仅保留本地安全应答与教师控制</small>
            </p>
            <i className="on">
              <Check size={12} />
            </i>
          </article>
          <article>
            <span>
              <Database size={14} />
            </span>
            <p>
              <b>原始音频即时丢弃</b>
              <small>不落盘，不进入诊断日志</small>
            </p>
            <i className="on">
              <Check size={12} />
            </i>
          </article>
          <article>
            <span>
              <Zap size={14} />
            </span>
            <p>
              <b>教师立即停止交互</b>
              <small>局域网与设备物理按键双通道</small>
            </p>
            <i className="locked">
              <LockKeyhole size={12} />
            </i>
          </article>
        </div>
      </section>
      <section className="xmp-policy-scope">
        <div className="xmp-fleet-section-title">
          <span>POLICY SCOPE</span>
          <h3>当前生效范围</h3>
        </div>
        <dl>
          <div>
            <dt>适用终端</dt>
            <dd>奇妙宠、课堂主控、互动音箱</dd>
          </div>
          <div>
            <dt>静音窗口</dt>
            <dd>每日 18:00–次日 07:30</dd>
          </div>
          <div>
            <dt>本地保留</dt>
            <dd>脱敏事件日志 7 天</dd>
          </div>
          <div>
            <dt>变更审批</dt>
            <dd>园所管理员 + 安全负责人</dd>
          </div>
        </dl>
        <button>
          <SlidersHorizontal size={13} /> 创建策略变更草稿
        </button>
      </section>
    </div>
  );
}

function UpdatePanel({
  rollout,
  onDeploy,
  onRollback,
}: {
  rollout: "ready" | "canary" | "complete";
  onDeploy: () => void;
  onRollback: () => void;
}) {
  return (
    <div className="xmp-updates">
      <section className="xmp-release-card">
        <header>
          <span>
            <PackageCheck size={17} />
          </span>
          <div>
            <small>READY FOR CANARY</small>
            <h3>课程与模型包 2026.07.28</h3>
            <p>
              《会呼吸的种子》互动内容 · 本地语音模型补丁 · 不含安全策略变更
            </p>
          </div>
          <em>签名已验证</em>
        </header>
        <div className="xmp-release-files">
          <article>
            <span>
              <Box size={14} />
            </span>
            <p>
              <b>课程内容包</b>
              <small>184 MB · SHA256 已校验</small>
            </p>
            <em>v4</em>
          </article>
          <article>
            <span>
              <Cpu size={14} />
            </span>
            <p>
              <b>本地语音模型</b>
              <small>72 MB · 低延迟修复</small>
            </p>
            <em>v2.4.2</em>
          </article>
        </div>
        <div className="xmp-rollout-track">
          <span className="done">
            <Check size={10} />
            签名校验
          </span>
          <i />
          <span className={rollout !== "ready" ? "done" : ""}>
            {rollout !== "ready" ? <Check size={10} /> : "2"}3 台灰度
          </span>
          <i />
          <span className={rollout === "complete" ? "done" : ""}>
            {rollout === "complete" ? <Check size={10} /> : "3"}全园发布
          </span>
        </div>
        {rollout === "ready" ? (
          <button onClick={onDeploy}>
            <Download size={13} /> 向 3 台演示终端灰度发布
          </button>
        ) : rollout === "canary" ? (
          <div className="xmp-canary-state">
            <Activity size={14} />
            <p>
              <b>灰度观察中 · 3/3 在线</b>
              <span>崩溃率 0% · 延迟基线稳定 · 还需人工确认扩大范围</span>
            </p>
            <button onClick={onDeploy}>扩大到全园</button>
          </div>
        ) : (
          <div className="xmp-release-complete">
            <CheckCircle2 size={14} />
            <p>
              <b>演示舰队发布完成</b>
              <span>24/24 校验通过 · 本地模拟，无真实下发</span>
            </p>
          </div>
        )}
      </section>
      <section className="xmp-version-history">
        <div className="xmp-fleet-section-title">
          <span>VERSION HISTORY</span>
          <h3>稳定版本与回滚点</h3>
        </div>
        <article>
          <span className="current">当前</span>
          <p>
            <b>XMP Edge 2.4.1</b>
            <small>2026-07-24 · 24 台稳定</small>
          </p>
          <em>当前基线</em>
        </article>
        <article>
          <span>稳定</span>
          <p>
            <b>XMP Edge 2.3.9</b>
            <small>2026-07-11 · 可一键恢复</small>
          </p>
          <button onClick={onRollback}>
            <RotateCcw size={12} /> 回滚
          </button>
        </article>
      </section>
    </div>
  );
}
