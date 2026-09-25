import React, { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { ChatMessage } from '@/lib/useWebRTC';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  localClientId: string;
}

export default function ChatPanel({ isOpen, onClose, messages, onSendMessage, localClientId }: ChatPanelProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <>
      <div
        className="md:hidden fixed inset-0 z-30 bg-black/50"
        onClick={onClose}
      />
      <div className="
        fixed inset-x-0 bottom-0 z-40 h-[70vh]
        md:relative md:inset-auto md:h-full md:w-80 md:z-auto
        bg-gray-950 border-t md:border-t-0 md:border-l border-white/[0.06]
        flex flex-col rounded-t-2xl md:rounded-none
        shadow-2xl md:shadow-none
        transition-all
      ">
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/[0.06] shrink-0">
          <div className="md:hidden absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/20 rounded-full" />
          <h3 className="font-semibold text-sm text-white/90">Meeting Chat</h3>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white hover:bg-white/[0.08] p-1.5 rounded-lg transition-all"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/30 text-sm">
              No messages yet
            </div>
          ) : (
            messages.map((msg) => {
              const isLocal = msg.senderId === localClientId;
              return (
                <div key={msg.id} className={`flex flex-col ${isLocal ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-white/40 mb-1">{isLocal ? 'You' : msg.senderName}</span>
                  <div className={`px-3 py-2 rounded-xl text-sm max-w-[85%] break-words ${
                    isLocal 
                      ? 'bg-[#2D8CFF] text-white rounded-br-none' 
                      : 'bg-white/[0.08] text-white/90 rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t border-white/[0.06] bg-gray-950 shrink-0">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2D8CFF]/50 transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-[#2D8CFF] hover:bg-[#1a6fd4] disabled:opacity-50 disabled:hover:bg-[#2D8CFF] text-white p-2 rounded-xl transition-colors flex items-center justify-center shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
