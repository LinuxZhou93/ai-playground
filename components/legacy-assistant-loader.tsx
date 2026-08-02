"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function LegacyAssistantLoader() {
  const pathname = usePathname();
  const isXmp = pathname === "/xmp" || pathname.startsWith("/xmp/");

  useEffect(() => {
    if (isXmp) return;
    try {
      const keys = ["settings-storage", "settings_storage"];
      let needsRefresh = false;
      keys.forEach((key) => {
        if (window.localStorage.getItem(key) !== null) {
          window.localStorage.removeItem(key);
          needsRefresh = true;
        }
      });
      if (needsRefresh) window.location.reload();
    } catch {
      // Storage may be unavailable in hardened browser contexts.
    }
  }, [isXmp]);

  if (isXmp) return null;
  return (
    <Script
      src={`/assets/js/titan-ai-assistant.js?v=${Date.now()}`}
      strategy="lazyOnload"
    />
  );
}
