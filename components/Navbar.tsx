'use client';

import React, { useState, useEffect } from 'react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Trigger initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Courses', href: '/learn.html' },
    { name: 'Labs', href: '/labs.html' },
    { name: 'Wiki', href: '/wiki.html' }
  ];

  return (
    <nav
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 h-16 z-50 transition-all duration-300 flex items-center ${
        isScrolled
          ? 'backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">
            T
          </div>
          <span className="font-bold text-xl text-gray-900 dark:text-white">
            Tech <span className="text-indigo-500 dark:text-indigo-400">Odyssey</span>
          </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              data-testid={`nav-link-${link.name.toLowerCase()}`}
              className="relative py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-white transition-all duration-300 hover:scale-105 group outline-none"
            >
              <span>{link.name}</span>
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-indigo-500 transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-4">
          <button
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle Theme"
          >
            🌙
          </button>
        </div>
      </div>
    </nav>
  );
}
