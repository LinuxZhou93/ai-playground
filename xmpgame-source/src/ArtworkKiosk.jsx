import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, RefreshCw, ScanLine, Sparkles, WifiOff } from "lucide-react";
import { assetPath } from "./stations.js";
import { assetToDataUrl, createModelTask, fileToDataUrl, getModelStatus } from "./model-client.js";

const A4_LANDSCAPE = 1.4142;

function captureA4Frame(video) {
  if (!video?.videoWidth || !video?.videoHeight) return null;
  const visibleHeight = video.videoHeight * 0.78;
  const visibleWidth = Math.min(video.videoWidth * 0.9, visibleHeight * A4_LANDSCAPE);
  const sourceHeight = visibleWidth / A4_LANDSCAPE;
  const sourceX = (video.videoWidth - visibleWidth) / 2;
  const sourceY = (video.videoHeight - sourceHeight) / 2;
  const canvas = document.createElement("canvas");
  canvas.width = 1400;
  canvas.height = Math.round(canvas.width / A4_LANDSCAPE);
  canvas.getContext("2d").drawImage(
    video,
    sourceX,
    sourceY,
    visibleWidth,
    sourceHeight,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  return canvas.toDataURL("image/jpeg", 0.92);
}

function CameraScreen({ station, deviceMode, onArtwork }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const startedRef = useRef(false);
  const [cameraState, setCameraState] = useState("starting");
  const [notice, setNotice] = useState("");

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    setNotice("");
    setCameraState("starting");
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("CAMERA_UNSUPPORTED");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState("live");
    } catch {
      setCameraState("blocked");
      setNotice("俯拍摄像头没有连接，请老师检查摄像头权限后重试。 ");
    }
  }, [stopCamera]);

  useEffect(() => {
    if (startedRef.current) return undefined;
    startedRef.current = true;
    startCamera();
    return stopCamera;
  }, [startCamera, stopCamera]);

  const capture = () => {
    const artwork = captureA4Frame(videoRef.current);
    if (!artwork) return;
    stopCamera();
    onArtwork(artwork);
  };

  const chooseFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    stopCamera();
    onArtwork(await fileToDataUrl(file));
  };

  const useDemo = async () => {
    stopCamera();
    onArtwork(await assetToDataUrl(assetPath("assets/stations/demo-a4-fish-artwork.png")));
  };

  return (
    <main className="paper-kiosk paper-kiosk--camera" data-testid={`station-${station.id}-camera`}>
      <div className="paper-kiosk__ambient" style={{ backgroundImage: `url("${station.background}")` }} aria-hidden="true" />
      <header className="paper-kiosk__brand">
        <span>西马棚幼儿园</span>
        <i />
        <strong>{station.machine}</strong>
      </header>

      <section className="paper-camera">
        <div className="paper-camera__topline">
          <span><Camera aria-hidden="true" />俯拍画作</span>
          <em className={cameraState === "live" ? "is-ready" : ""}>{cameraState === "live" ? "画面已就绪" : "正在连接"}</em>
        </div>
        <div className="paper-camera__viewport">
          <video ref={videoRef} muted playsInline aria-label="A4 画纸俯拍画面" />
          <div className="paper-camera__a4" aria-hidden="true"><span>A4</span></div>
          <div className="paper-camera__beam" aria-hidden="true" />
          {cameraState !== "live" && (
            <div className="paper-camera__waiting">
              {cameraState === "blocked" ? <WifiOff aria-hidden="true" /> : <ScanLine aria-hidden="true" />}
              <span>{cameraState === "blocked" ? "镜头未连接" : "正在打开俯拍镜头"}</span>
            </div>
          )}
        </div>
        <p>把整张画纸平放在发光框内</p>
      </section>

      <section className="paper-kiosk__copy">
        <p className="paper-kiosk__recipe"><Sparkles aria-hidden="true" />固定 AI 配方 · {station.recipe.label}</p>
        <h1>{station.title}</h1>
        <p>{station.subtitle}</p>
        <div className="paper-kiosk__steps" aria-label="操作说明">
          <span><b>1</b>放好画纸</span>
          <i aria-hidden="true" />
          <span><b>2</b>轻触一次</span>
        </div>

        {notice && <div className="paper-kiosk__notice" role="status">{notice}</div>}

        {cameraState === "live" ? (
          <button className="paper-primary" type="button" onClick={capture} data-kiosk-primary data-testid="generate-artwork">
            <ScanLine aria-hidden="true" />
            <span><b>{station.action}</b><small>自动拍摄并生成，不需要再选择</small></span>
          </button>
        ) : (
          <button className="paper-primary" type="button" onClick={startCamera} data-kiosk-primary>
            <RefreshCw aria-hidden="true" />
            <span><b>重新连接俯拍镜头</b><small>请确认摄像头没有被其他程序占用</small></span>
          </button>
        )}

        {!deviceMode && (
          <div className="paper-kiosk__test-tools" aria-label="教师测试工具">
            <label><ImagePlus aria-hidden="true" />选择测试画作<input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseFile} /></label>
            <button type="button" onClick={useDemo}><Sparkles aria-hidden="true" />使用水彩鱼示例</button>
          </div>
        )}

        <p className="paper-kiosk__privacy">镜头固定朝下，只拍画纸，不拍孩子；不使用麦克风。</p>
      </section>
    </main>
  );
}

function CreatingScreen({ station, artwork, stage, vision }) {
  const stageText = stage === "vision"
    ? "正在读懂这幅画"
    : stage === "image"
      ? `正在执行“${station.recipe.label}”`
      : "正在连接 AI 创作引擎";
  return (
    <main className="paper-kiosk paper-kiosk--creating" data-testid={`station-${station.id}-creating`}>
      <div className="paper-kiosk__ambient" style={{ backgroundImage: `url("${station.background}")` }} aria-hidden="true" />
      <div className="creating-artwork" aria-hidden="true">
        <span className="creating-artwork__halo" />
        <img src={artwork} alt="" />
        <span className="creating-artwork__beam" />
      </div>
      <section className="creating-message" aria-live="polite">
        <p>{station.machine} · {station.recipe.label}</p>
        <h1>{stageText}</h1>
        <div className="creating-message__progress"><i /><i /><i /></div>
        <span>{vision?.title || station.recipe.summary}</span>
      </section>
    </main>
  );
}

function ResultScreen({ station, result, artwork, onNext, onRetry }) {
  const image = result?.result?.imageDataUrl || artwork;
  const failed = result?.aiGenerated === false;
  return (
    <main className={`paper-result${failed ? " is-fallback" : ""}`} data-testid={`station-${station.id}-result`}>
      <img className="paper-result__image" src={image} alt={failed ? "等待重新生成的儿童原画" : "由儿童原画生成的 AI 作品"} />
      <div className="paper-result__wash" aria-hidden="true" />
      <header className="paper-result__brand"><span>西马棚幼儿园</span><i />{station.machine}</header>
      <section className="paper-result__copy">
        <p>{failed ? "AI 创作暂未完成" : `AI 作品 · ${station.recipe.label}`}</p>
        <h1>{failed ? "网络恢复后，再试一次" : station.resultTitle}</h1>
        <span>{failed ? "原画没有丢失，可以直接重新生成。" : `基于原画生成 · ${result?.model || "图像模型"}`}</span>
      </section>
      <div className="paper-result__actions">
        {failed && <button type="button" className="paper-result__retry" onClick={onRetry}><RefreshCw aria-hidden="true" />重新生成</button>}
        <button type="button" className="paper-result__next" onClick={onNext} data-kiosk-primary>
          <Camera aria-hidden="true" />下一幅画
        </button>
      </div>
    </main>
  );
}

export function ArtworkKiosk({ station, health, deviceMode }) {
  const [phase, setPhase] = useState("camera");
  const [artwork, setArtwork] = useState(null);
  const [result, setResult] = useState(null);
  const [vision, setVision] = useState(null);
  const [stage, setStage] = useState("health");
  const [session, setSession] = useState(0);
  const controllerRef = useRef(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const localVision = useCallback(() => ({
    title: `正在寻找“${station.recipe.label}”最重要的画面线索`,
    elements: station.modelSignals,
    transformation: station.recipe.direction,
  }), [station]);

  const generate = useCallback(async (sourceArtwork) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setArtwork(sourceArtwork);
    setResult(null);
    setVision(localVision());
    setStage("health");
    setPhase("creating");

    try {
      const liveHealth = health.status === "ready" ? health : await getModelStatus();
      if (!liveHealth.capabilities?.image) throw new Error("IMAGE_MODEL_UNAVAILABLE");

      let interpreted = localVision();
      if (liveHealth.capabilities?.vision) {
        setStage("vision");
        try {
          const response = await createModelTask("interaction.interpret", {
            experience: station.experience,
            recipe: station.recipe,
            sourceImage: sourceArtwork,
            interactionSummary: { source: station.captureSource, preset: station.recipe.id },
          }, { signal: controller.signal, timeoutMs: 90000 });
          interpreted = response.result?.vision || interpreted;
          setVision(interpreted);
        } catch (error) {
          if (error?.name === "AbortError") throw error;
        }
      }

      setStage("image");
      const response = await createModelTask("image.edit", {
        experience: station.experience,
        artworkImage: sourceArtwork,
        modelVision: interpreted,
        recipe: station.recipe,
        theme: station.slug,
        fallback: { imageDataUrl: sourceArtwork },
      }, { signal: controller.signal, timeoutMs: 210000 });
      setResult(response);
      setPhase("result");
    } catch (error) {
      if (error?.name === "AbortError") return;
      setResult({ aiGenerated: false, errorCode: error.message, fallbackImage: sourceArtwork });
      setPhase("result");
    }
  }, [health, localVision, station]);

  const reset = () => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setArtwork(null);
    setResult(null);
    setVision(null);
    setPhase("camera");
    setSession((value) => value + 1);
  };

  if (phase === "creating") return <CreatingScreen station={station} artwork={artwork} stage={stage} vision={vision} />;
  if (phase === "result") return <ResultScreen station={station} result={result} artwork={artwork} onNext={reset} onRetry={() => generate(artwork)} />;
  return <CameraScreen key={session} station={station} deviceMode={deviceMode} onArtwork={generate} />;
}
