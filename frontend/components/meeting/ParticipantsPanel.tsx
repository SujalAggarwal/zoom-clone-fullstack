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
  onMuteUser: (clientId: string) => void;
  onVideoOffUser: (clientId: string) => void;
  onRemove: (clientId: string) => void;
}

export default function ParticipantsPanel({
  isOpen, onClose, isHost, localName, localClientId, remoteParticipants, onMuteAll, onMuteUser, onVideoOffUser, onRemove
}: ParticipantsPanelProps) {
  if (!isOpen) return null;
  const total = remoteParticipants.length + 1;

  return (
    <>
      {/* Mobile: full-screen overlay backdrop */}
      <div
        className="md:hidden fixed inset-0 z-30 bg-black/50"
        onClick={onClose}
      />

      {/* Panel: full-width overlay on mobile, sidebar on desktop */}
      <div className="
        fixed inset-x-0 bottom-0 z-40 max-h-[70vh]
        md:relative md:inset-auto md:max-h-none md:w-72 md:h-full md:z-auto
        bg-gray-950 border-t md:border-t-0 md:border-l border-white/[0.06]
        flex flex-col rounded-t-2xl md:rounded-none
        shadow-2xl md:shadow-none
        transition-all
      ">
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/[0.06] shrink-0">
          {/* Drag handle on mobile */}
          <div className="md:hidden absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/20 rounded-full" />
          <h3 className="font-semibold text-sm text-white/90">
            Participants <span className="text-white/30 font-normal">({total})</span>
          </h3>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white hover:bg-white/[0.08] p-1.5 rounded-lg transition-all min-w-[32px] min-h-[32px] flex items-center justify-center"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {/* Local (You) */}
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
                <div className="opacity-100 md:opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                  <button
                    onClick={() => onMuteUser(p.id)}
                    className="text-xs text-white/50 hover:text-white hover:bg-white/[0.1] px-2 py-1.5 rounded-lg min-h-[32px]"
                  >
                    Mute
                  </button>
                  <button
                    onClick={() => onVideoOffUser(p.id)}
                    className="text-xs text-white/50 hover:text-white hover:bg-white/[0.1] px-1.5 py-1.5 rounded-lg min-h-[32px] hidden sm:block"
                  >
                    Video Off
                  </button>
                  <button
                    onClick={() => onRemove(p.id)}
                    className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-1.5 py-1.5 rounded-lg min-h-[32px]"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {isHost && (
          <div className="p-3 border-t border-white/[0.06] shrink-0">
            <Button variant="secondary" className="w-full justify-center text-xs" onClick={onMuteAll}>
              Mute All Participants
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
