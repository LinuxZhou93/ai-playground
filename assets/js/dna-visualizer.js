/**
 * TITAN OS - DNA VISUALIZER v1.0
 * Translates preference vectors into high-fidelity "Talent Radar" charts.
 */

window.DNAVisualizer = (() => {
    let chartInstance = null;

    // 维度定义与文案映射
    const DIMENSIONS = [
        { key: 'robotics', label: '逻辑力 (Logic)', color: 'rgba(0, 240, 255, 0.8)' },
        { key: 'coding', label: '构造力 (Structure)', color: 'rgba(112, 0, 255, 0.8)' },
        { key: 'biology', label: '感知力 (Perception)', color: 'rgba(0, 255, 157, 0.8)' },
        { key: 'earth', label: '生存力 (Vitality)', color: 'rgba(255, 214, 0, 0.8)' },
        { key: 'ai', label: '抽象力 (Abstraction)', color: 'rgba(255, 0, 60, 0.8)' },
        { key: 'design', label: '创造力 (Creativity)', color: 'rgba(255, 120, 0, 0.8)' }
    ];

    function init() {
        // 加载进度：检测 Chart.js 依赖
        if (!window.Chart) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = () => console.log('📊 DNA: Chart.js loaded');
            document.head.appendChild(script);
        }
    }

    /**
     * 在指定容器渲染雷达图
     * @param {string} canvasId - Canvas 元素的 ID
     */
    function renderRadar(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx || !window.Chart) return;

        const dna = window.TitanEvolutionEngine ? window.TitanEvolutionEngine.getEvolutionDNA() : {};
        
        // 提取数值，默认为基础分 20
        const dataValues = DIMENSIONS.map(d => dna[d.key] || 20);
        const labels = DIMENSIONS.map(d => d.label);

        if (chartInstance) {
            chartInstance.data.datasets[0].data = dataValues;
            chartInstance.update();
            return;
        }

        chartInstance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: '潜能倾向 (Genetic DNA)',
                    data: dataValues,
                    backgroundColor: 'rgba(0, 240, 255, 0.2)',
                    borderColor: 'rgba(0, 240, 255, 0.8)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(0, 240, 255, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(0, 240, 255, 1)'
                }]
            },
            options: {
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: { color: 'rgba(255, 255, 255, 0.8)', font: { size: 12 } },
                        suggestedMin: 0,
                        suggestedMax: 100,
                        ticks: { display: false }
                    }
                },
                plugins: {
                    legend: { display: false }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    // 监听画像更新事件，自动刷新图表
    window.addEventListener('titan_onboarding_step', () => {
        if (chartInstance) {
            const dna = window.TitanEvolutionEngine.getEvolutionDNA();
            chartInstance.data.datasets[0].data = DIMENSIONS.map(d => dna[d.key] || 20);
            chartInstance.update('none'); // 无感后台更新
        }
    });

    return { init, renderRadar };
})();

// 自动初始化
DNAVisualizer.init();
