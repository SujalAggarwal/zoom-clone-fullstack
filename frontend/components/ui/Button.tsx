import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  children, 
  className = '', 
  variant = 'primary', 
  size = 'md', 
  ...props 
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[#2D8CFF] hover:bg-[#1a6fd4] text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30',
    secondary: 'bg-white/[0.07] hover:bg-white/[0.12] text-white/80 border border-white/[0.1] hover:border-white/[0.2]',
    ghost: 'bg-transparent hover:bg-white/[0.06] text-white/60 hover:text-white',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
