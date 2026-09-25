import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getMeetingByCode, joinMeeting } from '@/lib/api';
import { extractMeetingCode } from '@/lib/utils';
import { Meeting } from '@/types/meeting';

interface JoinMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinMeetingModal({ isOpen, onClose }: JoinMeetingModalProps) {
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [codeInput, setCodeInput] = useState('');
  const [nameInput, setNameInput] = useState('Alex Morgan');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meeting, setMeeting] = useState<Meeting | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCodeInput('');
      setNameInput('Alex Morgan');
      setError(null);
      setMeeting(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleNext = async () => {
    if (!codeInput.trim()) return;
    
    setIsLoading(true);
    setError(null);
    const extractedCode = extractMeetingCode(codeInput);
    
    try {
      const data = await getMeetingByCode(extractedCode);
      setMeeting(data);
      setStep(2);
    } catch (err) {
      setError('Meeting not found — check the ID and try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!nameInput.trim() || !meeting) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await joinMeeting(meeting.meeting_code, nameInput.trim());
      // Save the name so the meeting page can read it
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('joinName', nameInput.trim());
        sessionStorage.setItem('isHost', 'false'); // Guest joining via code
      }
      onClose();
      router.push(`/meeting/${meeting.meeting_code}`);
    } catch (err) {
      setError('Failed to join meeting. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join Meeting">
      <div className="py-2 space-y-4">
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs text-gray-400 font-medium tracking-wide uppercase mb-2">
              <span>Step 1 of 2</span>
            </div>
            <div>
              <Input 
                label="Meeting ID or invite link" 
                placeholder="e.g. 123-456-789" 
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                autoFocus
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            
            <div className="pt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button onClick={handleNext} disabled={!codeInput.trim() || isLoading}>
                {isLoading ? 'Checking...' : 'Next'}
              </Button>
            </div>
          </div>
        )}
        
        {step === 2 && meeting && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs text-gray-400 font-medium tracking-wide uppercase mb-2">
              <span>Step 2 of 2</span>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Joining</p>
              <p className="font-medium text-gray-900">{meeting.title}</p>
            </div>
            
            <div>
              <Input 
                label="Your name" 
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                autoFocus
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            
            <div className="pt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setStep(1)} disabled={isLoading}>Back</Button>
              <Button onClick={handleJoin} disabled={!nameInput.trim() || isLoading}>
                {isLoading ? 'Joining...' : 'Join'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
