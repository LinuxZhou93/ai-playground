import type { Metadata } from "next";
import "./xmp.css";
import "./curriculum-release.css";
import "./teaching-scheduler.css";
import "./classroom-console.css";
import "./companion-experience.css";
import "./growth-intelligence.css";
import "./family-loop.css";
import "./edge-fleet.css";
import "./operations-center.css";
import "./governance-center.css";
import "./investor-demo-room.css";
import "./data-source-center.css";
import "./event-chain-center.css";

export const metadata: Metadata = {
  title: "XMP 奇妙伙伴 · 幼教 AI 操作系统",
  description: "连接课程、课堂、成长、家长、园所与设备的幼教 AI 操作系统。",
};

export default function XmpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
