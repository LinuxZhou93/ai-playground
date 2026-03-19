document.addEventListener('DOMContentLoaded', () => {
    const btnScan = document.getElementById('btn-start-scan');
    const inputUrl = document.getElementById('target-url');
    const audioAlert = document.getElementById('alert-sound');
    
    // 视图切换
    const views = {
        input: document.getElementById('view-input'),
        analysis: document.getElementById('view-analysis'),
        result: document.getElementById('view-result')
    };
    
    const showView = (val) => {
        Object.values(views).forEach(v => {
            v.classList.remove('active');
            v.style.display = 'none';
        });
        views[val].style.display = 'flex';
        setTimeout(() => views[val].classList.add('active'), 50);
    };

    // 硬件模拟：请求环境摄像头 (为了增强路演真实感)
    const initCameraSim = async () => {
        try {
            // 在静音无痕模式下获取前置流（路演时使用可极大震慑全场，不推流至公网）
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
            // 这里我们截取流后立刻销毁，仅为点亮授权灯泡展示"硬核安全"
            const tracks = stream.getTracks();
            setTimeout(() => { tracks.forEach(track => track.stop()); }, 2000);
            return true;
        } catch (e) {
            console.warn("无摄像头权限或设备不支持，退回纯展示模式。");
            return false;
        }
    };

    const runAnalysis = async () => {
        if (!inputUrl.value.includes('http')) {
            inputUrl.style.borderColor = 'var(--danger)';
            return;
        }
        
        // 尝试获取本地硬件验证
        await initCameraSim();

        showView('analysis');
        
        const uiTitle = document.getElementById('analysis-step-text');
        const t_cv = document.getElementById('t-cv');
        const t_vc = document.getElementById('t-vc');
        const t_nlp = document.getElementById('t-nlp');
        
        const sleep = ms => new Promise(res => setTimeout(res, ms));

        // 步骤1: 远端节点加载
        uiTitle.innerText = ">> [系统] 正在进行视频抽帧脱敏传输与签名提取";
        await sleep(1500);
        
        // 步骤2: CV深伪
        t_cv.classList.remove('pending'); t_cv.classList.add('active');
        t_cv.querySelector('.t-status').innerText = "扫描毛刺率中...";
        uiTitle.innerText = ">> [视觉引擎] OpenCV-DNN 特征锚点捕捉运行中";
        await sleep(1800);
        t_cv.classList.remove('active'); t_cv.classList.add('done');
        t_cv.querySelector('.t-status').innerText = "[异常：边缘断裂]";

        // 步骤3: 音频VC
        t_vc.classList.remove('pending'); t_vc.classList.add('active');
        t_vc.querySelector('.t-status').innerText = "提取基波频率...";
        uiTitle.innerText = ">> [声纹引擎] VITS 伪造模型参数比对校验";
        await sleep(1500);
        t_vc.classList.remove('active'); t_vc.classList.add('done');
        t_vc.querySelector('.t-status').innerText = "[异常：电子混响]";

        // 步骤4: 文本NLP
        t_nlp.classList.remove('pending'); t_nlp.classList.add('active');
        t_nlp.querySelector('.t-status').innerText = "解构文本树状语意...";
        uiTitle.innerText = ">> [语言大模型] 诱导话术抽取（金融、感情挂钩）";
        await sleep(1500);
        t_nlp.classList.remove('active'); t_nlp.classList.add('done');
        t_nlp.querySelector('.t-status').innerText = "命中 3 个黑红词汇";

        uiTitle.innerText = "!! 拦截阈值突破，启动响应协议 !!";
        uiTitle.style.color = "var(--danger)";
        
        // 播放警报音 (HTML内潜入的微提示音，如允许受限则忽略)
        try { audioAlert.play(); } catch(e) {}
        
        await sleep(800);

        // 显示阻断结果
        showView('result');
    };

    btnScan.addEventListener('click', runAnalysis);
    
    document.getElementById('btn-clear-url').addEventListener('click', () => { inputUrl.value = ""; });
    
    document.getElementById('btn-restart').addEventListener('click', () => {
        window.location.reload(); // 重置全部状态
    });

    document.getElementById('btn-share-report').addEventListener('click', () => {
        alert("已自动生成 PDF 鉴定报告，并通过终端加密通道发送至：紧急联系人 (女儿)。同时已存证至本地公证节点。");
    });
});
