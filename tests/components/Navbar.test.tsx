// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Navbar from '@/components/Navbar';

describe('Navbar Component', () => {
  let container: HTMLDivElement;
  let root: any;

  beforeEach(() => {
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

  it('⚡️ 在顶部 (scrollY = 0) 时，应该渲染透明无毛玻璃效果的背景', async () => {
    // Mock window.scrollY = 0
    vi.stubGlobal('window', {
      scrollY: 0,
      addEventListener: window.addEventListener,
      removeEventListener: window.removeEventListener,
    });

    await act(async () => {
      root.render(<Navbar />);
    });

    const navbar = container.querySelector('[data-testid="navbar"]') as HTMLElement;
    expect(navbar).not.toBeNull();
    expect(navbar.className).toContain('bg-transparent');
    expect(navbar.className).not.toContain('backdrop-blur-md');

    await cleanup();
  });

  it('⚡️ 滚动发生后 (scrollY > 0) 时，应该切换为毛玻璃效果与带颜色的背景', async () => {
    let scrollCallback: any = null;
    const addEventListenerMock = vi.fn().mockImplementation((event, callback) => {
      if (event === 'scroll') {
        scrollCallback = callback;
      }
    });

    vi.stubGlobal('window', {
      scrollY: 0,
      addEventListener: addEventListenerMock,
      removeEventListener: vi.fn(),
    });

    await act(async () => {
      root.render(<Navbar />);
    });

    const navbar = container.querySelector('[data-testid="navbar"]') as HTMLElement;
    
    // Simulate scroll down
    vi.stubGlobal('window', {
      scrollY: 100,
      addEventListener: addEventListenerMock,
      removeEventListener: vi.fn(),
    });

    await act(async () => {
      if (scrollCallback) scrollCallback();
    });

    expect(navbar.className).toContain('backdrop-blur-md');
    expect(navbar.className).toContain('bg-white/70');
    expect(navbar.className).toContain('dark:bg-black/70');

    await cleanup();
  });
});
