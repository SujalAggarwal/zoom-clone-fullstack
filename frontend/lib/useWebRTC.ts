import { useEffect, useRef, useState, useCallback } from 'react';

export interface RemoteParticipant {
  id: string;
  name: string;
  stream: MediaStream | null;
}

export function useWebRTC(meetingCode: string, displayName: string) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<Map<string, RemoteParticipant>>(new Map());
  const [error, setError] = useState<string | null>(null);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [wasRemoved, setWasRemoved] = useState(false);

  const ws = useRef<WebSocket | null>(null);
  const peers = useRef<Map<string, RTCPeerConnection>>(new Map());
  const clientId = useRef<string>(Math.random().toString(36).substring(7));
  const isInitializing = useRef(false);

  const addParticipant = useCallback((id: string, name: string) => {
    setRemoteParticipants(prev => {
      if (prev.has(id)) return prev;
      const next = new Map(prev);
      next.set(id, { id, name, stream: null });
      return next;
    });
  }, []);

  const removeParticipant = useCallback((id: string) => {
    setRemoteParticipants(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
    if (peers.current.has(id)) {
      peers.current.get(id)?.close();
      peers.current.delete(id);
    }
  }, []);

  const setRemoteStream = useCallback((id: string, stream: MediaStream) => {
    setRemoteParticipants(prev => {
      const p = prev.get(id);
      if (!p) return prev;
      const next = new Map(prev);
      next.set(id, { ...p, stream });
      return next;
    });
  }, []);

  const createPeerConnection = useCallback((targetId: string, stream: MediaStream, isInitiator: boolean) => {
    if (peers.current.has(targetId)) return peers.current.get(targetId)!;
    
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.onicecandidate = (event) => {
      if (event.candidate && ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          type: 'ice-candidate',
          target: targetId,
          candidate: event.candidate
        }));
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(targetId, event.streams[0]);
      }
    };

    peers.current.set(targetId, pc);

    if (isInitiator) {
      pc.createOffer().then(offer => {
        return pc.setLocalDescription(offer);
      }).then(() => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({
            type: 'offer',
            target: targetId,
            sdp: pc.localDescription
          }));
        }
      }).catch(console.error);
    }

    return pc;
  }, [setRemoteStream]);

  const initWebRTC = useCallback(async () => {
    if (isInitializing.current) return;
    isInitializing.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      
      const wsUrl = process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws') || 'ws://localhost:8000';
      const socket = new WebSocket(`${wsUrl}/ws/meeting/${meetingCode}?client_id=${clientId.current}&display_name=${encodeURIComponent(displayName)}`);
      ws.current = socket;

      socket.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        
        if (msg.type === 'user-joined') {
          addParticipant(msg.client_id, msg.display_name);
          createPeerConnection(msg.client_id, stream, true);
        } else if (msg.type === 'user-left') {
          removeParticipant(msg.client_id);
        } else if (msg.type === 'offer') {
          addParticipant(msg.sender, msg.display_name || 'User');
          const pc = createPeerConnection(msg.sender, stream, false);
          await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'answer', target: msg.sender, sdp: answer }));
          }
        } else if (msg.type === 'answer') {
          const pc = peers.current.get(msg.sender);
          if (pc) await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        } else if (msg.type === 'ice-candidate') {
          const pc = peers.current.get(msg.sender);
          if (pc && msg.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(msg.candidate)).catch(console.error);
          }
        } else if (msg.type === 'force-mute') {
          if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
              audioTrack.enabled = false;
              setIsMuted(true);
            }
          }
        } else if (msg.type === 'force-remove') {
          setWasRemoved(true);
        }
      };

    } catch (err) {
      setError("Failed to access camera/mic. Please allow permissions.");
    }
  }, [meetingCode, displayName, addParticipant, removeParticipant, createPeerConnection]);

  useEffect(() => {
    initWebRTC();
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
      }
      if (ws.current) {
        ws.current.close();
      }
      peers.current.forEach(pc => pc.close());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const leave = () => {
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    if (ws.current) ws.current.close();
    peers.current.forEach(pc => pc.close());
    setLocalStream(null);
    setRemoteParticipants(new Map());
  };

  return {
    localStream,
    remoteParticipants: Array.from(remoteParticipants.values()),
    isMuted,
    isVideoOff,
    toggleMute,
    toggleVideo,
    leave,
    error,
    wasRemoved,
    clientId: clientId.current
  };
}
