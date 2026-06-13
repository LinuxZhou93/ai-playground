import React from 'react';
import Link from 'next/link';
import { Search, Globe, User, Shield } from 'lucide-react';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-md border-b border-gray-100/80 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/chatbear" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 bg-black rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,123,255,0.4)]">
               {/* Minimal Bear Logo with CSS - Upgraded */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 flex flex-col items-center justify-center">
                  <div className="flex gap-4 -mb-1">
                     <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse"></div>
                     <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="w-6 h-5 bg-white rounded-t-lg rounded-b-md relative shadow-inner">
                     <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-black rounded-full transition-transform group-hover:scale-125"></div>
                     <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-black rounded-full transition-transform group-hover:scale-125"></div>
                     <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-1 bg-yellow-400 rounded-full"></div>
                  </div>
               </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight leading-none bg-gradient-to-r from-black via-gray-800 to-blue-600 bg-clip-text text-transparent group-hover:text-blue-600 transition-colors">
                ChatBear
              </span>
              <span className="text-[9px] font-black text-blue-500 tracking-[0.25em] uppercase mt-1">
                查特熊智能平台
              </span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-10 text-[14px] font-black text-gray-500">
            <Link href="/chatbear/learn" className="hover:text-black transition-colors relative py-2 group">
              学堂
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-blue-600 rounded-full transition-all duration-300 group-hover:w-6"></span>
            </Link>
            <Link href="/chatbear/hub" className="hover:text-black transition-colors relative py-2 group">
              资源
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-blue-600 rounded-full transition-all duration-300 group-hover:w-6"></span>
            </Link>
            <Link href="/chatbear/lab" className="hover:text-black transition-colors relative py-2 group">
              实验室
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-blue-600 rounded-full transition-all duration-300 group-hover:w-6"></span>
            </Link>
            <Link href="/chatbear/community" className="hover:text-black transition-colors relative py-2 group">
              社区
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-blue-600 rounded-full transition-all duration-300 group-hover:w-6"></span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 focus-within:border-blue-500 focus-within:bg-white transition-all shadow-inner">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="搜索 AI 与具身智能..." 
              className="bg-transparent border-none outline-none text-xs w-48 font-bold text-gray-800 placeholder-gray-400"
            />
          </div>
          <button className="p-3 hover:bg-gray-100/80 rounded-xl transition-colors text-gray-600 active:scale-95">
            <Globe size={18} />
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl text-xs font-black hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all active:scale-95">
            <User size={14} />
            <span>加入社区</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
