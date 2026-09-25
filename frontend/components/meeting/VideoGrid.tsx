import React, { useRef, useEffect } from 'react';
import { RemoteParticipant } from '@/lib/useWebRTC';

function VideoTile({ stream, name, isLocal = false, isScreenSharing = false }: { stream: MediaStream | null, name: string, isLocal?: boolean, isScreenSharing?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.error("Auto-play failed:", e));
    }
  }, [stream]);

  return (
    <div className="relative bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center w-full border border-gray-700 shadow-sm" style={{ aspectRatio: '16/9' }}>
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full ${isScreenSharing ? 'object-contain' : 'object-cover'} ${isLocal && !isScreenSharing ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gray-700 rounded-full flex items-center justify-center text-xl sm:text-2xl font-semibold text-gray-300">
          {name.substring(0, 2).toUpperCase()}
        </div>
      )}
      <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-black/60 px-2 py-0.5 sm:py-1 rounded-md text-xs font-medium text-white backdrop-blur-sm shadow">
        {name} {isLocal ? '(You)' : ''}
      </div>
    </div>
  );
}

export default function VideoGrid({ localStream, remoteParticipants, localName, isScreenSharing = false }: {
  localStream: MediaStream | null,
  remoteParticipants: RemoteParticipant[],
  localName: string,
  isScreenSharing?: boolean
}) {
  const count = remoteParticipants.length + 1;

  // Responsive grid: mobile=1col, sm=2col for 2+ participants
  let gridClass = "grid gap-2 sm:gap-4 w-full h-full p-2 sm:p-4 content-center ";

  if (count === 1) {
    gridClass += "grid-cols-1 max-w-2xl mx-auto";
  } else if (count === 2) {
    // Mobile: stack vertically, sm+: side by side
    gridClass += "grid-cols-1 sm:grid-cols-2";
  } else if (count <= 4) {
    gridClass += "grid-cols-2";
  } else {
    gridClass += "grid-cols-2 md:grid-cols-3";
  }

  return (
    <div className="flex-1 overflow-auto bg-black flex items-center justify-center">
      <div className={gridClass}>
        <VideoTile stream={localStream} name={localName} isLocal={true} isScreenSharing={isScreenSharing} />
        {remoteParticipants.map(p => (
          <VideoTile key={p.id} stream={p.stream} name={p.name} />
        ))}
      </div>
    </div>
  );
}
