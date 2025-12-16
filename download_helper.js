
/**
 * 🛠️ 视频本地化下载助手
 * Video Localization Downloader Helper
 * 
 * 这是一个辅助脚本，用于生成下载命令。
 * 您需要在终端中安装 'yt-dlp' 工具来执行这些命令。
 * This is a helper script to generate download commands.
 * You need to install 'yt-dlp' in your terminal to execute these commands.
 * 
 * 安装引导 / Installation Guide:
 * 1. 安装 Homebrew (如果未安装): /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
 * 2. 安装 Python & FFMPEG: brew install python ffmpeg
 * 3. 安装 yt-dlp: brew install yt-dlp
 */

const DOWNLOAD_DIR = '/Users/zhoulin/Desktop/github/ai-playground/assets/video';

// 课程视频映射表 (Course Video Map)
// 包含 B 站 BV 号和本地文件名
const videos = [
    {
        lesson: 1,
        title: "宇宙的尺度",
        bvid: "BV1LKcceQEYM",
        filename: "lesson_1_scale_of_universe.mp4"
    },
    {
        lesson: 2,
        title: "大爆炸",
        bvid: "BV1Tt411v7qP",
        filename: "lesson_2_big_bang.mp4"
    },
    {
        lesson: 3,
        title: "恒星的一生",
        bvid: "BV1Ga411A71Z",
        filename: "lesson_3_star_lifecycle.mp4"
    },
    {
        lesson: 5,
        title: "广义相对论",
        bvid: "BV1LKcceQEYM", // 注意：Lesson 5 目前也指向 Scale，需确认正确 ID 后更新此处
        filename: "lesson_5_general_relativity.mp4"
    },
    {
        lesson: 6,
        title: "黑洞",
        bvid: "BV18s411q7KB",
        filename: "lesson_6_black_hole.mp4"
    }
];

console.log("==============================================");
console.log("   🚀   AI Playground 视频本地化下载指令生成   ");
console.log("   🚀   Video Localization Command Generator   ");
console.log("==============================================");
console.log(`\n📂 目标目录 (Target Dir): ${DOWNLOAD_DIR}\n`);

console.log("✂️  请复制以下命令并在终端运行 (Copy & Run):\n");

// 生成 mkdir 命令
console.log(`mkdir -p "${DOWNLOAD_DIR}"`);

// 生成下载命令
videos.forEach(v => {
    // 命令解释:
    // yt-dlp: 下载工具
    // -f 'bv[ext=mp4]+ba[ext=m4a]/b[ext=mp4]': 下载最好的 mp4 视频+音频
    // --output: 指定输出文件名
    // url: B站视频地址
    console.log(`yt-dlp -f 'bv[ext=mp4]+ba[ext=m4a]/b[ext=mp4]' --output "${DOWNLOAD_DIR}/${v.filename}" "https://www.bilibili.com/video/${v.bvid}"`);
});

console.log("\n==============================================");
console.log("💡 提示: 下载完成后，请告诉我，我将更新代码以指向本地文件。");
console.log("   Tip: After downloading, let me know and I will update the code to link local files.");
console.log("==============================================");
