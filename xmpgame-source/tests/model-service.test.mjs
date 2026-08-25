import test from "node:test";
import assert from "node:assert/strict";
import { ModelService, __test } from "../api/model-service.mjs";

const recipes = [
  ["artwork-awakening", "生命苏醒", "让主要角色离开白纸并进入与它匹配的卡通动画栖息地"],
  ["artwork-sculpture", "立体奇物", "把原画中的物体变成具有卡通软陶质感和清晰尺度的动画造物"],
  ["artwork-world", "奇境生长", "沿原画空间关系向纸张边缘之外连续扩展童话绘本世界"],
  ["artwork-cinema", "电影画面", "把原画事件重构成具有柔和戏剧光影和清晰叙事焦点的动画电影关键帧"],
];

test("all four image prompts treat the input as artwork, preserve strokes and forbid portrait generation", () => {
  recipes.forEach(([experience, label, direction]) => {
    const prompt = __test.buildImagePrompt({
      experience,
      artworkImage: "data:image/png;base64,AA==",
      recipe: { label, direction },
      modelVision: { subject: "原画关键主体", elements: ["原画颜色", "真实笔触", "空间关系"] },
    });
    assert.match(prompt, new RegExp(label));
    assert.match(prompt, /不是人物照片/);
    assert.match(prompt, /不规则轮廓/);
    assert.match(prompt, /不要替孩子纠正/);
    assert.match(prompt, /不得出现真实儿童或成人肖像/);
    assert.match(prompt, /高品质儿童动画或现代童书绘本/);
    assert.match(prompt, /禁止照片级写实/);
    assert.match(prompt, /toon shading/);
    assert.match(prompt, /16:9/);
  });
});

test("the four fixed generation recipes produce materially distinct prompts", () => {
  const prompts = recipes.map(([experience, label, direction]) => __test.buildImagePrompt({
    experience,
    recipe: { label, direction },
  }));
  assert.equal(new Set(prompts).size, 4);
  assert.match(prompts[0], /卡通动画栖息地/);
  assert.match(prompts[1], /卡通软陶/);
  assert.match(prompts[2], /童话绘本世界/);
  assert.match(prompts[3], /动画电影关键帧/);
});

test("vision contract reads one A4 artwork without requiring voice, portrait or choices", () => {
  const prompt = __test.buildInteractionPrompt({
    experience: "artwork-cinema",
    recipe: { label: "电影画面", direction: "直接理解原画事件并形成电影关键帧" },
  });
  assert.match(prompt, /A4 儿童原画/);
  assert.match(prompt, /不是人像/);
  assert.match(prompt, /不要求任何额外选择/);
  assert.match(prompt, /"subject"/);
  assert.match(prompt, /"movement"/);
  assert.doesNotMatch(prompt, /魔法愿望/);
  assert.doesNotMatch(prompt, /麦克风|声纹|人物照片/);

  const vision = __test.parseInteractionVision(JSON.stringify({
    title: "纸上的小鱼要出发",
    subject: "朝右游的蓝绿色鱼",
    movement: "摆尾穿过发光水流",
    elements: ["气泡水流", "发光水草", "远方鲸影"],
    transformation: "保留水彩笔触，成为有景深的电影镜头",
    palette: ["水彩蓝", "青绿色", "橙色尾鳍"],
  }), { experience: "artwork-cinema" });
  assert.equal(vision.subject, "朝右游的蓝绿色鱼");
  assert.equal(vision.movement, "摆尾穿过发光水流");
  assert.equal(vision.elements.length, 3);
});

test("an optional spoken wish guides both model stages without overriding the artwork", () => {
  const payload = {
    experience: "artwork-awakening",
    recipe: { label: "生命苏醒", direction: "保留小鱼的水彩线条，让它进入卡通海底世界" },
    voicePrompt: "让小鱼和海龟一起游泳",
  };
  const visionPrompt = __test.buildInteractionPrompt(payload);
  const imagePrompt = __test.buildImagePrompt(payload);
  for (const prompt of [visionPrompt, imagePrompt]) {
    assert.match(prompt, /让小鱼和海龟一起游泳/);
    assert.match(prompt, /以.*原画为主|原画仍是唯一主体/);
    assert.match(prompt, /儿童安全规则/);
  }
});

test("large generated images are converted to a cloud-safe WebP response", async () => {
  const largeImage = `data:image/png;base64,${Buffer.alloc(2200, 7).toString("base64")}`;
  const fakeSharp = () => {
    const pipeline = {
      rotate: () => pipeline,
      resize: () => pipeline,
      webp: () => pipeline,
      toBuffer: async () => Buffer.alloc(480, 9),
    };
    return pipeline;
  };
  const output = await __test.optimizeGeneratedImageDataUrl(largeImage, {
    maxBytes: 1000,
    loadSharp: async () => ({ default: fakeSharp }),
  });
  assert.equal(output.optimized, true);
  assert.equal(output.bytes, 480);
  assert.match(output.imageDataUrl, /^data:image\/webp;base64,/);
});

test("non-artwork image or vision tasks are rejected at the prompt boundary", () => {
  assert.throws(() => __test.buildImagePrompt({ experience: "body-alchemy" }), /当前装置只接受俯拍儿童画作/);
  assert.throws(() => __test.buildInteractionPrompt({ experience: "voice-forest" }), /当前视觉理解只接受俯拍儿童画作/);
});

test("model service exposes artwork understanding and image editing only", async () => {
  const service = new ModelService({});
  for (const kind of ["sound.interpret", "story.generate", "video.generate", "image.generate"]) {
    await assert.rejects(() => service.create(kind, {}), /不支持的模型任务/);
  }
});
