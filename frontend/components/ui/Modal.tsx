"use client";
import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md" 
        onClick={onClose} 
      />
      <div className="relative z-50 w-full max-w-md mx-4 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        style={{ 
          background: 'rgba(22,25,38,0.95)', 
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(30px)'
        }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
