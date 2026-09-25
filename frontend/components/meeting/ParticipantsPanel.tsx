import React from 'react';
import { X, Mic, MicOff, Video, VideoOff, Crown } from 'lucide-react';
import { RemoteParticipant } from '@/lib/useWebRTC';
import { Button } from '@/components/ui/Button';

interface ParticipantsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isHost: boolean;
  localName: string;
  localClientId: string;
  remoteParticipants: RemoteParticipant[];
  onMuteAll: () => void;
  onRemove: (clientId: string) => void;
}

export default function ParticipantsPanel({
  isOpen, onClose, isHost, localName, localClientId, remoteParticipants, onMuteAll, onRemove
}: ParticipantsPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="w-80 bg-white h-full border-l border-gray-200 flex flex-col shadow-xl z-40 relative">
      <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Participants ({remoteParticipants.length + 1})</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-sm">
              {localName.substring(0, 2).toUpperCase()}
            </div>
            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
              {localName} (You)
              {isHost && <Crown size={14} className="text-yellow-500" />}
            </div>
          </div>
        </div>

        {remoteParticipants.map(p => (
          <div key={p.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-medium text-sm">
                {p.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-sm font-medium text-gray-700">
                {p.name}
              </div>
            </div>
            {isHost && (
              <button 
                onClick={() => onRemove(p.id)}
                className="opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded transition"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {isHost && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <Button variant="secondary" className="w-full justify-center" onClick={onMuteAll}>
            Mute All
          </Button>
        </div>
      )}
    </div>
  );
}
