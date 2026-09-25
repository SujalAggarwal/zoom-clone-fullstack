import React, { useRef, useEffect } from 'react';
import { RemoteParticipant } from '@/lib/useWebRTC';

function VideoTile({ stream, name, isLocal = false }: { stream: MediaStream | null, name: string, isLocal?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center w-full h-full aspect-video border border-gray-700 shadow-sm">
      {stream ? (
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted={isLocal}
          className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`} 
        />
      ) : (
        <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center text-2xl font-semibold text-gray-300">
          {name.substring(0, 2).toUpperCase()}
        </div>
      )}
      <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded-md text-xs font-medium text-white backdrop-blur-sm shadow">
        {name} {isLocal ? '(You)' : ''}
      </div>
    </div>
  );
}

export default function VideoGrid({ localStream, remoteParticipants, localName }: { localStream: MediaStream | null, remoteParticipants: RemoteParticipant[], localName: string }) {
  const count = remoteParticipants.length + 1;
  let gridClass = "grid gap-4 w-full max-w-6xl mx-auto h-full p-4 items-center justify-center ";
  
  if (count === 1) gridClass += "grid-cols-1";
  else if (count === 2) gridClass += "grid-cols-1 md:grid-cols-2";
  else if (count <= 4) gridClass += "grid-cols-2";
  else gridClass += "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <div className={gridClass}>
      <VideoTile stream={localStream} name={localName} isLocal={true} />
      {remoteParticipants.map(p => (
        <VideoTile key={p.id} stream={p.stream} name={p.name} />
      ))}
    </div>
  );
}
