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
    <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-3 sm:px-4 text-white overflow-hidden">
      {/* Left: shield + title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <div className="bg-green-500/20 text-green-400 p-1.5 rounded shrink-0">
          <Shield size={16} />
        </div>
        <div className="font-medium text-sm flex items-center gap-1.5 min-w-0">
          <span className="truncate max-w-[120px] sm:max-w-[260px] md:max-w-none">{title}</span>
          <button className="text-gray-400 hover:text-white transition shrink-0">
            <Info size={14} />
          </button>
        </div>
      </div>

      {/* Right: code + copy */}
      <div className="flex items-center gap-2 sm:gap-4 text-sm shrink-0 ml-2">
        {/* Code badge: hidden on very small, visible on sm+ */}
        <span className="hidden sm:inline text-gray-400 bg-gray-800 px-2 py-1 rounded text-xs whitespace-nowrap">
          Code: {code}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-2 sm:px-3 py-1.5 rounded transition min-h-[36px]"
          title="Copy invite link"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          {/* Show text only on sm+ */}
          <span className="hidden sm:inline text-xs">{copied ? 'Copied' : 'Copy invite link'}</span>
        </button>
      </div>
    </header>
  );
}
