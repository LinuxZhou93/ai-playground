import crypto from "node:crypto";

const IMAGE_MODEL = "wan2.7-image-pro";
const VIDEO_MODEL = "wan2.7-i2v-2026-04-25";
const VISION_MODEL = "qwen3-vl-plus";
const TEXT_MODELS = ["qwen3.7-max", "qwen-plus", "qwen-turbo"];
const DASHSCOPE_BASE = "https://dashscope.aliyuncs.com/api/v1";
const OPENAI_BASE = "https://api.openai.com/v1";
const OPENAI_VISION_MODEL = "gpt-5.6-terra";
const OPENAI_IMAGE_MODEL = "gpt-image-2";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_VISION_MODEL = "gemini-3.1-pro-preview";
const GEMINI_IMAGE_MODEL = "gemini-3-pro-image-preview";
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const JOB_TTL_MS = 30 * 60 * 1000;

export class ModelServiceError extends Error {
  constructor(code, message, httpStatus = 502) {
    super(message || code);
    this.name = "ModelServiceError";
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function safeText(value, max = 1200) {
  return String(value || "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
}

function dataUrlToBuffer(value) {
  const match = String(value || "").match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new ModelServiceError("INVALID_IMAGE_DATA", "图片必须是 JPEG、PNG 或 WebP Data URL", 400);
  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) {
    throw new ModelServiceError("IMAGE_SIZE_LIMIT", "单张图片需小于 20MB", 413);
  }
  return { buffer, mimeType: match[1], extension: match[1].split("/")[1].replace("jpeg", "jpg") };
}

function responseError(body, fallback = "MODEL_REQUEST_FAILED") {
  return {
    code: body?.code || body?.error?.code || fallback,
    message: safeText(body?.message || body?.error?.message || fallback, 240)
  };
}

function isArtworkExperience(experience) {
  return String(experience || "").startsWith("artwork-") || experience === "star-canvas";
}

function buildImagePrompt(payload) {
  if (!isArtworkExperience(payload.experience)) {
    throw new ModelServiceError("ARTWORK_EXPERIENCE_REQUIRED", "当前装置只接受俯拍儿童画作", 400);
  }
  const recipe = payload.recipe || {};
  const visionRule = payload.modelVision
    ? `多模态视觉模型已经观察到：${safeText(JSON.stringify(payload.modelVision), 620)}。把这些观察落实到主体、构图、材质、动作与光线中，不要只做文字联想。`
    : "";
  const recipeRule = safeText(recipe.direction, 520) || "保留原画，建立完整的沉浸式世界。";
  return `图像1是孩子放在俯拍台下的真实 A4 原画，不是人物照片。当前固定生成配方是“${safeText(recipe.label, 40)}”：${recipeRule}${visionRule}

绝对保真规则：忠实保持原画中关键主体的不规则轮廓、线条粗细、儿童水彩/蜡笔/马克笔笔触、颜色关系、比例、朝向和可爱的不完美；不要替孩子纠正透视、改造角色、磨平笔触或套用统一卡通模板。去除白纸、桌面、灯光反射、阴影、扫描框和相机背景。不要凭空复制主要角色，主要角色只出现一次。

成品质感：16:9 横向、电影级空间调度、真实前中后景、同方向环境光、体积光、材质反光、空气或水体颗粒和细致遮挡；达到世界级沉浸式数字艺术展览与高端动画概念设计水准，但环境必须从这幅原画的颜色、构图与想象自然生长。禁止简笔画风、纸艺拼贴、扁平插画、廉价游戏 UI、圆形头像、贴纸、相框、文字和品牌。画面不得出现真实儿童或成人肖像，不做人脸生成。3-6岁儿童友好，喜悦、惊奇、无恐怖和危险元素，允许平台保留规范 AI 水印。`;
}

function buildInteractionPrompt(payload) {
  if (!isArtworkExperience(payload.experience)) {
    throw new ModelServiceError("ARTWORK_EXPERIENCE_REQUIRED", "当前视觉理解只接受俯拍儿童画作", 400);
  }
  const recipe = payload.recipe || {};
  return `你是西马棚幼儿园的多模态原画导演。图像1是俯拍得到的 A4 儿童原画，不是人像。当前固定生成配方是“${safeText(recipe.label, 40)}”：${safeText(recipe.direction, 520)}

请真正观察原画，不要猜测：找出关键主体或完整场景，描述真实轮廓、朝向、颜色、笔触、空间关系和正在发生的事件；为这个固定配方挑出三个能在最终图像中明确呈现的视觉要素。不要识别人脸、作者身份、情绪、健康或能力，不评价画得好不好，不纠正儿童画，不要求任何额外选择。

请输出严格 JSON，不要 Markdown：{"title":"不超过18个汉字的儿童友好发现","subject":"不超过24字的关键主体或场景","movement":"不超过32字的自然动作或事件","elements":["三个不超过18字且能实际生成的视觉要素"],"transformation":"不超过60字，说明如何忠实保留原画并执行固定配方","palette":["三个来自原画的颜色或光感词"]}。elements 必须恰好3项。`;
}

function parseInteractionVision(text, payload = {}) {
  const fallbacks = {
    "artwork-awakening": ["原画角色保持真实笔触", "动作符合角色类型", "环境长出适合它的家园"],
    "artwork-sculpture": ["完整保留奇物轮廓", "原画配色转成真实材质", "灯光呈现立体尺度"],
    "artwork-world": ["原画空间关系保持不变", "道路和边缘连续生长", "远景形成完整地形天气"],
    "artwork-cinema": ["主要角色与道具保持一致", "事件形成清晰叙事焦点", "镜头光影具有电影张力"],
    "star-canvas": ["原画角色保持真实笔触", "动作符合角色类型", "环境长出适合它的家园"],
  };
  let parsed = {};
  try {
    const match = String(text || "").match(/\{[\s\S]*\}/);
    if (match) parsed = JSON.parse(match[0]);
  } catch {
    parsed = {};
  }
  const fallbackElements = fallbacks[payload.experience] || fallbacks["star-canvas"];
  const elements = Array.isArray(parsed.elements)
    ? parsed.elements.map((item) => safeText(item, 32)).filter(Boolean).slice(0, 3)
    : [];
  while (elements.length < 3) elements.push(fallbackElements[elements.length]);
  const palette = Array.isArray(parsed.palette)
    ? parsed.palette.map((item) => safeText(item, 20)).filter(Boolean).slice(0, 3)
    : [];
  return {
    title: safeText(parsed.title, 36) || "AI 看见了纸上的想象",
    subject: safeText(parsed.subject, 48) || "保留真实儿童笔触的关键画面",
    movement: safeText(parsed.movement, 72) || "沿原画正在发生的事件自然展开。",
    elements,
    transformation: safeText(parsed.transformation, 130) || safeText(payload.recipe?.direction, 130) || "保留原画笔触，让画面进入有纵深的完整世界。",
    palette,
  };
}

function buildSoundPrompt(payload) {
  const profile = {
    average: Number(payload.profile?.average || 0).toFixed(2),
    peak: Number(payload.profile?.peak || 0).toFixed(2),
    band: safeText(payload.profile?.band, 24),
    gestures: Array.isArray(payload.profile?.gestures) ? payload.profile.gestures.map((item) => safeText(item, 24)).slice(0, 8) : []
  };
  return `你是西马棚幼儿园“声音魔法森林”的儿童叙事伙伴。根据这组匿名声音特征写两句中文庆祝语：${JSON.stringify(profile)}。第一句描述森林如何回应声音，第二句鼓励轻声、大声、长音和节奏都有价值。不要评分，不推断情绪、身份、健康或能力，不使用“识别到孩子”。总计不超过70个汉字，只输出正文。`;
}

function buildStoryPrompt(payload) {
  const story = payload.story || {};
  return `你是西马棚幼儿园儿童电影编剧。把以下全班共同选择改写成一段80字以内、适合3-6岁、积极安全、画面感强的中文电影旁白：${JSON.stringify({
    hero: safeText(story.hero, 60),
    place: safeText(story.place, 80),
    mission: safeText(story.mission, 100),
    ending: safeText(story.ending, 100)
  })}。保留孩子的选择，不评分，不加入危险动作，不出现品牌与真实姓名。只输出旁白正文。`;
}

function buildVideoPrompt(payload) {
  const story = payload.story || {};
  const narration = safeText(payload.narration || story.narration, 360);
  const identity = payload.participantImage
    ? "首帧是已获授权的本轮小主角；保持人物身份、脸部、年龄、发型与服装稳定，"
    : "主角使用非写实纸艺角色，不生成可识别的真实儿童，";
  const visionRule = payload.modelVision ? `多模态世界导演的镜头理解：${safeText(JSON.stringify(payload.modelVision), 420)}。` : "";
  const remixRule = payload.remixDirection ? `这是同一部电影的另一个连续结局，保持同一个孩子、服装、世界和镜头语言，只重拍：${safeText(payload.remixDirection, 320)}。` : "";
  return `世界级沉浸式自然幻想儿童电影，深海军蓝、晶蓝与少量紫金的电影级体积光。${identity}${visionRule}${remixRule}小主角以完整身体自然站在发光地面上，光蝶和生命粒子从手边苏醒，巨大的粒子鲸鱼在远处缓慢游过，发光森林与晶体河流产生真实空间纵深。镜头先轻微环绕孩子，再沿光河缓慢向后拉开；动作自然、克制、连续，人物脸部和身体稳定，不突然变形，不切换角色。故事：${narration || `${safeText(story.hero, 60)}在${safeText(story.place, 80)}完成${safeText(story.mission, 100)}，最后${safeText(story.ending, 100)}`}。高级数字艺术展览质感，不使用简笔画、纸艺、卡通描边、扁平插画、头像贴纸或游戏 UI。3-6岁儿童安全、喜悦、无文字、无畸形、无危险动作。`;
}

class OssTemporaryStore {
  constructor(env) {
    this.accessKeyId = env.OSS_ACCESS_KEY_ID || "";
    this.accessKeySecret = env.OSS_ACCESS_KEY_SECRET || "";
    this.bucket = env.OSS_BUCKET || "";
    this.endpoint = String(env.OSS_ENDPOINT || "oss-cn-beijing.aliyuncs.com").replace(/^https?:\/\//, "").replace(/\/$/, "");
  }

  get configured() {
    return Boolean(this.accessKeyId && this.accessKeySecret && this.bucket && this.endpoint);
  }

  canonical(key) {
    return `/${this.bucket}/${key}`;
  }

  objectUrl(key) {
    return `https://${this.bucket}.${this.endpoint}/${key}`;
  }

  authorization(method, date, key, contentType = "") {
    const value = `${method}\n\n${contentType}\n${date}\n${this.canonical(key)}`;
    const signature = crypto.createHmac("sha1", this.accessKeySecret).update(value).digest("base64");
    return `OSS ${this.accessKeyId}:${signature}`;
  }

  async put(image, prefix = "xmp-session") {
    if (!this.configured) throw new ModelServiceError("OSS_NOT_CONFIGURED", "模型临时存储未配置", 503);
    const key = `${prefix}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${image.extension}`;
    const date = new Date().toUTCString();
    const response = await fetch(this.objectUrl(key), {
      method: "PUT",
      headers: {
        Date: date,
        "Content-Type": image.mimeType,
        Authorization: this.authorization("PUT", date, key, image.mimeType)
      },
      body: image.buffer
    });
    if (!response.ok) throw new ModelServiceError("OSS_UPLOAD_FAILED", `临时图片上传失败 (${response.status})`);
    return key;
  }

  signedGetUrl(key, lifetimeSeconds = 10800) {
    const expires = Math.floor(Date.now() / 1000) + lifetimeSeconds;
    const value = `GET\n\n\n${expires}\n${this.canonical(key)}`;
    const signature = crypto.createHmac("sha1", this.accessKeySecret).update(value).digest("base64");
    const query = new URLSearchParams({
      OSSAccessKeyId: this.accessKeyId,
      Expires: String(expires),
      Signature: signature
    });
    return `${this.objectUrl(key)}?${query}`;
  }

  async remove(key) {
    if (!key) return;
    const date = new Date().toUTCString();
    await fetch(this.objectUrl(key), {
      method: "DELETE",
      headers: { Date: date, Authorization: this.authorization("DELETE", date, key) }
    }).catch(() => {});
  }
}

class DashScopeProvider {
  constructor(env, store) {
    this.apiKey = env.DASHSCOPE_API_KEY || "";
    this.base = String(env.DASHSCOPE_BASE_URL || DASHSCOPE_BASE).replace(/\/$/, "");
    this.imageModel = env.DASHSCOPE_IMAGE_MODEL || IMAGE_MODEL;
    this.videoModel = env.DASHSCOPE_VIDEO_MODEL || VIDEO_MODEL;
    this.visionModel = env.DASHSCOPE_VISION_MODEL || VISION_MODEL;
    this.textModels = unique([env.DASHSCOPE_TEXT_MODEL, ...TEXT_MODELS]);
    this.store = store;
  }

  get configured() {
    return Boolean(this.apiKey);
  }

  async available() {
    if (!this.configured) return false;
    try {
      const response = await fetch(`${this.base}/services/aigc/text-generation/generation`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          model: this.textModels.at(-1),
          input: { messages: [{ role: "user", content: "只回答：好" }] },
          parameters: { result_format: "message", max_tokens: 1 }
        })
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  headers(extra = {}) {
    return { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json", ...extra };
  }

  async text(prompt, maxTokens = 260) {
    if (!this.configured) throw new ModelServiceError("DASHSCOPE_NOT_CONFIGURED", "DashScope 模型密钥未配置", 503);
    let lastError;
    for (const model of this.textModels) {
      const response = await fetch(`${this.base}/services/aigc/text-generation/generation`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          model,
          input: { messages: [{ role: "user", content: prompt }] },
          parameters: { result_format: "message", max_tokens: maxTokens, temperature: 0.6 }
        })
      });
      const body = await response.json().catch(() => ({}));
      if (response.ok) {
        const output = body.output?.choices?.[0]?.message?.content || body.output?.text;
        if (output) return { text: safeText(output, 1200), model, requestId: body.request_id };
      }
      lastError = responseError(body);
      if (!["InvalidModel", "ModelNotFound", "InvalidParameter", "InvalidEndpointOrModel.NotFound"].includes(lastError.code)) break;
    }
    throw new ModelServiceError(lastError?.code || "TEXT_MODEL_FAILED", lastError?.message || "文本模型调用失败");
  }

  async image(payload) {
    if (!this.configured || !this.store.configured) throw new ModelServiceError("IMAGE_MODEL_NOT_CONFIGURED", "图像模型或临时存储未配置", 503);
    const inputs = [];
    if (payload.artworkImage) inputs.push(dataUrlToBuffer(payload.artworkImage));
    if (payload.participantImage) inputs.push(dataUrlToBuffer(payload.participantImage));
    if (payload.sourceImage) inputs.push(dataUrlToBuffer(payload.sourceImage));
    if (payload.interactionImage) inputs.push(dataUrlToBuffer(payload.interactionImage));
    if (!inputs.length) throw new ModelServiceError("IMAGE_INPUT_REQUIRED", "至少需要一张输入图片", 400);
    const keys = [];
    try {
      for (const image of inputs) keys.push(await this.store.put(image));
      const content = keys.map((key) => ({ image: this.store.signedGetUrl(key, 1800) }));
      content.push({ text: buildImagePrompt(payload) });
      const response = await fetch(`${this.base}/services/aigc/multimodal-generation/generation`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          model: this.imageModel,
          input: { messages: [{ role: "user", content }] },
          parameters: { size: "1K", n: 1, watermark: true }
        })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = responseError(body, "IMAGE_MODEL_FAILED");
        throw new ModelServiceError(error.code, error.message);
      }
      const items = body.output?.choices?.[0]?.message?.content || [];
      const imageUrl = items.find((item) => item.image)?.image || body.output?.results?.[0]?.url;
      if (!imageUrl) throw new ModelServiceError("IMAGE_RESULT_MISSING", "图像模型未返回结果");
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) throw new ModelServiceError("IMAGE_DOWNLOAD_FAILED", "生成图片下载失败");
      const mimeType = imageResponse.headers.get("content-type")?.split(";")[0] || "image/png";
      const buffer = Buffer.from(await imageResponse.arrayBuffer());
      return {
        model: this.imageModel,
        requestId: body.request_id,
        imageDataUrl: `data:${mimeType};base64,${buffer.toString("base64")}`,
        bytes: buffer.length
      };
    } finally {
      await Promise.all(keys.map((key) => this.store.remove(key)));
    }
  }

  async vision(payload) {
    if (!this.configured || !this.store.configured) throw new ModelServiceError("VISION_MODEL_NOT_CONFIGURED", "视觉理解模型或临时存储未配置", 503);
    const inputs = [];
    if (payload.sourceImage) inputs.push(dataUrlToBuffer(payload.sourceImage));
    if (payload.interactionImage) inputs.push(dataUrlToBuffer(payload.interactionImage));
    if (!inputs.length) throw new ModelServiceError("VISION_INPUT_REQUIRED", "视觉理解至少需要一张输入图片", 400);
    const keys = [];
    try {
      for (const image of inputs) keys.push(await this.store.put(image, "xmp-vision"));
      const content = keys.map((key) => ({ image: this.store.signedGetUrl(key, 1800) }));
      content.push({ text: buildInteractionPrompt(payload) });
      const response = await fetch(`${this.base}/services/aigc/multimodal-generation/generation`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          model: this.visionModel,
          input: { messages: [{ role: "user", content }] },
          parameters: { max_tokens: 360, temperature: 0.25, enable_thinking: false }
        })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = responseError(body, "VISION_MODEL_FAILED");
        throw new ModelServiceError(error.code, error.message);
      }
      const raw = body.output?.choices?.[0]?.message?.content;
      const text = Array.isArray(raw) ? raw.map((item) => item?.text || "").join(" ") : raw || body.output?.text;
      if (!text) throw new ModelServiceError("VISION_RESULT_MISSING", "视觉理解模型未返回结果");
      return {
        model: this.visionModel,
        requestId: body.request_id,
        text: safeText(text, 1400),
        vision: parseInteractionVision(text, payload)
      };
    } finally {
      await Promise.all(keys.map((key) => this.store.remove(key)));
    }
  }

  async startVideo(payload) {
    if (!this.configured) throw new ModelServiceError("VIDEO_MODEL_NOT_CONFIGURED", "视频模型密钥未配置", 503);
    const temporaryKeys = [];
    const media = [];
    const firstFrame = payload.sourceImage || payload.participantImage;
    if (firstFrame) {
      if (!this.store.configured) throw new ModelServiceError("OSS_NOT_CONFIGURED", "视频临时存储未配置", 503);
      const key = await this.store.put(dataUrlToBuffer(firstFrame));
      temporaryKeys.push(key);
      media.push({ type: "first_frame", url: this.store.signedGetUrl(key, 10800) });
    }
    const model = media.length ? this.videoModel : "wan2.7-t2v-2026-06-12";
    const endpoint = media.length
      ? `${this.base}/services/aigc/video-generation/video-synthesis`
      : `${this.base}/services/aigc/video-generation/video-synthesis`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: this.headers({ "X-DashScope-Async": "enable" }),
      body: JSON.stringify({
        model,
        input: { prompt: buildVideoPrompt(payload), ...(media.length ? { media } : {}) },
        parameters: { resolution: "720P", duration: 5, prompt_extend: true, watermark: true }
      })
    });
    const body = await response.json().catch(() => ({}));
    const providerTaskId = body.output?.task_id;
    if (!response.ok || !providerTaskId) {
      await Promise.all(temporaryKeys.map((key) => this.store.remove(key)));
      const error = responseError(body, "VIDEO_MODEL_FAILED");
      throw new ModelServiceError(error.code, error.message);
    }
    return { providerTaskId, temporaryKeys, model, requestId: body.request_id };
  }

  async pollVideo(taskId) {
    const response = await fetch(`${this.base}/tasks/${encodeURIComponent(taskId)}`, { headers: this.headers() });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = responseError(body, "VIDEO_POLL_FAILED");
      throw new ModelServiceError(error.code, error.message);
    }
    return {
      providerStatus: body.output?.task_status,
      videoUrl: body.output?.video_url,
      errorCode: body.code,
      errorMessage: body.message,
      requestId: body.request_id
    };
  }
}

class OpenAIProvider {
  constructor(env) {
    this.apiKey = env.OPENAI_API_KEY || "";
    this.base = String(env.OPENAI_BASE_URL || OPENAI_BASE).replace(/\/$/, "");
    this.visionModel = env.OPENAI_VISION_MODEL || OPENAI_VISION_MODEL;
    this.imageModel = env.OPENAI_IMAGE_MODEL || OPENAI_IMAGE_MODEL;
  }

  get configured() {
    return Boolean(this.apiKey);
  }

  async available() {
    if (!this.configured) return false;
    try {
      const response = await fetch(`${this.base}/models`, { headers: this.headers() });
      return response.ok;
    } catch {
      return false;
    }
  }

  headers() {
    return { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" };
  }

  async vision(payload) {
    if (!this.configured) throw new ModelServiceError("OPENAI_NOT_CONFIGURED", "OpenAI 模型密钥未配置", 503);
    const images = [payload.sourceImage, payload.interactionImage].filter(Boolean);
    if (!images.length) throw new ModelServiceError("VISION_INPUT_REQUIRED", "视觉理解至少需要一张输入图片", 400);
    images.forEach((image) => dataUrlToBuffer(image));
    const content = [
      { type: "input_text", text: buildInteractionPrompt(payload) },
      ...images.map((imageUrl) => ({ type: "input_image", image_url: imageUrl, detail: "high" }))
    ];
    const response = await fetch(`${this.base}/responses`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        model: this.visionModel,
        input: [{ role: "user", content }],
        reasoning: { effort: "low" },
        max_output_tokens: 1200
      })
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = responseError(body, "OPENAI_VISION_FAILED");
      throw new ModelServiceError(error.code, error.message, response.status >= 400 && response.status < 500 ? response.status : 502);
    }
    const text = body.output_text || (body.output || [])
      .filter((item) => item?.type === "message")
      .flatMap((item) => item.content || [])
      .filter((item) => item?.type === "output_text")
      .map((item) => item.text || "")
      .join(" ");
    if (!text) throw new ModelServiceError("OPENAI_VISION_RESULT_MISSING", "OpenAI 视觉模型未返回结果");
    return {
      provider: "openai",
      model: this.visionModel,
      requestId: body.id,
      text: safeText(text, 1400),
      vision: parseInteractionVision(text, payload)
    };
  }

  async image(payload) {
    if (!this.configured) throw new ModelServiceError("OPENAI_NOT_CONFIGURED", "OpenAI 模型密钥未配置", 503);
    const images = [payload.artworkImage, payload.participantImage, payload.sourceImage, payload.interactionImage]
      .filter(Boolean)
      .map((image) => dataUrlToBuffer(image));
    if (!images.length) throw new ModelServiceError("IMAGE_INPUT_REQUIRED", "至少需要一张输入图片", 400);
    const form = new FormData();
    form.append("model", this.imageModel);
    form.append("prompt", buildImagePrompt(payload));
    form.append("size", "1536x1024");
    form.append("quality", "medium");
    form.append("output_format", "webp");
    form.append("output_compression", "88");
    images.forEach((image, index) => {
      form.append("image[]", new Blob([image.buffer], { type: image.mimeType }), `reference-${index + 1}.${image.extension}`);
    });
    const response = await fetch(`${this.base}/images/edits`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}` },
      body: form
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = responseError(body, "OPENAI_IMAGE_FAILED");
      throw new ModelServiceError(error.code, error.message, response.status >= 400 && response.status < 500 ? response.status : 502);
    }
    const base64 = body.data?.[0]?.b64_json;
    if (!base64) throw new ModelServiceError("OPENAI_IMAGE_RESULT_MISSING", "GPT Image 2 未返回图片");
    const buffer = Buffer.from(base64, "base64");
    return {
      provider: "openai",
      model: this.imageModel,
      requestId: body.id || response.headers.get("x-request-id"),
      imageDataUrl: `data:image/webp;base64,${base64}`,
      bytes: buffer.length
    };
  }
}

class GeminiProvider {
  constructor(env) {
    this.apiKey = env.GOOGLE_API_KEY || env.GEMINI_API_KEY || "";
    this.base = String(env.GEMINI_BASE_URL || GEMINI_BASE).replace(/\/$/, "");
    this.visionModel = env.GEMINI_VISION_MODEL || GEMINI_VISION_MODEL;
    this.imageModel = env.GEMINI_IMAGE_MODEL || GEMINI_IMAGE_MODEL;
  }

  get configured() {
    return Boolean(this.apiKey);
  }

  async available() {
    if (!this.configured) return false;
    try {
      const response = await fetch(`${this.base}/models`, { headers: { "x-goog-api-key": this.apiKey } });
      return response.ok;
    } catch {
      return false;
    }
  }

  imageParts(payload, fields) {
    return fields
      .map((field) => payload[field])
      .filter(Boolean)
      .map((value) => dataUrlToBuffer(value))
      .map((image) => ({ inline_data: { mime_type: image.mimeType, data: image.buffer.toString("base64") } }));
  }

  async generate(model, parts, generationConfig) {
    const response = await fetch(`${this.base}/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": this.apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts }], generationConfig })
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = responseError(body, "GEMINI_MODEL_FAILED");
      throw new ModelServiceError(String(error.code), error.message, response.status >= 400 && response.status < 500 ? response.status : 502);
    }
    return { body, requestId: response.headers.get("x-request-id") };
  }

  async vision(payload) {
    if (!this.configured) throw new ModelServiceError("GEMINI_NOT_CONFIGURED", "Gemini 模型密钥未配置", 503);
    const images = this.imageParts(payload, ["sourceImage", "interactionImage"]);
    if (!images.length) throw new ModelServiceError("VISION_INPUT_REQUIRED", "视觉理解至少需要一张输入图片", 400);
    const { body, requestId } = await this.generate(
      this.visionModel,
      [...images, { text: buildInteractionPrompt(payload) }],
      { responseMimeType: "application/json", maxOutputTokens: 1200 }
    );
    const text = body.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join(" ").trim();
    if (!text) throw new ModelServiceError("GEMINI_VISION_RESULT_MISSING", "Gemini 视觉模型未返回结果");
    return {
      provider: "google-gemini",
      model: this.visionModel,
      requestId,
      text: safeText(text, 1400),
      vision: parseInteractionVision(text, payload)
    };
  }

  async image(payload) {
    if (!this.configured) throw new ModelServiceError("GEMINI_NOT_CONFIGURED", "Gemini 模型密钥未配置", 503);
    const images = this.imageParts(payload, ["artworkImage", "participantImage", "sourceImage", "interactionImage"]);
    if (!images.length) throw new ModelServiceError("IMAGE_INPUT_REQUIRED", "至少需要一张输入图片", 400);
    const { body, requestId } = await this.generate(
      this.imageModel,
      [...images, { text: buildImagePrompt(payload) }],
      { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "16:9", imageSize: "1K" } }
    );
    const parts = body.candidates?.[0]?.content?.parts || [];
    const image = parts.map((part) => part.inlineData || part.inline_data).find((item) => item?.data);
    if (!image?.data) throw new ModelServiceError("GEMINI_IMAGE_RESULT_MISSING", "Gemini 图像模型未返回图片");
    const mimeType = image.mimeType || image.mime_type || "image/png";
    const buffer = Buffer.from(image.data, "base64");
    return {
      provider: "google-gemini",
      model: this.imageModel,
      requestId,
      imageDataUrl: `data:${mimeType};base64,${image.data}`,
      bytes: buffer.length
    };
  }
}

function canFailoverVisualTask(error) {
  if (!(error instanceof ModelServiceError)) return false;
  return !["INVALID_IMAGE_DATA", "IMAGE_SIZE_LIMIT", "IMAGE_INPUT_REQUIRED", "VISION_INPUT_REQUIRED"].includes(String(error.code));
}

export class ModelService {
  constructor(env = process.env) {
    this.store = new OssTemporaryStore(env);
    this.provider = new DashScopeProvider(env, this.store);
    this.openai = new OpenAIProvider(env);
    this.gemini = new GeminiProvider(env);
    this.statusCache = null;
    this.jobs = new Map();
    this.cleanupTimer = setInterval(() => this.cleanupExpired(), 60_000);
    this.cleanupTimer.unref?.();
  }

  async getAccessStatus() {
    if (this.statusCache?.expiresAt > Date.now()) return this.statusCache;
    const [aliyun, openai, gemini] = await Promise.all([
      this.provider.available(),
      this.openai.available(),
      this.gemini.available()
    ]);
    this.statusCache = { aliyun, openai, gemini, expiresAt: Date.now() + 5 * 60_000 };
    return this.statusCache;
  }

  async getStatus() {
    const access = await this.getAccessStatus();
    const text = access.aliyun;
    const aliyunMedia = access.aliyun && this.store.configured;
    const artworkMedia = access.openai || access.gemini || aliyunMedia;
    const configured = this.provider.configured || this.openai.configured || this.gemini.configured;
    const media = aliyunMedia || artworkMedia;
    return {
      status: artworkMedia ? "ready" : configured ? "credential_blocked" : "not_configured",
      provider: artworkMedia && text ? "multi-provider" : access.openai ? "openai" : access.gemini ? "google-gemini" : text ? "aliyun-model-studio" : null,
      capabilities: { text, vision: media, image: media, video: aliyunMedia },
      models: {
        text: text ? this.provider.textModels[0] : null,
        vision: access.openai ? this.openai.visionModel : access.gemini ? this.gemini.visionModel : aliyunMedia ? this.provider.visionModel : null,
        image: access.openai ? this.openai.imageModel : access.gemini ? this.gemini.imageModel : aliyunMedia ? this.provider.imageModel : null,
        video: aliyunMedia ? this.provider.videoModel : null
      },
      routes: artworkMedia ? Object.fromEntries([
        "artwork-awakening",
        "artwork-sculpture",
        "artwork-world",
        "artwork-cinema",
      ].map((experience) => [experience, {
        input: "overhead-a4-artwork",
        output: "single-generated-image",
        vision: unique([access.openai && this.openai.visionModel, access.gemini && this.gemini.visionModel, aliyunMedia && this.provider.visionModel]),
        image: unique([access.openai && this.openai.imageModel, access.gemini && this.gemini.imageModel, aliyunMedia && this.provider.imageModel])
      }])) : {},
      configuredProviders: unique([
        this.openai.configured && "openai",
        this.gemini.configured && "google-gemini",
        this.provider.configured && "aliyun-model-studio"
      ]),
      privacy: {
        browserKey: false,
        temporaryPrivateObject: aliyunMedia,
        inputObjectDeletedAfterTask: true,
        generatedMediaMemoryTtlMinutes: 30
      }
    };
  }

  async runVisualTask(type, payload) {
    const isArtwork = isArtworkExperience(payload.experience);
    if (isArtwork) {
      for (const candidate of [this.openai, this.gemini]) {
        if (!candidate.configured) continue;
        try {
          return await candidate[type](payload);
        } catch (error) {
          if (!canFailoverVisualTask(error)) throw error;
        }
      }
    }
    const result = await this.provider[type](payload);
    return { ...result, provider: "aliyun-model-studio" };
  }

  async create(kind, payload = {}) {
    const started = Date.now();
    if (kind === "image.generate" || kind === "image.edit") {
      const result = await this.runVisualTask("image", payload);
      return {
        id: crypto.randomUUID(), status: "succeeded", provider: result.provider, model: result.model,
        kind, aiGenerated: true, durationMs: Date.now() - started,
        result: { imageDataUrl: result.imageDataUrl, bytes: result.bytes }, requestId: result.requestId
      };
    }
    if (kind === "sound.interpret") {
      const result = await this.provider.text(buildSoundPrompt(payload), 160);
      return {
        id: crypto.randomUUID(), status: "succeeded", provider: "aliyun-model-studio", model: result.model,
        kind, aiGenerated: true, durationMs: Date.now() - started,
        result: { text: result.text }, requestId: result.requestId
      };
    }
    if (kind === "interaction.interpret") {
      const result = await this.runVisualTask("vision", payload);
      return {
        id: crypto.randomUUID(), status: "succeeded", provider: result.provider, model: result.model,
        kind, aiGenerated: true, durationMs: Date.now() - started,
        result: { text: result.text, vision: result.vision }, requestId: result.requestId
      };
    }
    if (kind === "story.generate") {
      const result = await this.provider.text(buildStoryPrompt(payload), 260);
      return {
        id: crypto.randomUUID(), status: "succeeded", provider: "aliyun-model-studio", model: result.model,
        kind, aiGenerated: true, durationMs: Date.now() - started,
        result: { text: result.text }, requestId: result.requestId
      };
    }
    if (kind === "video.generate") {
      const jobId = crypto.randomUUID();
      const startedTask = await this.provider.startVideo(payload);
      this.jobs.set(jobId, {
        id: jobId, kind, status: "queued", provider: "aliyun-model-studio", aiGenerated: true,
        model: startedTask.model, providerTaskId: startedTask.providerTaskId, temporaryKeys: startedTask.temporaryKeys,
        requestId: startedTask.requestId, createdAt: Date.now(), updatedAt: Date.now(), durationMs: Date.now() - started
      });
      return this.publicJob(this.jobs.get(jobId));
    }
    throw new ModelServiceError("UNSUPPORTED_MODEL_TASK", "不支持的模型任务", 400);
  }

  publicJob(job) {
    if (!job) return null;
    return {
      id: job.id, kind: job.kind, status: job.status, provider: job.provider, model: job.model,
      aiGenerated: job.aiGenerated, durationMs: job.durationMs, requestId: job.requestId,
      result: job.status === "succeeded" ? { mediaUrl: `/v1/tasks/${job.id}/media`, text: job.text } : null,
      error: job.error || null
    };
  }

  async get(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) throw new ModelServiceError("TASK_NOT_FOUND", "模型任务不存在或已过期", 404);
    if (["succeeded", "failed"].includes(job.status)) return this.publicJob(job);
    const result = await this.provider.pollVideo(job.providerTaskId);
    job.updatedAt = Date.now();
    if (result.providerStatus === "SUCCEEDED" && result.videoUrl) {
      const videoResponse = await fetch(result.videoUrl);
      if (!videoResponse.ok) throw new ModelServiceError("VIDEO_DOWNLOAD_FAILED", "生成视频下载失败");
      job.media = Buffer.from(await videoResponse.arrayBuffer());
      job.mimeType = videoResponse.headers.get("content-type")?.split(";")[0] || "video/mp4";
      job.status = "succeeded";
      job.durationMs = Date.now() - job.createdAt;
      job.text = "AI 电影彩蛋已生成";
      await this.cleanupJobInputs(job);
    } else if (["FAILED", "CANCELED", "UNKNOWN"].includes(result.providerStatus)) {
      job.status = "failed";
      job.error = { code: result.errorCode || "VIDEO_MODEL_FAILED", message: safeText(result.errorMessage || "视频生成失败", 220) };
      job.durationMs = Date.now() - job.createdAt;
      await this.cleanupJobInputs(job);
    } else {
      job.status = String(result.providerStatus || "running").toLowerCase();
    }
    return this.publicJob(job);
  }

  getMedia(jobId) {
    const job = this.jobs.get(jobId);
    if (!job?.media || job.status !== "succeeded") throw new ModelServiceError("MEDIA_NOT_READY", "生成媒体尚未就绪", 404);
    return { buffer: job.media, mimeType: job.mimeType || "video/mp4" };
  }

  async cleanupJobInputs(job) {
    const keys = job.temporaryKeys || [];
    job.temporaryKeys = [];
    await Promise.all(keys.map((key) => this.store.remove(key)));
  }

  cleanupExpired() {
    const now = Date.now();
    for (const [id, job] of this.jobs) {
      if (now - job.createdAt > JOB_TTL_MS) {
        this.cleanupJobInputs(job).catch(() => {});
        this.jobs.delete(id);
      }
    }
  }
}

export const __test = {
  dataUrlToBuffer,
  safeText,
  buildImagePrompt,
  buildInteractionPrompt,
  parseInteractionVision,
  buildSoundPrompt,
  buildStoryPrompt,
  buildVideoPrompt,
};
