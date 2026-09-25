import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
}

export function IconButton({ icon, className = '', ...props }: IconButtonProps) {
  return (
    <button 
      className={`p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-zoom-blue ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
}
