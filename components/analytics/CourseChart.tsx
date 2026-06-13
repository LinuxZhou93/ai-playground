'use client';

import { useEffect, useRef, useMemo } from 'react';
import * as echarts from 'echarts';
import { BarChart2 } from 'lucide-react';

interface CourseChartProps {
  loading: boolean;
  data?: Array<{ name: string; value: number }> | null;
}

export default function CourseChart({ loading, data }: CourseChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  // SVG 骨架屏组件
  const Skeleton = () => (
    <div
      data-testid="chart-skeleton"
      className="w-full h-64 flex flex-col justify-between p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl animate-pulse"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="h-4 w-1/3 bg-white/10 rounded"></div>
        <div className="h-4 w-1/6 bg-white/10 rounded"></div>
      </div>
      <svg
        className="w-full h-full text-white/10 fill-current"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
      >
        {/* 坐标轴 */}
        <line x1="40" y1="20" x2="40" y2="180" stroke="currentColor" strokeWidth="2" />
        <line x1="40" y1="180" x2="380" y2="180" stroke="currentColor" strokeWidth="2" />
        {/* 虚线网格 */}
        <line x1="40" y1="60" x2="380" y2="60" stroke="currentColor" strokeWidth="1" strokeDasharray="4,4" />
        <line x1="40" y1="100" x2="380" y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="4,4" />
        <line x1="40" y1="140" x2="380" y2="140" stroke="currentColor" strokeWidth="1" strokeDasharray="4,4" />
        {/* 柱形骨架 */}
        <rect x="70" y="80" width="30" height="100" rx="4" />
        <rect x="130" y="110" width="30" height="70" rx="4" />
        <rect x="190" y="50" width="30" height="130" rx="4" />
        <rect x="250" y="90" width="30" height="90" rx="4" />
        <rect x="310" y="70" width="30" height="110" rx="4" />
      </svg>
    </div>
  );

  // 空状态组件
  const EmptyState = () => (
    <div
      data-testid="chart-empty"
      className="w-full h-64 flex flex-col items-center justify-center p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-center"
    >
      <BarChart2 className="w-12 h-12 text-white/40 mb-3 animate-bounce" />
      <h3 className="text-lg font-medium text-white/80">暂无分析数据</h3>
      <p className="text-sm text-white/40 mt-1">目前没有可供分析的课程学习记录</p>
    </div>
  );

  // 构造 options
  const option = useMemo(() => {
    if (!data || data.length === 0) return null;
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      grid: {
        left: '4%',
        right: '4%',
        bottom: '8%',
        top: '12%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.map((item) => item.name),
        axisTick: { alignWithLabel: true },
        axisLabel: { color: 'rgba(255, 255, 255, 0.6)', interval: 0, rotate: 15 },
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
          name: '学习人数',
          type: 'bar',
          barWidth: '50%',
          data: data.map((item) => item.value),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#a855f7' }, // purple-500
              { offset: 1, color: '#6366f1' }, // indigo-500
            ]),
            borderRadius: [6, 6, 0, 0],
          },
        },
      ],
    };
  }, [data]);

  useEffect(() => {
    if (loading || !data || data.length === 0 || !chartRef.current) return;

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
      console.warn('Echarts init or setOption failed in this environment:', err);
    }
  }, [loading, data, option]);

  if (loading) {
    return <Skeleton />;
  }

  if (!data || data.length === 0) {
    return <EmptyState />;
  }

  return (
    <div
      data-testid="chart-container"
      className="w-full p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl"
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium text-white/90">课程学习分析</h3>
        <span className="text-xs text-white/50">实时统计</span>
      </div>
      <div ref={chartRef} className="w-full h-64" data-testid="echarts-dom" />
    </div>
  );
}
