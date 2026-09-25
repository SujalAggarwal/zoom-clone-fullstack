"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getMeetingByCode } from '@/lib/api';
import { Meeting } from '@/types/meeting';
import MeetingHeader from '@/components/meeting/MeetingHeader';
import MeetingControls from '@/components/meeting/MeetingControls';
import VideoGrid from '@/components/meeting/VideoGrid';
import ParticipantsPanel from '@/components/meeting/ParticipantsPanel';
import ChatPanel from '@/components/meeting/ChatPanel';
import { Button } from '@/components/ui/Button';
import { useWebRTC } from '@/lib/useWebRTC';

export default function MeetingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHost, setIsHost] = useState(false);

  const localName = useMemo(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('joinName') || 'Alex Morgan';
    }
    return 'Alex Morgan';
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMeetingByCode(code);
        setMeeting(data);
      } catch (err) {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }
    if (code) load();
  }, [code]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsHost(sessionStorage.getItem('isHost') === 'true');
    }
  }, []);

  const { localStream, remoteParticipants, isMuted, isVideoOff, toggleMute, toggleVideo, leave, error: rtcError, wasRemoved, clientId, messages, sendChatMessage } = useWebRTC(code, localName);

  useEffect(() => {
    if (wasRemoved) {
      alert("You were removed from the meeting.");
      router.push('/');
    }
  }, [wasRemoved, router]);

  const handleLeave = () => {
    leave();
    router.push('/');
  };

  const handleMuteAll = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/meetings/${code}/mute-all`, { method: 'POST' });
    } catch(err) {}
  };

  const handleMuteUser = async (targetClientId: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/meetings/${code}/participants/${targetClientId}/mute`, { method: 'POST' });
    } catch(err) {}
  };

  const handleVideoOffUser = async (targetClientId: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/meetings/${code}/participants/${targetClientId}/video-off`, { method: 'POST' });
    } catch(err) {}
  };

  const handleRemove = async (targetClientId: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/meetings/${code}/participants/${targetClientId}/remove`, { method: 'POST' });
    } catch(err) {}
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="w-8 h-8 border-4 border-zoom-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#F7F8FA] text-center p-6">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">Meeting Not Found</h1>
        <p className="text-gray-500 mb-6">The meeting code you entered is invalid or the meeting has ended.</p>
        <Button onClick={() => router.push('/')}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
      <MeetingHeader title={meeting.title} code={meeting.meeting_code} inviteLink={meeting.invite_link} />
      
      {rtcError && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg z-50 shadow-lg text-sm">
          {rtcError}
        </div>
      )}

      <main className="flex-1 relative flex overflow-hidden bg-black">
        <div className="flex-1 relative flex flex-col overflow-hidden">
          <VideoGrid localStream={localStream} remoteParticipants={remoteParticipants} localName={localName} />
        </div>
        <ParticipantsPanel 
          isOpen={isParticipantsOpen} 
          onClose={() => setIsParticipantsOpen(false)}
          isHost={isHost}
          localName={localName}
          localClientId={clientId}
          remoteParticipants={remoteParticipants}
          onMuteAll={handleMuteAll}
          onMuteUser={handleMuteUser}
          onVideoOffUser={handleVideoOffUser}
          onRemove={handleRemove}
        />
        <ChatPanel 
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={messages}
          onSendMessage={sendChatMessage}
          localClientId={clientId}
        />
      </main>

      <MeetingControls 
        isMuted={isMuted} 
        isVideoOff={isVideoOff} 
        isScreenSharing={isScreenSharing}
        onToggleMute={toggleMute} 
        onToggleVideo={toggleVideo} 
        onToggleScreenShare={toggleScreenShare}
        onToggleParticipants={() => {
          setIsParticipantsOpen(!isParticipantsOpen);
          if (!isParticipantsOpen) setIsChatOpen(false);
        }}
        onToggleChat={() => {
          setIsChatOpen(!isChatOpen);
          if (!isChatOpen) setIsParticipantsOpen(false);
        }}
        onLeave={handleLeave} 
      />
    </div>
  );
}
