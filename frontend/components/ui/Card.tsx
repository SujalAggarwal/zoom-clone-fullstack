import React from 'react';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export function Card({ children, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-100/50 overflow-hidden ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
