export const appBase = import.meta.env?.BASE_URL || "/";
export const assetPath = (path) => `${appBase}${String(path).replace(/^\/+/, "")}`;

const sharedArtworkRules = {
  modelKind: "image.edit",
  mode: "artwork",
  captureSource: "overhead-a4-artwork",
  inputMode: "artwork-camera",
  outputMode: "single-generated-image",
  interactionDepth: 1,
};

export const stations = [
  {
    ...sharedArtworkRules,
    id: 1,
    slug: "creature-awakening",
    legacy: "xmptest3.py",
    machine: "01 · 化形万物",
    shortName: "化形万物",
    title: "让画里的生命醒来",
    subtitle: "保留孩子真实的线条与颜色，让纸上的角色进入一个会呼吸的世界。",
    action: "让它活起来",
    resultTitle: "它真的离开纸面了",
    background: assetPath("assets/stations/station-1-artwork-awakening.png"),
    mascot: assetPath("assets/cartoon/cartoon-mascot-1-fish.png"),
    kidTitle: "让画里的朋友动起来！",
    kidTitleLead: "让画里的",
    kidTitleAccent: "朋友动起来！",
    kidAction: "拍拍它，开始魔法",
    experience: "artwork-awakening",
    accent: "#79e7ff",
    accentRgb: "121, 231, 255",
    recipe: {
      id: "living-creature",
      label: "生命苏醒",
      summary: "角色离开纸张，进入与它匹配的卡通动画家园",
      direction: "把原画中最主要的一个生命角色完整保留下来，让它离开白纸并以可爱、自然的卡通动作活动；依据角色类型生成高品质 3D 动画与水彩绘本融合的栖息地、前中后景、柔和体积光和环境回应，保持明亮童趣，绝不做照片级写实。",
    },
    modelSignals: ["原画主要角色", "真实线条与笔触", "适合它的动作和家园"],
  },
  {
    ...sharedArtworkRules,
    id: 2,
    slug: "wonder-object",
    legacy: "children_ai_magic_imgedit.py",
    machine: "02 · 奇物成真",
    shortName: "奇物成真",
    title: "把想象做成真的",
    subtitle: "忠实保留原画造型，把纸上的奇怪发明变成可爱的卡通立体奇物。",
    action: "让奇物成真",
    resultTitle: "你的发明被造出来了",
    background: assetPath("assets/stations/station-2-body-alchemy.png"),
    mascot: assetPath("assets/cartoon/cartoon-mascot-2-robot.png"),
    kidTitle: "把你的奇物造出来！",
    kidTitleLead: "把你的奇物",
    kidTitleAccent: "造出来！",
    kidAction: "拍拍它，造出奇物",
    experience: "artwork-sculpture",
    accent: "#c89bff",
    accentRgb: "200, 155, 255",
    recipe: {
      id: "tactile-sculpture",
      label: "立体奇物",
      summary: "把原画变成高级卡通软陶、毛绒玩具或奇妙装置",
      direction: "把原画中的主要物体或发明做成高品质卡通软陶、毛绒玩具或动画装置，严格保留轮廓、比例、配色和不完美笔触；使用圆润造型、柔和 toon shading、可爱的材质暗示与清晰尺度，让它像从儿童动画工坊里刚刚诞生，绝不做写实商品照片。",
    },
    modelSignals: ["奇物完整轮廓", "孩子选择的颜色", "最适合它的卡通玩具材质"],
  },
  {
    ...sharedArtworkRules,
    id: 3,
    slug: "world-bloom",
    legacy: "children_ai_videobf.py",
    machine: "03 · 画境生长",
    shortName: "画境生长",
    title: "从一张画长出世界",
    subtitle: "从画里的道路、房子、花草和符号出发，把纸面向四周扩展成完整奇境。",
    action: "让世界生长",
    resultTitle: "你的画长成了一个世界",
    background: assetPath("assets/stations/station-3-voice-forest.png"),
    mascot: assetPath("assets/cartoon/cartoon-mascot-3-sprout.png"),
    kidTitle: "让小画长成大世界！",
    kidTitleLead: "让小画长成",
    kidTitleAccent: "大世界！",
    kidAction: "拍拍它，世界生长",
    experience: "artwork-world",
    accent: "#83f0b2",
    accentRgb: "131, 240, 178",
    recipe: {
      id: "expanding-world",
      label: "奇境生长",
      summary: "沿着原画构图向外生长出完整童话绘本世界",
      direction: "把整幅画视为童话世界地图，保留道路、房屋、植物、太阳、河流和角色之间的原始位置关系，从纸面边缘向外连续扩展成有卡通地形、明亮天气、柔和景深和绘本纹理的沉浸式奇境；造型圆润、色彩温暖，绝不做写实风景照片。",
    },
    modelSignals: ["原画空间关系", "道路与环境线索", "可以继续生长的世界边缘"],
  },
  {
    ...sharedArtworkRules,
    id: 4,
    slug: "cinematic-drawing",
    legacy: "children_ai_magic_video.py",
    machine: "04 · 童画大片",
    shortName: "童画大片",
    title: "把这一幕拍成大片",
    subtitle: "不需要选故事，让模型直接理解画面，把它变成一张电影级关键镜头。",
    action: "生成电影画面",
    resultTitle: "你的画成为了电影主画面",
    background: assetPath("assets/stations/station-4-living-cinema.png"),
    mascot: assetPath("assets/cartoon/cartoon-mascot-4-owl.png"),
    kidTitle: "让你的画变成大片！",
    kidTitleLead: "让你的画变成",
    kidTitleAccent: "大片！",
    kidAction: "拍拍它，开拍大片",
    experience: "artwork-cinema",
    accent: "#ffc86f",
    accentRgb: "255, 200, 111",
    recipe: {
      id: "cinematic-keyframe",
      label: "电影画面",
      summary: "把原画变成具有叙事张力的卡通动画电影关键帧",
      direction: "理解原画正在发生的事件，不要求孩子额外选择剧情；严格保留主要角色和关键道具，把这一瞬间重构成高品质卡通动画电影关键帧，使用儿童动画镜头、清晰空间调度、柔和戏剧光影和明确叙事焦点，绝不变成真人电影剧照。",
    },
    modelSignals: ["画面正在发生什么", "主角与关键道具", "最有力量的电影镜头"],
  },
];

export function resolveStation(input) {
  const value = String(input || "").toLowerCase();
  const numeric = Number(value.match(/(?:station\/|station=)?([1-4])/)?.[1]);
  return stations.find((station) => station.id === numeric || station.slug === value) || stations[0];
}

export function resolveExperienceRoute(pathname = "/", search = "", hash = "") {
  const pathMatch = String(pathname).match(/\/station\/([1-4])(?:\/|$)/);
  const query = new URLSearchParams(String(search).replace(/^\?/, "")).get("station");
  const hashValue = String(hash).replace(/^#/, "");
  const stationToken = pathMatch?.[1] || query || (/(?:^|\/)station(?:\/|=)[1-4]$/.test(hashValue) ? hashValue : "");

  return stationToken
    ? { type: "station", station: resolveStation(stationToken) }
    : { type: "portal", station: null };
}
