import React, { useState } from 'react';
import { Shield, Info, Copy, Check } from 'lucide-react';

export default function MeetingHeader({ title, code, inviteLink }: { title: string, code: string, inviteLink?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 text-white">
      <div className="flex items-center gap-3">
        <div className="bg-green-500/20 text-green-400 p-1.5 rounded">
          <Shield size={16} />
        </div>
        <div className="font-medium text-sm flex items-center gap-2">
          {title}
          <button className="text-gray-400 hover:text-white transition">
            <Info size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-400 bg-gray-800 px-2 py-1 rounded">Code: {code}</span>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded transition"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy invite link'}
        </button>
      </div>
    </header>
  );
}
