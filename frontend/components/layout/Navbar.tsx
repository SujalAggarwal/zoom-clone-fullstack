"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Video, Bell, Search, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

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
        
        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-white/50 hover:text-white/90 hover:bg-white/[0.06] rounded-xl transition-all"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2D8CFF] rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-4 border-b border-gray-800">
                <h3 className="font-semibold text-white">Notifications</h3>
              </div>
              <div className="p-4 text-center">
                <div className="w-12 h-12 bg-white/[0.04] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell size={20} className="text-white/30" />
                </div>
                <p className="text-white/40 text-sm">No new notifications</p>
                <p className="text-white/30 text-xs mt-1">We'll let you know when meetings start.</p>
              </div>
            </div>
          )}
        </div>

        <button onClick={logout} className="p-2 text-white/50 hover:text-red-400 hover:bg-white/[0.06] rounded-xl transition-all" title="Logout">
          <LogOut size={18} />
        </button>
        <div className="ml-1 w-8 h-8 rounded-xl bg-gradient-to-br from-[#2D8CFF] to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg" title={user.name}>
          {user.name.substring(0, 2).toUpperCase()}
        </div>
      </div>
    </nav>
  );
}
