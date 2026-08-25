import { ArrowUpRight, Hand, WandSparkles } from "lucide-react";
import { FullscreenButton } from "./FullscreenButton.jsx";
import { appBase, assetPath, stations } from "./stations.js";

export function PortalScreen() {
  const kioskQuery = new URLSearchParams(window.location.search).get("kiosk") === "1" ? "?kiosk=1" : "";
  return (
    <main className="kid-portal" data-testid="world-portal">
      <div
        className="kid-portal__background"
        style={{ backgroundImage: `url("${assetPath("assets/cartoon/cartoon-ocean-background.webp")}")` }}
        aria-hidden="true"
      />

      <header className="kid-portal__topbar">
        <div className="kid-portal__brand">
          <span>西马棚幼儿园</span>
          <strong>AI 绘画创作站</strong>
        </div>
        <FullscreenButton className="fullscreen-button--portal" />
      </header>

      <section className="kid-portal__hero">
        <p><WandSparkles aria-hidden="true" />四台触屏一体机 · 四种画画魔法 · 都能语音生图</p>
        <h1><span>选一个魔法，</span><strong>让你的画活起来！</strong></h1>
        <div className="kid-portal__touch-note"><Hand aria-hidden="true" />轻轻点一下，就能进去玩</div>
      </section>

      <nav className="kid-portal__worlds" aria-label="四个互动项目入口">
        {stations.map((station) => (
            <a
              key={station.id}
              className={`kid-world-card kid-world-card--${station.id}`}
              href={`${appBase}station/${station.id}${kioskQuery}`}
              style={{ "--card-accent": station.accent, "--card-accent-rgb": station.accentRgb }}
              data-testid={`portal-station-${station.id}`}
            >
              <span className="kid-world-card__number">{String(station.id).padStart(2, "0")}</span>
              <img className="kid-world-card__mascot" src={station.mascot} alt="" aria-hidden="true" />
              <span className="kid-world-card__copy">
                <small>{station.recipe.label}</small>
                <strong>{station.shortName}</strong>
                <b>{station.kidTitle}</b>
              </span>
              <span className="kid-world-card__enter">进去玩 <ArrowUpRight aria-hidden="true" /></span>
            </a>
        ))}
      </nav>

      <footer className="kid-portal__footer">
        <span>只拍画纸，不拍小朋友</span>
        <b>放好画纸 · 轻触或说一句 · 直接生成</b>
      </footer>
    </main>
  );
}
