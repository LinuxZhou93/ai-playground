import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolveExperienceRoute, resolveStation, stations } from "../src/stations.js";

test("all four kiosks use the same overhead artwork input and single-result flow", () => {
  assert.equal(stations.length, 4);
  stations.forEach((station) => {
    assert.equal(station.mode, "artwork");
    assert.equal(station.captureSource, "overhead-a4-artwork");
    assert.equal(station.inputMode, "artwork-camera");
    assert.equal(station.outputMode, "single-generated-image");
    assert.equal(station.interactionDepth, 1);
    assert.match(station.experience, /^artwork-/);
  });
});

test("the legacy program mapping is retained while every station has one unique fixed recipe", () => {
  assert.deepEqual(stations.map((station) => station.legacy), [
    "xmptest3.py",
    "children_ai_magic_imgedit.py",
    "children_ai_videobf.py",
    "children_ai_magic_video.py",
  ]);
  assert.equal(new Set(stations.map((station) => station.recipe.id)).size, 4);
  stations.forEach((station) => {
    assert.ok(station.recipe.label.length >= 4);
    assert.ok(station.recipe.direction.length >= 45);
    assert.equal(station.modelSignals.length, 3);
  });
});

test("onsite kiosk launcher accepts any of the four fixed station routes", () => {
  const manifest = JSON.parse(readFileSync(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));
  const launcher = readFileSync(new URL("../public/setup/start-xmpgame-kiosk.cmd", import.meta.url), "utf8");
  const installer = readFileSync(new URL("../public/setup/install-xmpgame-autostart.ps1", import.meta.url), "utf8");
  assert.equal(manifest.display, "fullscreen");
  assert.match(launcher, /station\/%STATION%\?kiosk=1/);
  assert.match(launcher, /--kiosk/);
  assert.match(launcher, /use-fake-ui-for-media-stream/);
  assert.match(installer, /ValidateSet\(1, 2, 3, 4\)/);
  assert.match(installer, /station\/\$Station\?kiosk=1/);
});

test("station routes resolve by number, path, query-like token and new slug", () => {
  assert.equal(resolveStation("2").id, 2);
  assert.equal(resolveStation("station/3").id, 3);
  assert.equal(resolveStation("station=4").id, 4);
  assert.equal(resolveStation("creature-awakening").id, 1);
  assert.equal(resolveStation("unknown").id, 1);
});

test("the site root remains a four-project portal while device URLs stay independent", () => {
  assert.equal(resolveExperienceRoute("/").type, "portal");
  assert.equal(resolveExperienceRoute("/xmpgame").type, "portal");
  assert.equal(resolveExperienceRoute("/xmpgame/").type, "portal");
  assert.equal(resolveExperienceRoute("/xmpgame/station/1").station.id, 1);
  assert.equal(resolveExperienceRoute("/station/4/").station.id, 4);
  assert.equal(resolveExperienceRoute("/xmpgame", "?station=3").station.id, 3);
});

test("the portal and every station expose the same explicit fullscreen control", () => {
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  const portal = readFileSync(new URL("../src/PortalScreen.jsx", import.meta.url), "utf8");
  const control = readFileSync(new URL("../src/FullscreenButton.jsx", import.meta.url), "utf8");
  assert.match(app, /<FullscreenButton className="fullscreen-button--station"/);
  assert.match(portal, /<FullscreenButton className="fullscreen-button--portal"/);
  assert.match(control, /data-testid="fullscreen-toggle"/);
  assert.match(control, /全屏体验/);
  assert.match(control, /document\.exitFullscreen/);
});

test("reachable station UI contains no portrait or microphone workflow", () => {
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  const kiosk = readFileSync(new URL("../src/ArtworkKiosk.jsx", import.meta.url), "utf8");
  const config = readFileSync(new URL("../src/stations.js", import.meta.url), "utf8");
  const reachable = `${app}\n${kiosk}\n${config}`;
  assert.doesNotMatch(reachable, /facingMode:\s*["']user["']/);
  assert.doesNotMatch(reachable, /getUserMedia\(\{\s*audio:\s*true/);
  assert.doesNotMatch(reachable, /PhotoForge|beginMic|participantImage|storyChoices/);
  assert.match(reachable, /audio:\s*false/);
  assert.match(reachable, /overhead-a4-artwork/);
});
