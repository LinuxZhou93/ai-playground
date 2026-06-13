// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import CourseDetailsPage from '../../app/courses/[id]/page';

// Mock Worker and URL APIs for jsdom environment
class MockWorker {
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: ((e: ErrorEvent) => void) | null = null;
  
  postMessage(data: any) {
    // Simulate async execution response
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage({
          data: {
            success: true,
            logs: ['模拟 Worker 打印输出: Hello World'],
            result: '300',
          }
        } as MessageEvent);
      }
    }, 50);
  }
  terminate() {}
}

global.Worker = MockWorker as any;
global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-worker-url');
global.URL.revokeObjectURL = vi.fn();

describe('Course Sandbox E2E & Unit Tests', () => {
  it('⚡️ 应该能正确挂载并渲染代码沙箱卡片和编辑器输入区', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<CourseDetailsPage params={{ id: '101' }} />);
    });

    // 验证标题和描述是否正确渲染
    const title = container.querySelector('h1');
    expect(title?.textContent).toContain('课程 #101');

    // 验证沙箱卡片和操作元素的存在性
    const sandboxCard = container.querySelector('[data-testid="code-sandbox-card"]');
    expect(sandboxCard).not.toBeNull();

    const runBtn = container.querySelector('[data-testid="run-button"]');
    expect(runBtn).not.toBeNull();
    expect(runBtn?.textContent).toContain('执行代码');

    const editor = container.querySelector('[data-testid="editor-textarea"]');
    expect(editor).not.toBeNull();

    const output = container.querySelector('[data-testid="output-console"]');
    expect(output?.textContent).toContain('点击“执行代码”查看反馈输出');

    await act(async () => {
      root.unmount();
    });
    document.body.removeChild(container);
  });

  it('⚡️ 点击运行后按钮应该切换为加载状态，成功返回后输出结果且渐入显示', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<CourseDetailsPage params={{ id: '102' }} />);
    });

    const runBtn = container.querySelector('[data-testid="run-button"]') as HTMLButtonElement;
    
    // 点击按钮运行
    await act(async () => {
      runBtn.click();
    });

    // 检查加载中状态
    expect(runBtn.disabled).toBe(true);
    expect(runBtn.textContent).toContain('正在沙箱中执行...');
    expect(container.querySelector('.animate-spin')).not.toBeNull();

    // 等待 mock worker 异步返回结果并刷新 UI
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 60));
    });

    // 检查加载完毕状态
    expect(runBtn.disabled).toBe(false);
    expect(runBtn.textContent).toContain('执行代码');

    const outputConsole = container.querySelector('[data-testid="output-console"]');
    expect(outputConsole?.textContent).toContain('模拟 Worker 打印输出: Hello World');
    expect(outputConsole?.textContent).toContain('返回值: 300');
    // 渐入样式应该被激活
    expect(outputConsole?.className).toContain('opacity-100');

    await act(async () => {
      root.unmount();
    });
    document.body.removeChild(container);
  });

  it('⚡️ 当沙箱代码执行超时（超过限制）时，应该强行终止并返回友好的超时错误提示', async () => {
    // 启用 fake timers
    vi.useFakeTimers();

    // 修改 MockWorker 使其永不自动返回 message
    const originalPost = MockWorker.prototype.postMessage;
    MockWorker.prototype.postMessage = function() {
      // 故意不回传，模拟无限死循环挂起
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<CourseDetailsPage params={{ id: '103' }} />);
    });

    const runBtn = container.querySelector('[data-testid="run-button"]') as HTMLButtonElement;
    
    await act(async () => {
      runBtn.click();
    });

    // 验证状态变为运行中
    expect(runBtn.disabled).toBe(true);

    // 模拟推进 2000ms 触发超时逻辑
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    // 检查按钮恢复，且有错误日志
    expect(runBtn.disabled).toBe(false);
    const errorLog = container.querySelector('[data-testid="console-error"]');
    expect(errorLog?.textContent).toContain('执行超时：代码运行时间超过 2 秒，已被终止');

    await act(async () => {
      root.unmount();
    });
    document.body.removeChild(container);

    // 恢复 mock 和 timers
    MockWorker.prototype.postMessage = originalPost;
    vi.useRealTimers();
  });
});
