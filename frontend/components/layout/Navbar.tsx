import React from 'react';
import Link from 'next/link';
import { Settings, Video } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { IconButton } from '../ui/IconButton';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 h-[60px] flex items-center px-6">
      <div className="flex-1 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-zoom-blue p-1.5 rounded-lg flex items-center justify-center">
            <Video size={20} className="text-white fill-white" />
          </div>
          <span className="text-[22px] font-semibold tracking-tight" style={{ color: '#2D8CFF' }}>zoom</span>
        </Link>
      </div>
      
      <div className="flex-1 flex items-center justify-end gap-3">
        <IconButton icon={<Settings size={20} />} aria-label="Settings" />
        <Avatar name="Alex Morgan" />
      </div>
    </nav>
  );
}
