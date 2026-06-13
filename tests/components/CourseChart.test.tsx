// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import CourseChart from '@/components/analytics/CourseChart';

// Mock ResizeObserver since it's not implemented in jsdom by default
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('CourseChart Component', () => {
  it('⚡️ 当 loading 为 true 时，应该正确挂载 SVG 骨架屏组件', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<CourseChart loading={true} data={null} />);
    });

    const skeleton = container.querySelector('[data-testid="chart-skeleton"]');
    expect(skeleton).not.toBeNull();
    
    const emptyState = container.querySelector('[data-testid="chart-empty"]');
    expect(emptyState).toBeNull();

    await act(async () => {
      root.unmount();
    });
    document.body.removeChild(container);
  });

  it('⚡️ 当 loading 为 false 且 data 为空时，应该正确挂载空状态提示与图标', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<CourseChart loading={false} data={[]} />);
    });

    const emptyState = container.querySelector('[data-testid="chart-empty"]');
    expect(emptyState).not.toBeNull();
    expect(emptyState?.textContent).toContain('暂无分析数据');

    const skeleton = container.querySelector('[data-testid="chart-skeleton"]');
    expect(skeleton).toBeNull();

    await act(async () => {
      root.unmount();
    });
    document.body.removeChild(container);
  });

  it('⚡️ 当 loading 为 false 且 data 有数据时，应该正确挂载图表容器', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const testData = [
      { name: 'React', value: 120 },
      { name: 'TypeScript', value: 95 }
    ];

    await act(async () => {
      root.render(<CourseChart loading={false} data={testData} />);
    });

    const chartContainer = container.querySelector('[data-testid="chart-container"]');
    expect(chartContainer).not.toBeNull();
    expect(chartContainer?.textContent).toContain('课程学习分析');

    const echartsDom = container.querySelector('[data-testid="echarts-dom"]');
    expect(echartsDom).not.toBeNull();

    await act(async () => {
      root.unmount();
    });
    document.body.removeChild(container);
  });
});
