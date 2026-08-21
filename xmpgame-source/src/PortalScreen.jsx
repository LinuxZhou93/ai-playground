import { ArrowUpRight, Box, Clapperboard, Hand, Sparkles, Trees } from "lucide-react";
import { appBase, stations } from "./stations.js";

const worldIcons = {
  1: Sparkles,
  2: Box,
  3: Trees,
  4: Clapperboard,
};

export function PortalScreen() {
  return (
    <main className="world-portal" data-testid="world-portal">
      <div className="world-portal__atmosphere" aria-hidden="true" />
      <header className="world-portal__header">
        <div className="world-portal__brand">
          <span>西马棚幼儿园</span>
          <i aria-hidden="true" />
          <span>AI 沉浸式互动世界</span>
        </div>
        <div className="world-portal__title">
          <p>四台俯拍一体机 · 四种固定 AI 配方 · 四个独立项目</p>
          <h1>放下一幅画，<em>看见四种可能</em></h1>
        </div>
        <div className="world-portal__touch-note">
          <Hand aria-hidden="true" />
          <span>轻触任意世界<br /><small>立即进入</small></span>
        </div>
      </header>

      <nav className="portal-worlds" aria-label="四个互动项目入口">
        {stations.map((station) => {
          const Icon = worldIcons[station.id];
          return (
            <a
              key={station.id}
              className={`portal-world portal-world--${station.id}`}
              href={`${appBase}station/${station.id}`}
              data-testid={`portal-station-${station.id}`}
            >
              <span className="portal-world__image" style={{ backgroundImage: `url("${station.background}")` }} aria-hidden="true" />
              <span className="portal-world__shade" aria-hidden="true" />
              <span className="portal-world__index">{String(station.id).padStart(2, "0")}</span>
              <span className="portal-world__content">
                <Icon aria-hidden="true" />
                <span>
                  <small>俯拍画作 × {station.recipe.label}</small>
                  <strong>{station.shortName}</strong>
                  <b>{station.recipe.summary}</b>
                </span>
              </span>
              <span className="portal-world__enter">进入世界 <ArrowUpRight aria-hidden="true" /></span>
            </a>
          );
        })}
      </nav>

      <footer className="world-portal__footer">
        <span>万物有灵</span>
        <span>四台设备操作完全相同：放好画纸，轻触一次，直接生成</span>
      </footer>
    </main>
  );
}
