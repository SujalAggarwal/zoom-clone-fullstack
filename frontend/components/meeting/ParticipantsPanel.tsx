import React from 'react';
import { X, Crown } from 'lucide-react';
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
  const total = remoteParticipants.length + 1;

  return (
    <div className="w-72 bg-gray-950 border-l border-white/[0.06] flex flex-col">
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/[0.06]">
        <h3 className="font-semibold text-sm text-white/90">Participants <span className="text-white/30 font-normal">({total})</span></h3>
        <button onClick={onClose} className="text-white/40 hover:text-white hover:bg-white/[0.08] p-1.5 rounded-lg transition-all">
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {/* Local (Host) */}
        <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.04] group">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2D8CFF] to-purple-500 flex items-center justify-center font-semibold text-xs text-white">
              {localName.substring(0, 2).toUpperCase()}
            </div>
            <div className="text-sm font-medium text-white/80 flex items-center gap-1.5">
              {localName}
              <span className="text-white/30 text-xs font-normal">(You)</span>
              {isHost && <Crown size={12} className="text-yellow-400" />}
            </div>
          </div>
        </div>

        {remoteParticipants.map(p => (
          <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.04] group">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/[0.08] flex items-center justify-center font-semibold text-xs text-white/60">
                {p.name.substring(0, 2).toUpperCase()}
              </div>
              <span className="text-sm text-white/60">{p.name}</span>
            </div>
            {isHost && (
              <button
                onClick={() => onRemove(p.id)}
                className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:bg-red-500/10 px-2 py-1 rounded-lg transition-all"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {isHost && (
        <div className="p-3 border-t border-white/[0.06]">
          <Button variant="secondary" className="w-full justify-center text-xs" onClick={onMuteAll}>
            Mute All Participants
          </Button>
        </div>
      )}
    </div>
  );
}
