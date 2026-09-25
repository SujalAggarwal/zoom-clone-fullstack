import React, { useEffect, useState } from 'react';
import { ReactionMessage } from '@/lib/useWebRTC';

interface ReactionLayerProps {
  reactions: ReactionMessage[];
}

interface FloatingReaction extends ReactionMessage {
  key: string;
  leftOffset: number;
}

export default function ReactionLayer({ reactions }: ReactionLayerProps) {
  const [floating, setFloating] = useState<FloatingReaction[]>([]);

  useEffect(() => {
    if (reactions.length > 0) {
      const latest = reactions[reactions.length - 1];
      // Only show reactions that are new (within the last 2 seconds)
      if (Date.now() - latest.timestamp < 2000) {
        const newReaction = {
          ...latest,
          key: `${latest.id}-${Math.random()}`,
          leftOffset: Math.random() * 80 + 10 // random 10% to 90%
        };
        
        setFloating(prev => [...prev, newReaction]);
        
        // Remove after animation finishes (3 seconds)
        setTimeout(() => {
          setFloating(prev => prev.filter(r => r.key !== newReaction.key));
        }, 3000);
      }
    }
  }, [reactions]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {floating.map((r) => (
        <div
          key={r.key}
          className="absolute bottom-20 text-4xl sm:text-6xl animate-float-up opacity-0"
          style={{ left: `${r.leftOffset}%` }}
        >
          {r.reaction}
        </div>
      ))}
    </div>
  );
}
