import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArtworkKiosk } from "./ArtworkKiosk.jsx";
import { PortalScreen } from "./PortalScreen.jsx";
import { resolveExperienceRoute } from "./stations.js";
import { getModelStatus } from "./model-client.js";

function useSelectedStation() {
  return useMemo(() => {
    return resolveExperienceRoute(window.location.pathname, window.location.search, window.location.hash).station;
  }, []);
}

function useModelHealth() {
  const [health, setHealth] = useState({ status: "checking", capabilities: {} });
  useEffect(() => {
    let mounted = true;
    const refresh = () => getModelStatus().then((value) => mounted && setHealth(value));
    refresh();
    const timer = window.setInterval(refresh, 30000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);
  return health;
}

function clickVisiblePrimaryAction() {
  const actions = [...document.querySelectorAll("[data-kiosk-primary]")];
  const action = actions.find((element) => {
    const bounds = element.getBoundingClientRect();
    return !element.disabled && bounds.width > 0 && bounds.height > 0;
  });
  action?.click();
  return Boolean(action);
}

function useKioskDisplay(station) {
  const deviceMode = useMemo(() => {
    return new URLSearchParams(window.location.search).get("kiosk") === "1";
  }, []);
  const wakeLockRef = useRef(null);

  const keepScreenAwake = useCallback(async () => {
    if (!deviceMode || !navigator.wakeLock || wakeLockRef.current) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
      wakeLockRef.current.addEventListener("release", () => { wakeLockRef.current = null; });
    } catch {
      wakeLockRef.current = null;
    }
  }, [deviceMode]);

  const requestFullscreen = useCallback(() => {
    if (!deviceMode) return;
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen({ navigationUI: "hide" }).catch(() => {});
    }
    keepScreenAwake();
  }, [deviceMode, keepScreenAwake]);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${station.shortName} · 西马棚幼儿园`;
    document.body.classList.add("artwork-station-route");
    if (deviceMode) document.body.classList.add("kiosk-device");

    const preventContextMenu = (event) => {
      if (deviceMode) event.preventDefault();
    };
    const handlePhysicalKey = (event) => {
      if (!deviceMode || event.repeat || event.target?.closest?.("input, textarea, select, button, a, label")) return;
      if (event.key === "Enter" || event.key === " ") {
        if (clickVisiblePrimaryAction()) event.preventDefault();
      }
    };
    const restoreWakeLock = () => {
      if (document.visibilityState === "visible") keepScreenAwake();
    };

    document.addEventListener("contextmenu", preventContextMenu);
    window.addEventListener("keydown", handlePhysicalKey);
    document.addEventListener("visibilitychange", restoreWakeLock);
    keepScreenAwake();

    return () => {
      document.title = previousTitle;
      document.body.classList.remove("artwork-station-route", "kiosk-device");
      document.removeEventListener("contextmenu", preventContextMenu);
      window.removeEventListener("keydown", handlePhysicalKey);
      document.removeEventListener("visibilitychange", restoreWakeLock);
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
    };
  }, [deviceMode, keepScreenAwake, station]);

  return { deviceMode, requestFullscreen };
}

function StationExperience({ station }) {
  const health = useModelHealth();
  const { deviceMode, requestFullscreen } = useKioskDisplay(station);
  return (
    <div
      className={`app-shell station-shell station-shell--${station.id}${deviceMode ? " is-device-mode" : ""}`}
      style={{ "--station-accent": station.accent, "--station-accent-rgb": station.accentRgb }}
      onPointerDownCapture={requestFullscreen}
      data-device-mode={deviceMode ? "true" : "false"}
    >
      <ArtworkKiosk station={station} health={health} deviceMode={deviceMode} />
    </div>
  );
}

export function App() {
  const station = useSelectedStation();
  return station ? <StationExperience station={station} /> : <PortalScreen />;
}
