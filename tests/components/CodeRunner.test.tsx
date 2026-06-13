// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import CodeRunner from '@/components/course/CodeRunner';

// Mock URL.createObjectURL since it is missing in jsdom environment
if (typeof window !== 'undefined') {
  window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-worker-url');
}

// Custom Mock Worker for safe execution testing under node/jsdom
class MockWorker {
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: ((err: ErrorEvent) => void) | null = null;
  terminated = false;

  constructor(public url: string) {}

  postMessage(code: string) {
    if (this.terminated) return;

    // Simulate timeout for infinite loops by not responding, allowing component timer to trigger terminate
    if (code.includes('while(true)') || code.includes('while (true)') || code.includes('for(;;)')) {
      return;
    }

    // Simulate lack of DOM objects in Web Worker environment
    if (code.includes('window') || code.includes('document') || code.includes('parent')) {
      let missingVar = 'window';
      if (code.includes('document')) missingVar = 'document';
      else if (code.includes('parent')) missingVar = 'parent';

      setTimeout(() => {
        if (!this.terminated && this.onmessage) {
          this.onmessage({
            data: {
              success: false,
              error: `ReferenceError: ${missingVar} is not defined`,
              logs: []
            }
          } as MessageEvent);
        }
      }, 20);
      return;
    }

    // Normal execution simulation
    setTimeout(() => {
      if (this.terminated) return;
      
      const logs: string[] = [];
      const mockConsoleLog = (...args: any[]) => {
        logs.push(args.map(arg => {
          if (arg === null) return 'null';
          if (arg === undefined) return 'undefined';
          return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
        }).join(' '));
      };

      try {
        const originalLog = console.log;
        console.log = mockConsoleLog;
        const result = new Function(code)();
        console.log = originalLog;

        if (this.onmessage) {
          this.onmessage({
            data: {
              success: true,
              logs,
              result: result !== undefined ? String(result) : undefined
            }
          } as MessageEvent);
        }
      } catch (err: any) {
        if (this.onmessage) {
          this.onmessage({
            data: {
              success: false,
              error: err.message || 'Error',
              logs
            }
          } as MessageEvent);
        }
      }
    }, 20);
  }

  terminate() {
    this.terminated = true;
  }
}

// Stub global Worker
vi.stubGlobal('Worker', MockWorker);

describe('CodeRunner Component', () => {
  let container: HTMLDivElement;
  let root: any;

  beforeEach(() => {
    vi.restoreAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  const cleanup = async () => {
    await act(async () => {
      root.unmount();
    });
    document.body.removeChild(container);
  };

  it('⚡️ 应该能够渲染组件并显示初始代码', async () => {
    await act(async () => {
      root.render(<CodeRunner initialCode="console.log('init');" />);
    });

    const textarea = container.querySelector('[data-testid="code-input"]') as HTMLTextAreaElement;
    expect(textarea).not.toBeNull();
    expect(textarea.value).toBe("console.log('init');");

    const outputConsole = container.querySelector('[data-testid="console-output"]') as HTMLDivElement;
    expect(outputConsole.textContent).toContain('点击右上角“运行代码”查看输出');

    await cleanup();
  });

  it('⚡️ 运行正常代码应该正确捕获 console.log 输出和返回值', async () => {
    await act(async () => {
      root.render(<CodeRunner initialCode="console.log('hello', 'world'); return 42;" />);
    });

    const runBtn = container.querySelector('[data-testid="run-btn"]') as HTMLButtonElement;
    
    await act(async () => {
      runBtn.click();
    });

    // Wait for the mock worker to respond (20ms delay simulated)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const outputConsole = container.querySelector('[data-testid="console-output"]') as HTMLDivElement;
    expect(outputConsole.textContent).toContain('hello world');
    expect(outputConsole.textContent).toContain('返回值: 42');

    await cleanup();
  });

  it('⚡️ 注入恶意 DOM 操作代码应该安全拦截并报错', async () => {
    await act(async () => {
      root.render(<CodeRunner initialCode="window.alert('hack');" />);
    });

    const runBtn = container.querySelector('[data-testid="run-btn"]') as HTMLButtonElement;
    
    await act(async () => {
      runBtn.click();
    });

    // Wait for the mock worker to respond
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const errorDiv = container.querySelector('[data-testid="console-error"]') as HTMLDivElement;
    expect(errorDiv).not.toBeNull();
    expect(errorDiv.textContent).toContain('ReferenceError: window is not defined');

    await cleanup();
  });

  it('⚡️ 注入死循环代码应该触发超时机制并终止', async () => {
    // Render with 100ms timeout for efficient testing
    await act(async () => {
      root.render(<CodeRunner initialCode="while(true) {}" timeoutMs={100} />);
    });

    const runBtn = container.querySelector('[data-testid="run-btn"]') as HTMLButtonElement;
    
    await act(async () => {
      runBtn.click();
    });

    // Wait for more than 100ms so that the timeout handler triggers
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    const errorDiv = container.querySelector('[data-testid="console-error"]') as HTMLDivElement;
    expect(errorDiv).not.toBeNull();
    expect(errorDiv.textContent).toContain('执行超时：代码运行时间超过 0.1 秒，已被强行终止。');

    await cleanup();
  });
});
