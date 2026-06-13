'use client';

import React, { useState, useEffect, use, useMemo } from 'react';
import { experiments } from '@/lib/data/experiments';
import zhTranslations from '@/messages/zh.json';
import enTranslations from '@/messages/en.json';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default function LabsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const locale = resolvedParams.locale === 'en' ? 'en' : 'zh';
  const t = locale === 'en' ? enTranslations.labs : zhTranslations.labs;

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedExp, setSelectedExp] = useState<any | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);

  const itemsPerPage = 24;

  // Filter categories
  const categories = [
    { key: 'all', label: t.categoryAll, color: 'text-cyan-300 hover:bg-cyan-900/30' },
    { key: 'Physics', label: t.categoryPhysics, color: 'text-purple-300 hover:bg-purple-900/30' },
    { key: 'Chemistry', label: t.categoryChemistry, color: 'text-green-300 hover:bg-green-900/30' },
    { key: 'Biology', label: t.categoryBiology, color: 'text-yellow-300 hover:bg-yellow-900/30' },
    { key: 'Mathematics', label: t.categoryMathematics, color: 'text-red-300 hover:bg-red-900/30' },
    { key: 'Earth Science', label: t.categoryEarth, color: 'text-blue-300 hover:bg-blue-900/30' },
    { key: 'Social Science', label: t.categorySocial, color: 'text-pink-300 hover:bg-pink-900/30' },
    { key: 'Computer Science', label: t.categoryCS, color: 'text-indigo-300 hover:bg-indigo-900/30' },
    { key: 'Electronics', label: t.categoryElectronics, color: 'text-orange-300 hover:bg-orange-900/30' },
    { key: 'Mechanical', label: t.categoryMechanical, color: 'text-gray-300 hover:bg-gray-800/30' },
    { key: 'Networking', label: t.categoryNetworking, color: 'text-teal-300 hover:bg-teal-900/30' },
    { key: 'Data Science', label: t.categoryData, color: 'text-emerald-300 hover:bg-emerald-900/30' }
  ];

  // Shortcut key CTRL+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('search-input');
        if (input) input.focus();
      }
      if (e.key === 'Escape') {
        setSelectedExp(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter & Search Logic
  const filteredExperiments = useMemo(() => {
    let result = experiments;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(exp => 
        exp.title.toLowerCase().includes(q) || 
        (exp.title_zh && exp.title_zh.toLowerCase().includes(q)) ||
        (exp.description && exp.description.toLowerCase().includes(q)) ||
        (exp.description_zh && exp.description_zh.toLowerCase().includes(q))
      );
    }
    if (currentFilter !== 'all') {
      result = result.filter(exp => exp.category.toLowerCase() === currentFilter.toLowerCase());
    }
    return result;
  }, [searchQuery, currentFilter]);

  // Pagination Logic
  const totalItems = filteredExperiments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  
  const paginatedExperiments = useMemo(() => {
    const startIndex = (activePage - 1) * itemsPerPage;
    return filteredExperiments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredExperiments, activePage]);

  const changePage = (direction: number) => {
    setCurrentPage(prev => {
      const nextPage = prev + direction;
      if (nextPage < 1 || nextPage > totalPages) return prev;
      return nextPage;
    });
  };

  const handleFilterClick = (key: string) => {
    setCurrentFilter(key);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const openExpModal = (exp: any) => {
    setSelectedExp(exp);
    setIframeLoading(true);
  };

  // 3D tilt interaction states and effect is handled natively via CSS or React mouse events
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((centerY - y) / centerY) * 10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transition = 'none';
  };

  return (
    <div className="antialiased min-h-screen bg-[#050505] text-white flex flex-col relative overflow-hidden font-sans">
      {/* Background grids */}
      <div className="fixed top-0 left-0 w-full h-full opacity-5 pointer-events-none z-[-1] bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyBAMAAADsEZWCAAAAGFBMVEUAAAA5OTkAAAAAAAAAAABMTExERERmZmUbbDt1AAAACHRSTlMAMwA3M2YzM2Y0r6QwAAAAQUlEQVQ4y2NgQAX8DIwsCgwMDCz8DCDKyMLA8B+I/wPx/6H4PxD/B+L/QPH/ofg/EP8H4v9A8f+h+D8Q/wfC/wEAxF0v055O01IAAAAASUVORK5CYII=')]" />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">T</div>
            <h1 className="font-semibold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500" data-testid="nav-title">
              {t.navTitle}
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <a href="/" className="text-gray-400 hover:text-white transition-colors text-sm tracking-wider font-mono">
              HOME
            </a>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto w-full flex-grow">
        {/* Hero Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="text-cyan-400 font-mono text-xs uppercase tracking-[0.6em] mb-3 opacity-60">
            Scientific Visualization & Digital Twin
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-wider mb-6" data-testid="hero-title">
            {t.heroTitle}
          </h2>
          <p className="font-mono text-cyan-300/80 text-sm tracking-widest leading-relaxed" dangerouslySetInnerHTML={{ __html: t.heroSubtitle }} />
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-10 relative group">
          <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full opacity-10 group-hover:opacity-30 transition-opacity" />
          <div className="relative flex items-center bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-5 py-2.5 transition-colors hover:border-cyan-500/50">
            <span className="text-cyan-500 mr-3 text-sm">🔍</span>
            <input
              type="text"
              id="search-input"
              data-testid="search-input"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-transparent border-none text-white focus:outline-none font-mono text-sm placeholder-gray-600"
            />
            <div className="text-[10px] text-gray-500 font-mono hidden md:block border-l border-white/10 pl-3 ml-3">
              CTRL+K
            </div>
          </div>
        </div>

        {/* Categories / Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10" data-testid="filter-container">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => handleFilterClick(cat.key)}
              className={`px-5 py-1.5 rounded-full text-xs font-mono border transition-all duration-300 ${
                currentFilter === cat.key
                  ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : `bg-white/5 border-white/10 ${cat.color}`
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="flex justify-between items-center mb-6 px-4 py-2 border-b border-white/10 font-mono text-xs tracking-widest">
          <span className="text-cyan-400" data-testid="category-label">
            {locale === 'en' ? 'CATEGORY: ' : '分类: '}{currentFilter.toUpperCase()}
          </span>
          <span className="text-gray-400" data-testid="experiment-count">
            <span className="text-cyan-400">{filteredExperiments.length}</span> / {experiments.length} {locale === 'en' ? 'ITEMS' : '项'}
          </span>
        </div>

        {/* Experiments Grid */}
        {paginatedExperiments.length === 0 ? (
          <div className="text-gray-500 text-center py-16 border border-white/5 bg-white/[0.02] rounded-xl font-mono text-sm" data-testid="no-simulation">
            {t.noSimulation}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="labs-grid">
            {paginatedExperiments.map((exp: any) => {
              const expTitle = locale === 'zh' ? (exp.title_zh || exp.title) : exp.title;
              let expDesc = locale === 'zh' ? (exp.description_zh || exp.description) : exp.description;
              if (expDesc && expDesc.length > 85) {
                expDesc = expDesc.substring(0, 85) + '...';
              }
              const isEmbed = exp.embeddable !== false;

              return (
                <div
                  key={exp.url}
                  onMouseEnter={handleMouseEnter}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden group transition-all duration-300 hover:bg-white/[0.08]"
                  data-testid="lab-card"
                >
                  <div className="relative h-44 overflow-hidden cursor-pointer" onClick={() => openExpModal(exp)}>
                    <img src={exp.thumbnail} alt={expTitle} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4">
                      <span className="text-[10px] font-mono text-cyan-400 mb-1 block tracking-widest uppercase flex items-center gap-1.5">
                        ⚛️ {exp.category}
                        <span className="px-1.5 py-0.5 border border-cyan-500/30 rounded text-[7px]">
                          {t.digitalTwin}
                        </span>
                        {!isEmbed && <span className="text-orange-400">🔗</span>}
                      </span>
                      <h3 className="font-semibold text-lg text-white group-hover:text-cyan-300 transition-colors">
                        {expTitle}
                      </h3>
                    </div>
                  </div>
                  <div className="p-4 border-t border-white/5">
                    <p className="text-gray-400 text-xs mb-4 h-8 overflow-hidden text-ellipsis leading-relaxed">
                      {expDesc}
                    </p>
                    <button
                      onClick={() => openExpModal(exp)}
                      className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-white border border-cyan-500/20 hover:border-cyan-400/50 rounded-lg py-1.5 font-mono text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      ▶ {t.startLab}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-6 mt-12 font-mono text-xs">
            <button
              onClick={() => changePage(-1)}
              disabled={activePage === 1}
              className="text-cyan-500 hover:text-white disabled:text-gray-700 disabled:cursor-not-allowed transition-colors font-bold"
              data-testid="prev-btn"
            >
              ◀ PREV
            </button>
            <span className="text-gray-400 tracking-wider" data-testid="page-info">
              PAGE {activePage} / {totalPages}
            </span>
            <button
              onClick={() => changePage(1)}
              disabled={activePage === totalPages}
              className="text-cyan-500 hover:text-white disabled:text-gray-700 disabled:cursor-not-allowed transition-colors font-bold"
              data-testid="next-btn"
            >
              NEXT ▶
            </button>
          </div>
        )}
      </main>

      {/* Simulator Modal */}
      {selectedExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8" data-testid="sim-modal">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setSelectedExp(null)} />
          <div className="bg-[#0f0f18] border border-white/10 w-full max-w-5xl h-[80vh] flex flex-col rounded-xl relative overflow-hidden z-10 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-black/20">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <h3 className="font-bold text-sm text-white" data-testid="modal-title">
                  {locale === 'zh' ? (selectedExp.title_zh || selectedExp.title) : selectedExp.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedExp(null)}
                className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-lg px-2.5 py-1 text-xs font-mono"
              >
                ✕ ESC
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-grow w-full bg-black relative">
              {iframeLoading && selectedExp.embeddable !== false && (
                <div className="absolute inset-0 flex items-center justify-center text-cyan-400 font-mono text-xs" data-testid="loader">
                  ⏳ {t.loader}
                </div>
              )}

              {selectedExp.embeddable !== false ? (
                <iframe
                  src={selectedExp.url}
                  data-testid="sim-frame"
                  className="w-full h-full border-none relative z-10"
                  allowFullScreen
                  onLoad={() => setIframeLoading(false)}
                />
              ) : (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 text-center px-4" data-testid="blocked-ui">
                  <span className="text-4xl mb-4">🔗</span>
                  <h4 className="text-lg font-bold text-white mb-2">{t.externalSource}</h4>
                  <p className="text-xs text-gray-400 mb-6 max-w-sm leading-relaxed">
                    {t.notEmbeddable}
                  </p>
                  <button
                    onClick={() => window.open(selectedExp.url, '_blank')}
                    className="px-6 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-cyan-400 rounded-full text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  >
                    {t.launchExternal}
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-2.5 border-t border-white/10 bg-black/20 text-[10px] font-mono text-gray-500 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span>{t.source}: {selectedExp.category}</span>
                <span>{t.status}</span>
              </div>
              <a
                href={selectedExp.url}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
              >
                🪟 {t.newTab}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
