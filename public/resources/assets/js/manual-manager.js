window.ManualManager = (() => {
    const MANUAL_DATA = {
        'doodle-to-3d': {
            title: '魔法涂鸦变身 - 制作手册',
            subtitle: '从平面画纸到立体玩偶的魔法之旅',
            overview: '利用 AI 视觉识别技术，将 2D 简笔画转化为 3D 网格模型模型并打印。',
            preparation: [
                '平板电脑或白纸 + 黑线粗笔',
                'Tripo AI / Luma AI 账号(提供 API 支持)',
                'PLA 炫彩耗材 (建议黄色或粉色)',
                'Bambu Lab X1 / P1S 打印机'
            ],
            steps: [
                '在白纸或画图软件上绘制轮廓清晰的单体图形（如小怪兽、爱心）。',
                '拍照上传至 AI 图像转 3D 转换器。',
                '在预览界面调整厚度和平滑度，导出 .STL 文件。',
                '导入切片软件，设置 10% 填充和支撑结构。',
                '启动打印，等待魔法通过喷头一点点“生长”出来。'
            ],
            optimization: '建议使用“丝绸感”耗材，可以让打印出来的涂鸦玩偶更具梦幻色彩。',
            materials: [
                { name: 'Tripo AI 直达', url: 'https://www.tripo3d.ai/' },
                { name: '建模基础教学视频', url: '#' }
            ]
        },
        'voice-spell': {
            title: '语音魔法咒语 - 制作手册',
            subtitle: '用语言指挥机器，把愿望变成现实',
            overview: '基于大语言模型(LLM)的代码生成能力，通过语音指令生成建模代码。',
            preparation: [
                '带有麦克风的电脑/平板',
                'OpenSCAD 开源建模软件',
                'ChatGPT 或 文心一言 账号',
                'TPU 柔性耗材 (适合制作魔法道具)'
            ],
            steps: [
                '开启语音输入，描述你想要的物体：“设计一个带翅膀的苹果”。',
                'AI 将文字转化为 OpenSCAD 参数化建模代码。',
                '将代码粘贴进入 OpenSCAD 进行渲染导出。',
                '在切片中检查支撑，确保翅膀等悬空部位能顺利打印。',
                '打印完成后，可以进行手工涂色。'
            ],
            optimization: '尝试增加形容词，比如“带齿轮的机械苹果”，AI 会生成更有趣的代码。',
            materials: [
                { name: 'OpenSCAD 官网', url: 'https://openscad.org/' },
                { name: 'Prompt 咒语手册', url: '#' }
            ]
        },
        'toy-hospital': {
            title: '玩具修理工厂 - 制作手册',
            subtitle: '小小维修师，用科技修复童年遗憾',
            overview: '通过拍照识别缺失零件，利用 AI RAG 技术匹配修复方案并定制生产。',
            preparation: [
                '游标卡尺 (测量尺寸)',
                '拍照设备 (上传图片)',
                'PolyTerra 磨砂耗材 (手感好)',
                '后期修复胶水'
            ],
            steps: [
                '测量破损玩具的接口尺寸（如轮孔直径）。',
                '拍摄多角度破损照片，AI 辅助分析零件形状。',
                '在模型库中搜索相似基础件，按比例缩放适配。',
                '使用 100% 填充率确保零件强度。',
                '打磨支撑点，将打印好的“备胎”安装到玩具上。'
            ],
            optimization: '针对容易断裂的零件，可以尝试使用 PETG 或强韧型 PLA 打印。',
            materials: [
                { name: '模型搜索库 MakerWorld', url: 'https://makerworld.com/' },
                { name: '3D 扫描入门教程', url: '#' }
            ]
        },
        'story-maker': {
            title: '故事主角工坊 - 制作手册',
            subtitle: '写下你的童话，打印你的英雄',
            overview: '将文学创作与 3D 叙事结合，打印故事中的关键道具或生物。',
            preparation: [
                '故事剧本稿',
                'Midjourney 或 DALL-E (视觉灵感)',
                '3D 涂色笔/丙烯颜料',
                'PLA 哑光白 (适合后期上色)'
            ],
            steps: [
                '写下一段关于主角或场景的描述。',
                '利用绘图 AI 生成视觉初稿，激发建模灵感。',
                '在 3D ONE 或 AI 转换器中还原模型细节。',
                '打印全套主角和场景道具。',
                '最后进行彩绘，完成属于你自己的动画片布景。'
            ],
            optimization: '可以配合 LED 灯光件，将打印出来的外星飞船变成发光小夜灯。',
            materials: [
                { name: 'DALL-E 创意生成', url: 'https://openai.com/dall-e-3' },
                { name: '手办涂装入门', url: '#' }
            ]
        }
    };

    function init() {
        injectStyles();
        createModal();
    }

    function injectStyles() {
        if (document.getElementById('manual-styles')) return;
        const style = document.createElement('style');
        style.id = 'manual-styles';
        style.textContent = `
            .manual-overlay {
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(0,0,0,0.85); backdrop-filter: blur(15px);
                z-index: 10000; display: none; align-items: center; justify-content: center;
                opacity: 0; transition: opacity 0.3s ease;
            }
            .manual-overlay.active { display: flex; opacity: 1; }
            .manual-modal {
                width: 90%; max-width: 600px; max-height: 85vh; 
                background: #111; border: 1px solid #333; border-radius: 24px;
                padding: 40px; color: white; position: relative; overflow-y: auto;
                box-shadow: 0 0 50px rgba(0, 243, 255, 0.2);
            }
            .manual-title { font-family: 'Orbitron', sans-serif; font-size: 24px; color: #00F3FF; margin-bottom: 10px; }
            .manual-subtitle { font-size: 14px; color: #888; margin-bottom: 30px; letter-spacing: 1px; }
            .manual-section { margin-bottom: 25px; border-left: 2px solid #333; padding-left: 20px; }
            .manual-label { font-size: 12px; color: #555; text-transform: uppercase; margin-bottom: 8px; font-weight: bold; }
            .manual-content { font-size: 14px; line-height: 1.6; color: #ccc; }
            .manual-list { padding-left: 15px; }
            .manual-list li { margin-bottom: 8px; }
            .manual-close { position: absolute; top: 20px; right: 20px; cursor: pointer; color: #555; font-size: 20px; transition: color 0.2s; }
            .manual-close:hover { color: #fff; }
            .manual-link { display: inline-block; padding: 6px 15px; background: rgba(0, 243, 255, 0.1); border: 1px solid rgba(0, 243, 255, 0.3); color: #00F3FF; text-decoration: none; border-radius: 5px; margin-right: 10px; margin-top: 10px; font-size: 12px; }
            .manual-link:hover { background: #00F3FF; color: #000; }
            
            /* Add button to card */
            .tech-card { position: relative; }
            .manual-trigger {
                position: absolute; bottom: 30px; right: 30px; 
                width: 34px; height: 34px; background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1); border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer; transition: all 0.3s; color: rgba(255,255,255,0.3);
            }
            .manual-trigger:hover {
                background: #00F3FF; color: black; border-color: #00F3FF;
                transform: rotate(90deg); box-shadow: 0 0 15px rgba(0,243,255,0.5);
            }
        `;
        document.head.appendChild(style);
    }

    function createModal() {
        if (document.getElementById('manualOverlay')) return;
        const overlay = document.createElement('div');
        overlay.className = 'manual-overlay';
        overlay.id = 'manualOverlay';
        overlay.onclick = (e) => { if (e.target === overlay) close(); };

        const modal = document.createElement('div');
        modal.className = 'manual-modal custom-scroll';
        modal.id = 'manualModal';

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }

    function open(id) {
        const data = MANUAL_DATA[id];
        if (!data) return;

        const modal = document.getElementById('manualModal');
        modal.innerHTML = `
            <div class="manual-close" onclick="window.ManualManager.close()">✕</div>
            <h2 class="manual-title">${data.title}</h2>
            <p class="manual-subtitle">${data.subtitle}</p>
            
            <div class="manual-section">
                <div class="manual-label">项目概述 / OVERVIEW</div>
                <p class="manual-content">${data.overview}</p>
            </div>
            
            <div class="manual-section">
                <div class="manual-label">材料准备 / PREPARATION</div>
                <ul class="manual-list manual-content">
                    ${data.preparation.map(i => `<li>${i}</li>`).join('')}
                </ul>
            </div>
            
            <div class="manual-section">
                <div class="manual-label">实施步骤 / WORKFLOW</div>
                <ol class="manual-list manual-content">
                    ${data.steps.map(i => `<li>${i}</li>`).join('')}
                </ol>
            </div>
            
            <div class="manual-section">
                <div class="manual-label">优化与提升 / OPTIMIZATION</div>
                <p class="manual-content italic" style="color: #00F3FF88">${data.optimization}</p>
            </div>
            
            <div class="manual-section">
                <div class="manual-label">参考资料与工具 / MATERIALS</div>
                <div>
                    ${data.materials.map(m => `<a href="${m.url}" target="_blank" class="manual-link">${m.name}</a>`).join('')}
                </div>
            </div>
        `;

        document.getElementById('manualOverlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        document.getElementById('manualOverlay').classList.remove('active');
        document.body.style.overflow = '';
    }

    return { init, open, close };
})();

// Auto-init
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.ManualManager.init());
    } else {
        window.ManualManager.init();
    }
}
