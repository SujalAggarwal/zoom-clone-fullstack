import React from 'react';
import { Mic, MicOff, Video, VideoOff, Share, Smile, MoreHorizontal, PhoneOff, Users, MessageSquare } from 'lucide-react';

interface ControlsProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleParticipants: () => void;
  onToggleChat: () => void;
  unreadChatCount?: number;
  onSendReaction: (reaction: string) => void;
  onLeave: () => void;
}

export default function MeetingControls({ isMuted, isVideoOff, isScreenSharing, onToggleMute, onToggleVideo, onToggleScreenShare, onToggleParticipants, onToggleChat, unreadChatCount = 0, onSendReaction, onLeave }: ControlsProps) {
  const [showReactions, setShowReactions] = React.useState(false);
  const [showMore, setShowMore] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  
  const moreRef = React.useRef<HTMLDivElement>(null);
  const reactionsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setShowMore(false);
      }
      if (reactionsRef.current && !reactionsRef.current.contains(event.target as Node)) {
        setShowReactions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const reactionsList = ["👍", "❤️", "😂", "😮", "👏", "🎉"];
  return (
    <footer className="h-16 sm:h-20 bg-gray-900 border-t border-gray-800 flex items-center justify-between px-3 sm:px-6 text-white">
      {/* Left side / status indicators */}
      <div className="hidden lg:flex shrink-0 w-24 items-center">
        {isRecording && (
          <div className="flex items-center gap-1.5 bg-red-500/10 text-red-400 px-2.5 py-1.5 rounded-lg border border-red-500/20 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-[10px] font-bold uppercase tracking-wider">REC</span>
          </div>
        )}
      </div>

      {/* Core controls - always visible */}
      <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-center">
        {/* Mute */}
        <button
          onClick={onToggleMute}
          className="flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 hover:bg-gray-800 rounded-xl transition text-gray-300 hover:text-white"
        >
          {isMuted ? <MicOff size={20} className="mb-0.5 text-red-500" /> : <Mic size={20} className="mb-0.5" />}
          <span className="text-[9px] sm:text-[10px]">{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>

        {/* Video */}
        <button
          onClick={onToggleVideo}
          className="flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 hover:bg-gray-800 rounded-xl transition text-gray-300 hover:text-white"
        >
          {isVideoOff ? <VideoOff size={20} className="mb-0.5 text-red-500" /> : <Video size={20} className="mb-0.5" />}
          <span className="text-[9px] sm:text-[10px]">{isVideoOff ? 'Start Video' : 'Stop Video'}</span>
        </button>

        <div className="w-px h-7 bg-gray-700 mx-1 sm:mx-2" />

        {/* Participants */}
        <button
          onClick={onToggleParticipants}
          className="flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 hover:bg-gray-800 rounded-xl transition text-gray-300 hover:text-white"
        >
          <Users size={20} className="mb-0.5" />
          <span className="text-[9px] sm:text-[10px]">Participants</span>
        </button>

        {/* Chat */}
        <button
          onClick={onToggleChat}
          className="relative flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 hover:bg-gray-800 rounded-xl transition text-gray-300 hover:text-white"
        >
          <div className="relative">
            <MessageSquare size={20} className="mb-0.5" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white border border-gray-900">
                {unreadChatCount > 9 ? '9+' : unreadChatCount}
              </span>
            )}
          </div>
          <span className="text-[9px] sm:text-[10px]">Chat</span>
        </button>

        {/* Share */}
        <button 
          onClick={onToggleScreenShare}
          className={`flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl transition hover:text-white ${isScreenSharing ? 'bg-green-500/20 text-green-400' : 'hover:bg-gray-800 text-gray-300'}`}
        >
          <Share size={20} className={`mb-0.5 ${isScreenSharing ? 'text-green-400' : 'text-green-400'}`} />
          <span className="text-[9px] sm:text-[10px]">{isScreenSharing ? 'Stop Share' : 'Share'}</span>
        </button>

        {/* Reactions */}
        <div className="relative flex" ref={reactionsRef}>
          {showReactions && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-2xl p-2 flex gap-1 shadow-2xl">
              {reactionsList.map(r => (
                <button
                  key={r}
                  onClick={() => {
                    onSendReaction(r);
                    setShowReactions(false);
                  }}
                  className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-white/10 rounded-xl transition-colors hover:scale-110 active:scale-95"
                >
                  {r}
                </button>
              ))}
            </div>
          )}
          <button 
            onClick={() => setShowReactions(!showReactions)}
            className="flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 hover:bg-gray-800 rounded-xl transition text-gray-300 hover:text-white"
          >
            <Smile size={20} className="mb-0.5" />
            <span className="text-[9px] sm:text-[10px]">Reactions</span>
          </button>
        </div>

        {/* More */}
        <div className="relative flex" ref={moreRef}>
          {showMore && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-800 border border-gray-700 rounded-2xl py-2 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <button 
                onClick={() => {
                  setIsRecording(!isRecording);
                  setShowMore(false);
                }} 
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <span>{isRecording ? 'Stop Recording' : 'Record Meeting'}</span>
                {isRecording && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>}
              </button>
              <button 
                onClick={() => {
                  alert("Live Transcript is currently processing audio...");
                  setShowMore(false);
                }} 
                className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                Live Transcript
              </button>
              <button 
                onClick={() => {
                  alert("Virtual Backgrounds require a Pro plan subscription.");
                  setShowMore(false);
                }} 
                className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                Virtual Background
              </button>
              <div className="h-px bg-white/10 my-1"></div>
              <button 
                onClick={() => {
                  alert("Advanced Meeting Settings opened.");
                  setShowMore(false);
                }} 
                className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                Meeting Settings
              </button>
            </div>
          )}
          <button 
            onClick={() => setShowMore(!showMore)}
            className="flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 hover:bg-gray-800 rounded-xl transition text-gray-300 hover:text-white"
          >
            <MoreHorizontal size={20} className="mb-0.5" />
            <span className="text-[9px] sm:text-[10px]">More</span>
          </button>
        </div>
      </div>

      {/* Leave button - always visible, right side */}
      <div className="shrink-0 w-24 flex justify-end">
        <button
          onClick={onLeave}
          className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1.5 sm:gap-2 transition min-h-[40px]"
        >
          <PhoneOff size={15} />
          <span className="hidden xs:inline sm:inline">Leave</span>
        </button>
      </div>
    </footer>
  );
}
