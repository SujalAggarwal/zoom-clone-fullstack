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
  onSendReaction: (reaction: string) => void;
  onLeave: () => void;
}

export default function MeetingControls({ isMuted, isVideoOff, isScreenSharing, onToggleMute, onToggleVideo, onToggleScreenShare, onToggleParticipants, onToggleChat, onSendReaction, onLeave }: ControlsProps) {
  const [showReactions, setShowReactions] = React.useState(false);
  const reactionsList = ["👍", "❤️", "😂", "😮", "👏", "🎉"];
  return (
    <footer className="h-16 sm:h-20 bg-gray-900 border-t border-gray-800 flex items-center justify-between px-3 sm:px-6 text-white">
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
          className="flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 hover:bg-gray-800 rounded-xl transition text-gray-300 hover:text-white"
        >
          <MessageSquare size={20} className="mb-0.5" />
          <span className="text-[9px] sm:text-[10px]">Chat</span>
        </button>

        {/* Share - hidden on very small screens */}
        <button 
          onClick={onToggleScreenShare}
          className={`hidden sm:flex flex-col items-center justify-center w-14 h-14 rounded-xl transition hover:text-white ${isScreenSharing ? 'bg-green-500/20 text-green-400' : 'hover:bg-gray-800 text-gray-300'}`}
        >
          <Share size={20} className={`mb-0.5 ${isScreenSharing ? 'text-green-400' : 'text-green-400'}`} />
          <span className="text-[10px]">{isScreenSharing ? 'Stop Share' : 'Share'}</span>
        </button>

        {/* Reactions - hidden on small screens */}
        <div className="relative hidden md:block">
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
            className="flex flex-col items-center justify-center w-14 h-14 hover:bg-gray-800 rounded-xl transition text-gray-300 hover:text-white"
          >
            <Smile size={20} className="mb-0.5" />
            <span className="text-[10px]">Reactions</span>
          </button>
        </div>

        {/* More - hidden on small screens */}
        <button className="hidden md:flex flex-col items-center justify-center w-14 h-14 hover:bg-gray-800 rounded-xl transition text-gray-300 hover:text-white">
          <MoreHorizontal size={20} className="mb-0.5" />
          <span className="text-[10px]">More</span>
        </button>
      </div>

      {/* Leave button - always visible, right side */}
      <div className="shrink-0">
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
