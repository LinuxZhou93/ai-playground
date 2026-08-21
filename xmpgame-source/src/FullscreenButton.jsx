import { useCallback, useEffect, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

export function FullscreenButton({ className = "" }) {
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const supported = Boolean(document.documentElement.requestFullscreen);

  useEffect(() => {
    const syncFullscreenState = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen?.();
      } else {
        await document.documentElement.requestFullscreen?.({ navigationUI: "hide" });
      }
    } catch {
      // Some managed browsers disable the Fullscreen API; kiosk mode still remains available.
    }
  }, []);

  if (!supported) return null;

  const Icon = isFullscreen ? Minimize2 : Maximize2;
  return (
    <button
      type="button"
      className={`fullscreen-button ${className}`.trim()}
      onClick={toggleFullscreen}
      data-fullscreen-control
      data-testid="fullscreen-toggle"
      aria-label={isFullscreen ? "退出全屏" : "全屏体验"}
    >
      <Icon aria-hidden="true" />
      <span>{isFullscreen ? "退出全屏" : "全屏体验"}</span>
    </button>
  );
}
