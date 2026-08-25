import { useCallback, useEffect, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

function readFullscreenState() {
  const apiFullscreen = Boolean(document.fullscreenElement);
  const displayModeFullscreen = Boolean(window.matchMedia?.("(display-mode: fullscreen)")?.matches);
  const fillsAvailableScreen = window.innerWidth >= window.screen.availWidth - 8
    && window.innerHeight >= window.screen.availHeight - 8;
  return { apiFullscreen, immersive: apiFullscreen || displayModeFullscreen || fillsAvailableScreen };
}

export function FullscreenButton({ className = "" }) {
  const [state, setState] = useState(readFullscreenState);
  const [feedback, setFeedback] = useState(state.immersive ? "现在就是全屏" : "轻触进入全屏");
  const supported = Boolean(document.documentElement.requestFullscreen);

  useEffect(() => {
    const syncFullscreenState = () => {
      const next = readFullscreenState();
      setState(next);
      setFeedback(next.immersive ? "现在就是全屏" : "轻触进入全屏");
    };
    const handleFullscreenError = () => setFeedback("没能进入全屏，请老师按 F11");
    document.addEventListener("fullscreenchange", syncFullscreenState);
    document.addEventListener("fullscreenerror", handleFullscreenError);
    window.addEventListener("resize", syncFullscreenState);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
      document.removeEventListener("fullscreenerror", handleFullscreenError);
      window.removeEventListener("resize", syncFullscreenState);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (state.immersive && !state.apiFullscreen) {
      setFeedback("现在就是全屏");
      return;
    }
    if (!supported) {
      setFeedback("浏览器禁止全屏，请老师按 F11");
      return;
    }
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen?.();
        setFeedback("已经退出全屏");
      } else {
        await document.documentElement.requestFullscreen?.({ navigationUI: "hide" });
        setFeedback("全屏成功");
      }
    } catch {
      setFeedback("没能进入全屏，请老师按 F11");
    }
  }, [state, supported]);

  const Icon = state.apiFullscreen ? Minimize2 : Maximize2;
  const label = state.apiFullscreen ? "退出全屏" : state.immersive ? "已经全屏" : "全屏体验";
  return (
    <button
      type="button"
      className={`fullscreen-button ${className}`.trim()}
      onClick={toggleFullscreen}
      data-fullscreen-control
      data-testid="fullscreen-toggle"
      data-state={state.immersive ? "immersive" : feedback.includes("F11") ? "blocked" : "windowed"}
      aria-label={label}
    >
      <Icon aria-hidden="true" />
      <span className="fullscreen-button__copy">
        <b>{label}</b>
        <small role="status">{feedback}</small>
      </span>
    </button>
  );
}
