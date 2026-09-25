import React from 'react';
import Link from 'next/link';
import { Settings, Video, Bell, Search } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/[0.06] h-[60px] flex items-center px-6" 
         style={{ background: 'rgba(15,17,23,0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="flex-1 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-xl blur-md opacity-50"></div>
            <div className="relative bg-gradient-to-br from-[#2D8CFF] to-[#1a6fd4] p-2 rounded-xl flex items-center justify-center shadow-lg">
              <Video size={18} className="text-white fill-white" />
            </div>
          </div>
          <span className="text-[20px] font-bold tracking-tight text-white">zoom<span className="text-[#2D8CFF]">.</span></span>
        </Link>
      </div>

      <div className="hidden md:flex flex-1 max-w-xs mx-4">
        <div className="relative w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input 
            placeholder="Search meetings..." 
            className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl py-2 pl-9 pr-4 text-sm text-white/70 placeholder-white/30 focus:outline-none focus:border-[#2D8CFF]/50 focus:bg-white/[0.08] transition-all"
          />
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-end gap-2">
        <button className="relative p-2 text-white/50 hover:text-white/90 hover:bg-white/[0.06] rounded-xl transition-all">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2D8CFF] rounded-full"></span>
        </button>
        <button className="p-2 text-white/50 hover:text-white/90 hover:bg-white/[0.06] rounded-xl transition-all">
          <Settings size={18} />
        </button>
        <div className="ml-1 w-8 h-8 rounded-xl bg-gradient-to-br from-[#2D8CFF] to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg cursor-pointer">
          AM
        </div>
      </div>
    </nav>
  );
}
