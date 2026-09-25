import React from 'react';
import { Mic, MicOff, Video, VideoOff, Share, Smile, MoreHorizontal, PhoneOff, Users } from 'lucide-react';

interface ControlsProps {
  isMuted: boolean;
  isVideoOff: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleParticipants: () => void;
  onLeave: () => void;
}

export default function MeetingControls({ isMuted, isVideoOff, onToggleMute, onToggleVideo, onToggleParticipants, onLeave }: ControlsProps) {
  return (
    <footer className="h-20 bg-gray-900 border-t border-gray-800 flex items-center justify-center px-4 text-white relative">
      <div className="flex items-center gap-2 md:gap-4">
        <button onClick={onToggleMute} className="flex flex-col items-center justify-center w-14 h-14 hover:bg-gray-800 rounded-xl transition text-gray-300 hover:text-white">
          {isMuted ? <MicOff size={24} className="mb-1 text-red-500" /> : <Mic size={24} className="mb-1" />}
          <span className="text-[10px]">{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>
        <button onClick={onToggleVideo} className="flex flex-col items-center justify-center w-14 h-14 hover:bg-gray-800 rounded-xl transition text-gray-300 hover:text-white">
          {isVideoOff ? <VideoOff size={24} className="mb-1 text-red-500" /> : <Video size={24} className="mb-1" />}
          <span className="text-[10px]">{isVideoOff ? 'Start Video' : 'Stop Video'}</span>
        </button>
        
        <div className="w-px h-8 bg-gray-700 mx-2"></div>
        
        <button onClick={onToggleParticipants} className="flex flex-col items-center justify-center w-14 h-14 hover:bg-gray-800 rounded-xl transition text-gray-300 hover:text-white">
          <Users size={24} className="mb-1" />
          <span className="text-[10px]">Participants</span>
        </button>
        <button className="flex flex-col items-center justify-center w-14 h-14 hover:bg-gray-800 rounded-xl transition text-gray-300 hover:text-white">
          <Share size={24} className="mb-1 text-green-400" />
          <span className="text-[10px]">Share</span>
        </button>
        <button className="flex flex-col items-center justify-center w-14 h-14 hover:bg-gray-800 rounded-xl transition text-gray-300 hover:text-white">
          <Smile size={24} className="mb-1" />
          <span className="text-[10px]">Reactions</span>
        </button>
        <button className="flex flex-col items-center justify-center w-14 h-14 hover:bg-gray-800 rounded-xl transition text-gray-300 hover:text-white">
          <MoreHorizontal size={24} className="mb-1" />
          <span className="text-[10px]">More</span>
        </button>
      </div>
      
      <div className="absolute right-6">
        <button onClick={onLeave} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition">
          <PhoneOff size={16} />
          Leave
        </button>
      </div>
    </footer>
  );
}
