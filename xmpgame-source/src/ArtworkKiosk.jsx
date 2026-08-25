import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CircleCheckBig, ImagePlus, Mic, MicOff, Pointer, RefreshCw, Sparkles, WandSparkles, WifiOff } from "lucide-react";
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
  const recognitionRef = useRef(null);
  const voiceResultRef = useRef(false);
  const startedRef = useRef(false);
  const previewMode = new URLSearchParams(window.location.search).get("preview") === "1";
  const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;
  const voiceSupported = Boolean(SpeechRecognitionApi);
  const [cameraState, setCameraState] = useState("starting");
  const [voiceState, setVoiceState] = useState("idle");
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
      if (previewMode) {
        setCameraState("live");
        return;
      }
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
  }, [previewMode, stopCamera]);

  useEffect(() => {
    if (startedRef.current) return undefined;
    startedRef.current = true;
    startCamera();
    return () => {
      recognitionRef.current?.abort?.();
      recognitionRef.current = null;
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const readArtwork = async () => {
    if (previewMode) {
      return assetToDataUrl(assetPath("assets/stations/demo-a4-fish-artwork.png"));
    }
    return captureA4Frame(videoRef.current);
  };

  const capture = async () => {
    const artwork = await readArtwork();
    if (!artwork) return;
    stopCamera();
    onArtwork(artwork);
  };

  const startVoiceMagic = () => {
    if (!voiceSupported || cameraState !== "live" || voiceState !== "idle") return;
    recognitionRef.current?.abort?.();
    voiceResultRef.current = false;
    const recognition = new SpeechRecognitionApi();
    recognitionRef.current = recognition;
    recognition.lang = "zh-CN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      setVoiceState("listening");
      setNotice("我在听，说一句你希望画里发生的魔法吧！");
    };
    recognition.onresult = async (event) => {
      const voicePrompt = String(event.results?.[0]?.[0]?.transcript || "").trim().slice(0, 80);
      if (!voicePrompt) return;
      voiceResultRef.current = true;
      setVoiceState("processing");
      setNotice(`听见啦：“${voicePrompt}”——现在开始魔法！`);
      let artwork = null;
      try {
        artwork = await readArtwork();
      } catch {
        artwork = null;
      }
      if (!artwork) {
        setVoiceState("idle");
        setNotice("没有看清画纸，请把整张画放进彩虹框再试一次。");
        return;
      }
      stopCamera();
      recognition.stop?.();
      onArtwork(artwork, { voicePrompt });
    };
    recognition.onerror = (event) => {
      if (voiceResultRef.current || event.error === "aborted") return;
      setVoiceState("idle");
      setNotice(event.error === "not-allowed"
        ? "麦克风没有打开，请老师允许浏览器使用麦克风；也可以直接按橙色按钮。"
        : "刚才没有听清，再说一次吧；也可以直接按橙色按钮。");
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      if (!voiceResultRef.current) setVoiceState("idle");
    };
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setVoiceState("idle");
      setNotice("语音伙伴还没准备好，也可以直接按橙色按钮开始。");
    }
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
    <main className="kid-kiosk kid-kiosk--camera" data-testid={`station-${station.id}-camera`}>
      <div className="kid-kiosk__background" style={{ backgroundImage: `url("${assetPath("assets/cartoon/cartoon-ocean-background.webp")}")` }} aria-hidden="true" />
      <header className="kid-kiosk__brand">
        <span>西马棚幼儿园</span>
        <strong>{station.machine}</strong>
      </header>

      <section className="kid-camera">
        <div className="kid-camera__topline">
          <span><Camera aria-hidden="true" />画纸照相机</span>
          <em className={cameraState === "live" ? "is-ready" : ""}>
            {cameraState === "live" && <CircleCheckBig aria-hidden="true" />}
            {cameraState === "live" ? "准备好啦" : "正在连接"}
          </em>
        </div>
        <div className="kid-camera__frame">
          {previewMode
            ? <img src={assetPath("assets/stations/demo-a4-fish-artwork.png")} alt="A4 水彩鱼测试画作" />
            : <video ref={videoRef} muted playsInline aria-label="A4 画纸俯拍画面" />}
          <div className="kid-camera__guide" aria-hidden="true"><span>把画纸放这里</span></div>
          {cameraState !== "live" && (
            <div className="kid-camera__waiting">
              {cameraState === "blocked" ? <WifiOff aria-hidden="true" /> : <Camera aria-hidden="true" />}
              <span>{cameraState === "blocked" ? "镜头未连接" : "正在打开俯拍镜头"}</span>
            </div>
          )}
        </div>
        <p>把整张画纸放进彩虹框</p>
      </section>

      <section className="kid-kiosk__copy">
        <img className="kid-kiosk__mascot" src={station.mascot} alt="" aria-hidden="true" />
        <p className="kid-kiosk__recipe"><WandSparkles aria-hidden="true" />{station.shortName} · {station.recipe.label}</p>
        <h1 aria-label={station.kidTitle}>
          <span>{station.kidTitleLead}</span>
          <strong>{station.kidTitleAccent}</strong>
        </h1>
        <div className={`kid-kiosk__ready${cameraState === "live" ? " is-ready" : ""}`}>
          <CircleCheckBig aria-hidden="true" />
          <span>{cameraState === "live" ? "画纸放好，就可以开始啦" : "等镜头醒来一下"}</span>
        </div>

        {notice && <div className="kid-kiosk__notice" role="status">{notice}</div>}

        <div className="kid-kiosk__actions">
          {cameraState === "live" ? (
            <button className="kid-primary" type="button" onClick={capture} data-kiosk-primary data-testid="generate-artwork">
              <Pointer aria-hidden="true" />
              <span><b>{station.kidAction}</b><small>按一下就好，剩下的交给魔法</small></span>
            </button>
          ) : (
            <button className="kid-primary" type="button" onClick={startCamera} data-kiosk-primary>
              <RefreshCw aria-hidden="true" />
              <span><b>请老师帮我连接镜头</b><small>轻触这里，再试一次</small></span>
            </button>
          )}

          <button
            className={`kid-voice is-${voiceState}`}
            type="button"
            onClick={startVoiceMagic}
            disabled={cameraState !== "live" || !voiceSupported || voiceState !== "idle"}
            data-testid="voice-artwork-magic"
          >
            {voiceSupported ? <Mic aria-hidden="true" /> : <MicOff aria-hidden="true" />}
            <span>
              <b>{voiceState === "listening" ? "我在听，请说吧…" : voiceState === "processing" ? "听见啦，正在开始…" : voiceSupported ? "说一句魔法愿望" : "这台设备暂不支持语音"}</b>
              <small>{voiceSupported ? "说完自动拍下画纸并生成" : "仍可按上面的橙色按钮"}</small>
            </span>
          </button>
        </div>

        {!deviceMode && (
          <div className="kid-kiosk__test-tools" aria-label="教师测试工具">
            <label><ImagePlus aria-hidden="true" />选择测试画作<input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseFile} /></label>
            <button type="button" onClick={useDemo}><Sparkles aria-hidden="true" />使用水彩鱼示例</button>
          </div>
        )}

        <p className="kid-kiosk__privacy">只拍画纸，不拍小朋友 · 本系统不保存录音</p>
      </section>
    </main>
  );
}

function CreatingScreen({ station, artwork, stage, vision }) {
  const stageText = stage === "vision"
    ? "我在认真看你的画…"
    : stage === "image"
      ? "魔法正在发生…"
      : "叫醒魔法伙伴…";
  return (
    <main className="kid-kiosk kid-kiosk--creating" data-testid={`station-${station.id}-creating`}>
      <div className="kid-kiosk__background" style={{ backgroundImage: `url("${assetPath("assets/cartoon/cartoon-ocean-background.webp")}")` }} aria-hidden="true" />
      <header className="kid-kiosk__brand"><span>西马棚幼儿园</span><strong>{station.machine}</strong></header>
      <div className="kid-creating__artwork" aria-hidden="true">
        <img src={artwork} alt="" />
      </div>
      <img className="kid-creating__mascot" src={station.mascot} alt="" aria-hidden="true" />
      <section className="kid-creating__message" aria-live="polite">
        <p><WandSparkles aria-hidden="true" />{station.recipe.label}</p>
        <h1>{stageText}</h1>
        <span>{vision?.title || "每一根线条都很重要，我会好好保留它"}</span>
        <div className="kid-creating__progress" aria-hidden="true"><i /></div>
      </section>
    </main>
  );
}

function ResultScreen({ station, result, artwork, onNext, onRetry }) {
  const image = result?.result?.imageDataUrl || artwork;
  const failed = result?.aiGenerated === false;
  return (
    <main className={`kid-result${failed ? " is-fallback" : ""}`} data-testid={`station-${station.id}-result`}>
      <div className="kid-kiosk__background" style={{ backgroundImage: `url("${assetPath("assets/cartoon/cartoon-ocean-background.webp")}")` }} aria-hidden="true" />
      <header className="kid-kiosk__brand"><span>西马棚幼儿园</span><strong>{station.machine}</strong></header>
      <section className="kid-result__stage">
        <img className="kid-result__image" src={image} alt={failed ? "等待重新生成的儿童原画" : "由儿童原画生成的 AI 作品"} />
      </section>
      <img className="kid-result__mascot" src={station.mascot} alt="" aria-hidden="true" />
      <section className="kid-result__copy">
        <p><Sparkles aria-hidden="true" />{failed ? "魔法打了个小喷嚏" : `魔法成功 · ${station.recipe.label}`}</p>
        <h1>{failed ? "我们再试一次吧！" : station.resultTitle}</h1>
        <span>{failed ? "你的原画好好地在这里，没有丢。" : "这是从你的原画里长出来的新世界！"}</span>
      </section>
      <div className="kid-result__actions">
        {failed && <button type="button" className="kid-result__retry" onClick={onRetry} data-testid="retry-generation"><RefreshCw aria-hidden="true" />再试一次</button>}
        <button type="button" className="kid-result__next" onClick={onNext} data-kiosk-primary data-testid="next-artwork">
          <Camera aria-hidden="true" />下一张小画
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
  const [voicePrompt, setVoicePrompt] = useState("");
  const [session, setSession] = useState(0);
  const controllerRef = useRef(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const localVision = useCallback(() => ({
    title: `正在寻找“${station.recipe.label}”最重要的画面线索`,
    elements: station.modelSignals,
    transformation: station.recipe.direction,
  }), [station]);

  const generate = useCallback(async (sourceArtwork, options = {}) => {
    const nextVoicePrompt = typeof options === "string" ? options : String(options.voicePrompt || "").trim().slice(0, 80);
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setArtwork(sourceArtwork);
    setResult(null);
    setVision(localVision());
    setVoicePrompt(nextVoicePrompt);
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
            voicePrompt: nextVoicePrompt,
            interactionSummary: { source: station.captureSource, preset: station.recipe.id, voiceMagic: Boolean(nextVoicePrompt) },
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
        voicePrompt: nextVoicePrompt,
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
    setVoicePrompt("");
    setPhase("camera");
    setSession((value) => value + 1);
  };

  if (phase === "creating") return <CreatingScreen station={station} artwork={artwork} stage={stage} vision={vision} />;
  if (phase === "result") return <ResultScreen station={station} result={result} artwork={artwork} onNext={reset} onRetry={() => generate(artwork, voicePrompt)} />;
  return <CameraScreen key={session} station={station} deviceMode={deviceMode} onArtwork={generate} />;
}
