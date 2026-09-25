import React from 'react';

export function Avatar({ name, className = '' }: { name: string, className?: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
    
  return (
    <div className={`flex items-center justify-center bg-zoom-blue text-white rounded-full font-medium shadow-sm ${className}`} style={{ width: '40px', height: '40px' }}>
      {initials}
    </div>
  );
}
