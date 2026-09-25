import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', id, ...props }: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-white/50 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className="px-4 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#2D8CFF]/50 focus:border-[#2D8CFF]/50 focus:bg-white/[0.08] transition-all"
        {...props}
      />
    </div>
  );
}
