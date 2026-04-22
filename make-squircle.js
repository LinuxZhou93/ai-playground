const sharp = require('sharp');

// 使用用户选择的方案三：浅紫萌宠风
const inputImagePath = '/Users/zhoulin/.gemini/antigravity/brain/0ca6bfbe-5e30-4a10-91f5-a3b4ed527eb6/robot_opt_3_pastel_purple_1774413997336.png';
const outputImagePath = 'build/icon.png';
const displayImagePath = '/Users/zhoulin/Desktop/github/ai-playground/build/icon_preview.png';

const width = 1024;
const height = 1024;
const rx = 230;

// 圆角矩形遮罩 (dest-in)
const roundedRectSvg = Buffer.from(
  `<svg width="${width}" height="${height}">
     <rect x="0" y="0" width="${width}" height="${height}" rx="${rx}" ry="${rx}" fill="#FFFFFF"/>
   </svg>`
);

// 文字叠加 (over)
const textSvg = Buffer.from(
  `<svg width="${width}" height="${height}">
     <!-- 增加一点深色文字阴影以防对比度不够 -->
     <text x="512" y="930" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="95" fill="#000000" text-anchor="middle" letter-spacing="6" opacity="0.6">Future AI</text>
     <!-- 白色主文字 -->
     <text x="512" y="924" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="95" fill="#FFFFFF" text-anchor="middle" letter-spacing="6" opacity="0.95">Future AI</text>
   </svg>`
);

sharp(inputImagePath)
  .resize(width, height)
  .composite([
    { input: roundedRectSvg, blend: 'dest-in' }, // 裁切成苹果标准圆角矩阵
    { input: textSvg, blend: 'over' }           // 将 Future AI 文字叠加在底部
  ])
  .png()
  .toFile(outputImagePath)
  .then(() => {
    console.log('✅ 图标构建完成：已保存为 build/icon.png');
    // 同时为了方便你预览透明效果，存一份预览图（可选）
    return sharp(outputImagePath).toFile(displayImagePath);
  })
  .then(() => {
     console.log('✅ 生成预览图完毕');
  })
  .catch(err => {
    console.error('生成出错:', err);
  });
