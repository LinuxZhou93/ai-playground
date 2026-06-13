'use client';

import { useEffect, useRef, useMemo } from 'react';
import * as echarts from 'echarts';
import { BarChart2 } from 'lucide-react';

interface DashboardChartsProps {
  isLoading: boolean;
  data?: Array<{ label: string; value: number }> | null;
}

export default function DashboardCharts({ isLoading, data }: DashboardChartsProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  // SVG 骨架屏组件
  const Skeleton = () => (
    <div
      data-testid="dashboard-skeleton"
      className="w-full h-80 flex flex-col justify-between p-6 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl animate-pulse"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="h-5 w-1/3 bg-white/10 rounded"></div>
        <div className="h-5 w-1/6 bg-white/10 rounded"></div>
      </div>
      <svg
        className="w-full h-full text-white/5 fill-current"
        viewBox="0 0 500 200"
        preserveAspectRatio="none"
      >
        {/* 坐标轴 */}
        <line x1="30" y1="10" x2="30" y2="180" stroke="currentColor" strokeWidth="2" />
        <line x1="30" y1="180" x2="480" y2="180" stroke="currentColor" strokeWidth="2" />
        {/* 网格虚线 */}
        <line x1="30" y1="50" x2="480" y2="50" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
        <line x1="30" y1="100" x2="480" y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
        <line x1="30" y1="140" x2="480" y2="140" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
        {/* 脉冲折线骨架 */}
        <path
          d="M 50 150 L 120 100 L 200 120 L 280 60 L 360 80 L 440 30"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <circle cx="50" cy="150" r="5" />
        <circle cx="120" cy="100" r="5" />
        <circle cx="200" cy="120" r="5" />
        <circle cx="280" cy="60" r="5" />
        <circle cx="360" cy="80" r="5" />
        <circle cx="440" cy="30" r="5" />
      </svg>
    </div>
  );

  // 优雅空状态组件
  const EmptyState = () => (
    <div
      data-testid="dashboard-empty"
      className="w-full h-80 flex flex-col items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl text-center"
    >
      <BarChart2 className="w-14 h-14 text-white/30 mb-4 animate-bounce" />
      <h3 className="text-xl font-semibold text-white/90">暂无看板分析数据</h3>
      <p className="text-sm text-white/40 mt-2">系统未能获取到当前时间段的运行统计信息</p>
    </div>
  );

  // Echarts 配置
  const option = useMemo(() => {
    if (!data || data.length === 0) return null;
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'line' },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '8%',
        top: '12%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.map((item) => item.label),
        axisLabel: { color: 'rgba(255, 255, 255, 0.6)' },
        axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: 'rgba(255, 255, 255, 0.6)' },
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.08)' } },
        axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
      },
      series: [
        {
          name: '活跃指标',
          type: 'line',
          smooth: true,
          data: data.map((item) => item.value),
          symbolSize: 8,
          lineStyle: {
            width: 3,
            color: '#3b82f6', // blue-500
          },
          itemStyle: {
            color: '#60a5fa', // blue-400
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0)' },
            ]),
          },
        },
      ],
    };
  }, [data]);

  useEffect(() => {
    if (isLoading || !data || data.length === 0 || !chartRef.current) return;

    let chartInstance: echarts.ECharts | null = null;
    try {
      chartInstance = echarts.init(chartRef.current, null, {
        renderer: 'svg',
      });
      if (option) {
        chartInstance.setOption(option);
      }

      const handleResize = () => {
        chartInstance?.resize();
      };

      const resizeObserver = new ResizeObserver(() => {
        chartInstance?.resize();
      });
      resizeObserver.observe(chartRef.current);

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        resizeObserver.disconnect();
        chartInstance?.dispose();
      };
    } catch (err) {
      console.warn('Echarts init failed in this environment:', err);
    }
  }, [isLoading, data, option]);

  if (isLoading) {
    return <Skeleton />;
  }

  if (!data || data.length === 0) {
    return <EmptyState />;
  }

  return (
    <div
      data-testid="dashboard-chart"
      className="w-full p-6 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white/95">数据 analysis 看板</h3>
        <span className="text-xs px-2.5 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">系统监测</span>
      </div>
      <div ref={chartRef} className="w-full h-80" data-testid="echarts-dom" />
    </div>
  );
}
