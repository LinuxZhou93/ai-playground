// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import LabsPage from '@/app/[locale]/labs/page';

describe('LabsPage Component Multilingual & Interaction Tests', () => {
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

  it('⚡️ 应该能正确加载中文语系 (locale = zh) 页面', async () => {
    const mockParams = Promise.resolve({ locale: 'zh' });

    await act(async () => {
      root.render(<LabsPage params={mockParams} />);
    });

    const navTitle = container.querySelector('[data-testid="nav-title"]');
    expect(navTitle).not.toBeNull();
    expect(navTitle?.textContent).toContain('万物实验室');

    const categoryLabel = container.querySelector('[data-testid="category-label"]');
    expect(categoryLabel?.textContent).toContain('分类: ALL');

    await cleanup();
  });

  it('⚡️ 应该能正确加载英文语系 (locale = en) 页面', async () => {
    const mockParams = Promise.resolve({ locale: 'en' });

    await act(async () => {
      root.render(<LabsPage params={mockParams} />);
    });

    const navTitle = container.querySelector('[data-testid="nav-title"]');
    expect(navTitle).not.toBeNull();
    expect(navTitle?.textContent).toContain('INFINITE LAB');

    const categoryLabel = container.querySelector('[data-testid="category-label"]');
    expect(categoryLabel?.textContent).toContain('CATEGORY: ALL');

    await cleanup();
  });

  it('⚡️ 点击分类按钮，应该更新分类筛选状态', async () => {
    const mockParams = Promise.resolve({ locale: 'zh' });

    await act(async () => {
      root.render(<LabsPage params={mockParams} />);
    });

    const buttons = container.querySelectorAll('[data-testid="filter-container"] button');
    expect(buttons.length).toBeGreaterThan(1);

    await act(async () => {
      (buttons[1] as HTMLButtonElement).click();
    });

    const categoryLabel = container.querySelector('[data-testid="category-label"]');
    expect(categoryLabel?.textContent).toContain('分类: PHYSICS');

    await cleanup();
  });

  it('⚡️ 当搜索输入时，应该根据搜索词动态过滤实验卡片并显示结果', async () => {
    const mockParams = Promise.resolve({ locale: 'zh' });

    await act(async () => {
      root.render(<LabsPage params={mockParams} />);
    });

    const searchInput = container.querySelector('[data-testid="search-input"]') as HTMLInputElement;
    expect(searchInput).not.toBeNull();

    await act(async () => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeInputValueSetter?.call(searchInput, 'nonexistent-simulation-xyz-999');
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    });

    const noSimEl = container.querySelector('[data-testid="no-simulation"]');
    expect(noSimEl).not.toBeNull();
    expect(noSimEl?.textContent).toContain('暂无该分类实验');

    await cleanup();
  });
});
