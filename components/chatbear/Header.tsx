import React from 'react';
import Link from 'next/link';
import { Search, Globe, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-bottom border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/chatbear" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 bg-black rounded-xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110">
               {/* Minimal Bear Logo with CSS */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 flex flex-col items-center justify-center">
                  <div className="flex gap-3 -mb-1">
                     <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></div>
                     <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></div>
                  </div>
                  <div className="w-5 h-4 bg-white rounded-t-lg rounded-b-md relative">
                     <div className="absolute top-1 left-1 w-1 h-1 bg-black rounded-full"></div>
                     <div className="absolute top-1 right-1 w-1 h-1 bg-black rounded-full"></div>
                     <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-yellow-400 rounded-full"></div>
                  </div>
               </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter leading-none">ChatBear</span>
              <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">查特熊智能平台</span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-500">
            <Link href="/chatbear/learn" className="hover:text-black transition-colors relative group">
              学堂
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 transition-all group-hover:w-full"></span>
            </Link>
            <Link href="/chatbear/hub" className="hover:text-black transition-colors relative group">
              资源
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 transition-all group-hover:w-full"></span>
            </Link>
            <Link href="/chatbear/lab" className="hover:text-black transition-colors relative group">
              实验室
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 transition-all group-hover:w-full"></span>
            </Link>
            <Link href="/chatbear/community" className="hover:text-black transition-colors relative group">
              社区
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 transition-all group-hover:w-full"></span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 focus-within:border-yellow-400 focus-within:bg-white transition-all">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="搜索 AI 知识..." 
              className="bg-transparent border-none outline-none text-sm w-40 font-medium"
            />
          </div>
          <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-600">
            <Globe size={20} />
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 hover:shadow-lg transition-all active:scale-95">
            <User size={18} />
            <span>登录</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
