import test from "node:test";
import assert from "node:assert/strict";
import { ModelService, __test } from "../api/model-service.mjs";

const recipes = [
  ["artwork-awakening", "生命苏醒", "让主要角色离开白纸并进入与它匹配的自然栖息地"],
  ["artwork-sculpture", "立体奇物", "把原画中的物体变成具有真实材质和尺度的实体造物"],
  ["artwork-world", "奇境生长", "沿原画空间关系向纸张边缘之外连续扩展完整世界"],
  ["artwork-cinema", "电影画面", "把原画事件重构成具有戏剧光影和清晰叙事焦点的电影关键帧"],
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
    assert.match(prompt, /16:9/);
  });
});

test("the four fixed generation recipes produce materially distinct prompts", () => {
  const prompts = recipes.map(([experience, label, direction]) => __test.buildImagePrompt({
    experience,
    recipe: { label, direction },
  }));
  assert.equal(new Set(prompts).size, 4);
  assert.match(prompts[0], /自然栖息地/);
  assert.match(prompts[1], /真实材质/);
  assert.match(prompts[2], /连续扩展完整世界/);
  assert.match(prompts[3], /电影关键帧/);
});

test("vision contract reads one A4 artwork and never asks for voice, portrait or choices", () => {
  const prompt = __test.buildInteractionPrompt({
    experience: "artwork-cinema",
    recipe: { label: "电影画面", direction: "直接理解原画事件并形成电影关键帧" },
  });
  assert.match(prompt, /A4 儿童原画/);
  assert.match(prompt, /不是人像/);
  assert.match(prompt, /不要求任何额外选择/);
  assert.match(prompt, /"subject"/);
  assert.match(prompt, /"movement"/);
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
