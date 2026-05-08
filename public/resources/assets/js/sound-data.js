/**
 * TITAN SOUND LAB - CURRICULUM DATA v1.0
 * The ultimate fusion of Music and Technology.
 */

const soundCourseData = {
    settings: {
        theme: 'cyber-dark',
        accentColor: '#22d3ee'
    },

    tracks: [
        {
            id: 'ai-composition',
            title: '神经网络作曲',
            icon: '🧠',
            tag: 'Generative AI',
            desc: '探索当算法拥有了“乐感”。从提示词工程到神经网络微调，定义 AI 时代的旋律主权。',
            lessons: [
                {
                    id: 'aic-01',
                    title: 'Suno/Udio：提示词作曲家',
                    type: 'reading',
                    content: `
                        ### 如何像指挥家一样编写 Prompt？
                        AI 作曲不仅仅是输入一句话，它需要你理解：
                        - **Genre (流派)**: Cinematic, Cyberpunk, Baroque, Lo-fi.
                        - **Instrumentation (配器)**: Analog Synth, Grand Piano, Haunting Cello.
                        - **Mood (情绪)**: Ethereal, Aggressive, Nostalgic.
                        
                        **实战挑战：** 
                        利用 Suno 生成一首描述“未来泰坦之城”的电子管弦乐。
                    `
                },
                {
                    id: 'aic-02',
                    title: 'Google Magenta：Python 与旋律生成',
                    type: 'video',
                    url: 'https://player.bilibili.com/player.html?bvid=BV1os411r7Pz',
                    desc: '学习如何使用 TensorFlow 构建的神经网络库来生成 MIDI 序列。'
                }
            ]
        },
        {
            id: 'physics',
            title: '声音物理与合成器',
            icon: '🌊',
            tag: 'Physics & DSP',
            desc: '深入波形的底层。理解振荡器、滤波器以及 LFO 如何构建出这个世界所有的声音。',
            lessons: [
                {
                    id: 'phy-01',
                    title: '可视化：振荡器的秘密',
                    type: 'interactive',
                    desc: '对比正弦波、方波、锯齿波的频谱差异。',
                    tasks: ['访问 Chrome Music Lab Oscillators', '观察不同频率下的谐波分布']
                },
                {
                    id: 'phy-02',
                    title: '减法合成：从白噪音到震撼 Bass',
                    type: 'reading',
                    content: `
                        ### 合成引擎三部曲
                        1. **VCO (振荡器)**: 产生原始波形。
                        2. **VCF (滤波器)**: 切割频率，塑造音色质感（Low Pass / High Pass）。
                        3. **VCA (放大器)**: 控制声音的包络 (ADSR) —— 决定它是像钢琴一样清脆，还是像弦乐一样悠长。
                    `
                }
            ]
        },
        {
            id: 'coding',
            title: '算法音乐编程',
            icon: '💻',
            tag: 'Live Coding',
            desc: '用代码“写”出交响乐。学习 Sonic Pi 与 EarSketch，将逻辑公式转化为震撼律动。',
            lessons: [
                {
                    id: 'cod-01',
                    title: 'Sonic Pi 入门：代码循环逻辑',
                    type: 'video',
                    url: 'https://player.bilibili.com/player.html?bvid=BV1v4411v7S4',
                    desc: '练习 Live Loop，在不停止程序的情况下实时修改音符。'
                },
                {
                    id: 'cod-02',
                    title: 'EarSketch：用 Python 做职业制作人',
                    type: 'reading',
                    content: `
                        ### 编程语法与律动集成
                        - \`fitMedia()\`: 导入并对齐音轨。
                        - \`setEffect()\`: 控制混响、延迟等数字效果器。
                        - \`for loop\`: 创造复杂的节奏填充。
                    `
                }
            ]
        },
        {
            id: 'cloud-production',
            title: '云端音频工程',
            icon: '🎚️',
            tag: 'Recording & Mixing',
            desc: '进入专业级云端录音室。学习多轨编辑、混音、效果器以及全球实时协作。',
            lessons: [
                {
                    id: 'mix-01',
                    title: 'Soundtrap 全球协作实战',
                    type: 'reading',
                    desc: '学习如何邀请远在海外的小伙伴，在同一个数字音轨上接力创作。'
                }
            ]
        }
    ]
};

window.soundCourseData = soundCourseData;
