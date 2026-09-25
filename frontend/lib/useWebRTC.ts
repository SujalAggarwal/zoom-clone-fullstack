import { useEffect, useRef, useState, useCallback } from 'react';

export interface RemoteParticipant {
  id: string;
  name: string;
  stream: MediaStream | null;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface ReactionMessage {
  id: string;
  senderId: string;
  reaction: string;
  timestamp: number;
}

export function useWebRTC(meetingCode: string, displayName: string) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<Map<string, RemoteParticipant>>(new Map());
  const [error, setError] = useState<string | null>(null);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [wasRemoved, setWasRemoved] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<ReactionMessage[]>([]);

  const ws = useRef<WebSocket | null>(null);
  const peers = useRef<Map<string, RTCPeerConnection>>(new Map());
  const clientId = useRef<string>(Math.random().toString(36).substring(7));
  const isInitializing = useRef(false);

  const pendingCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

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
    pendingCandidates.current.delete(id);
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
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:openrelay.metered.ca:443',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:openrelay.metered.ca:443?transport=tcp',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        }
      ]
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
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const wsUrl = apiUrl.replace(/^https/, 'wss').replace(/^http/, 'ws');
      const socket = new WebSocket(`${wsUrl}/ws/meeting/${meetingCode}?client_id=${clientId.current}&display_name=${encodeURIComponent(displayName)}`);
      ws.current = socket;

      socket.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        
        if (msg.type === 'user-joined') {
          // Existing user: I am already here, new person joined → I create offer
          addParticipant(msg.client_id, msg.display_name);
          createPeerConnection(msg.client_id, stream, true);
        } else if (msg.type === 'user-exists') {
          // I just joined: existing person is here → just add them, wait for their offer
          addParticipant(msg.client_id, msg.display_name);
        } else if (msg.type === 'user-left') {
          removeParticipant(msg.client_id);
        } else if (msg.type === 'offer') {
          addParticipant(msg.sender, msg.display_name || 'User');
          const pc = createPeerConnection(msg.sender, stream, false);
          await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          
          // Add queued candidates
          const queued = pendingCandidates.current.get(msg.sender) || [];
          for (const candidate of queued) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
          }
          pendingCandidates.current.delete(msg.sender);

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'answer', target: msg.sender, sdp: answer }));
          }
        } else if (msg.type === 'answer') {
          const pc = peers.current.get(msg.sender);
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            // Add queued candidates
            const queued = pendingCandidates.current.get(msg.sender) || [];
            for (const candidate of queued) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
            }
            pendingCandidates.current.delete(msg.sender);
          }
        } else if (msg.type === 'ice-candidate') {
          const pc = peers.current.get(msg.sender);
          if (pc && pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(msg.candidate)).catch(console.error);
          } else {
            // Queue candidate
            const queued = pendingCandidates.current.get(msg.sender) || [];
            queued.push(msg.candidate);
            pendingCandidates.current.set(msg.sender, queued);
          }
        } else if (msg.type === 'force-mute') {
          if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
              audioTrack.enabled = false;
              setIsMuted(true);
            }
          }
        } else if (msg.type === 'force-video-off') {
          if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
              videoTrack.enabled = false;
              setIsVideoOff(true);
            }
          }
        } else if (msg.type === 'force-remove') {
          setWasRemoved(true);
        } else if (msg.type === 'chat') {
          setMessages(prev => [...prev, {
            id: Math.random().toString(36).substring(7),
            senderId: msg.sender,
            senderName: msg.display_name || 'User',
            text: msg.text,
            timestamp: msg.timestamp || Date.now()
          }]);
        } else if (msg.type === 'reaction') {
          setReactions(prev => [...prev, {
            id: Math.random().toString(36).substring(7),
            senderId: msg.sender,
            reaction: msg.reaction,
            timestamp: msg.timestamp || Date.now()
          }]);
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

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoTrack = stream.getVideoTracks()[0];
        if (localStream) {
          const oldVideoTrack = localStream.getVideoTracks()[0];
          localStream.removeTrack(oldVideoTrack);
          oldVideoTrack.stop();
          localStream.addTrack(videoTrack);
          peers.current.forEach(pc => {
            const sender = pc.getSenders().find(s => s.track?.kind === 'video');
            if (sender) sender.replaceTrack(videoTrack);
          });
          setLocalStream(new MediaStream(localStream.getTracks()));
        }
        setIsScreenSharing(false);
      } catch (err) {
        console.error("Failed to revert to webcam", err);
      }
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = displayStream.getVideoTracks()[0];
        
        screenTrack.onended = () => {
          // Trigger revert when user stops via browser UI
          setIsScreenSharing(false);
          navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
             const videoTrack = stream.getVideoTracks()[0];
             if (localStream) {
               const oldVideoTrack = localStream.getVideoTracks()[0];
               localStream.removeTrack(oldVideoTrack);
               oldVideoTrack.stop();
               localStream.addTrack(videoTrack);
               peers.current.forEach(pc => {
                 const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                 if (sender) sender.replaceTrack(videoTrack);
               });
               setLocalStream(new MediaStream(localStream.getTracks()));
             }
          }).catch(console.error);
        };

        if (localStream) {
          const oldVideoTrack = localStream.getVideoTracks()[0];
          localStream.removeTrack(oldVideoTrack);
          oldVideoTrack.stop();
          localStream.addTrack(screenTrack);
          peers.current.forEach(pc => {
            const sender = pc.getSenders().find(s => s.track?.kind === 'video');
            if (sender) sender.replaceTrack(screenTrack);
          });
          setLocalStream(new MediaStream(localStream.getTracks()));
        }
        setIsScreenSharing(true);
      } catch (err) {
        console.error("Failed to start screen share", err);
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

  const sendChatMessage = (text: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const timestamp = Date.now();
      ws.current.send(JSON.stringify({
        type: 'chat',
        text,
        timestamp
      }));
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substring(7),
        senderId: clientId.current,
        senderName: displayName,
        text,
        timestamp
      }]);
    }
  };

  const sendReaction = (reaction: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const timestamp = Date.now();
      ws.current.send(JSON.stringify({
        type: 'reaction',
        reaction,
        timestamp
      }));
      setReactions(prev => [...prev, {
        id: Math.random().toString(36).substring(7),
        senderId: clientId.current,
        reaction,
        timestamp
      }]);
    }
  };

  return {
    localStream,
    remoteParticipants: Array.from(remoteParticipants.values()),
    isMuted,
    isVideoOff,
    isScreenSharing,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    leave,
    error,
    wasRemoved,
    clientId: clientId.current,
    messages,
    sendChatMessage,
    reactions,
    sendReaction
  };
}
