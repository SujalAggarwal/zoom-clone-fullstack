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

        {/* Share - hidden on very small screens */}
        <button className="hidden sm:flex flex-col items-center justify-center w-14 h-14 hover:bg-gray-800 rounded-xl transition text-gray-300 hover:text-white">
          <Share size={20} className="mb-0.5 text-green-400" />
          <span className="text-[10px]">Share</span>
        </button>

        {/* Reactions - hidden on small screens */}
        <button className="hidden md:flex flex-col items-center justify-center w-14 h-14 hover:bg-gray-800 rounded-xl transition text-gray-300 hover:text-white">
          <Smile size={20} className="mb-0.5" />
          <span className="text-[10px]">Reactions</span>
        </button>

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
