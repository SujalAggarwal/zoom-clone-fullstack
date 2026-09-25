import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { scheduleMeeting } from '@/lib/api';
import { Meeting } from '@/types/meeting';
import { Copy, Check, Calendar } from 'lucide-react';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ScheduleMeetingModal({ isOpen, onClose, onSuccess }: ScheduleMeetingModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState("Alex Morgan's Zoom Meeting");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60);
  
  const [errors, setErrors] = useState<{title?: string; datetime?: string; api?: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [scheduledMeeting, setScheduledMeeting] = useState<Meeting | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setTitle("Alex Morgan's Zoom Meeting");
      setDescription("");
      
      const now = new Date();
      const next = new Date(now.getTime() + 30 * 60000);
      next.setMinutes(next.getMinutes() >= 30 ? 30 : 0, 0, 0);
      
      const localDate = new Date(next.getTime() - next.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      setDate(localDate);
      const hours = String(next.getHours()).padStart(2, '0');
      const mins = String(next.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${mins}`);
      
      setDuration(60);
      setErrors({});
      setScheduledMeeting(null);
      setIsLoading(false);
      setCopied(false);
    }
  }, [isOpen]);

  const handleSchedule = async () => {
    const newErrors: any = {};
    if (!title.trim()) newErrors.title = "Title is required";
    
    let scheduledAt: Date | null = null;
    if (date && time) {
      scheduledAt = new Date(`${date}T${time}`);
      if (scheduledAt < new Date()) {
        newErrors.datetime = "Meeting cannot be scheduled in the past";
      }
    } else {
      newErrors.datetime = "Date and time are required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      const isoString = scheduledAt!.toISOString();
      const res = await scheduleMeeting({
        title,
        description,
        scheduled_at: isoString,
        duration_minutes: duration
      });
      setScheduledMeeting(res);
      setStep(2);
      onSuccess(); 
    } catch (err) {
      setErrors({ api: "Failed to schedule meeting. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (scheduledMeeting?.invite_link) {
      navigator.clipboard.writeText(scheduledMeeting.invite_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={step === 1 ? "Schedule Meeting" : "Meeting Scheduled!"}>
      <div className="py-2">
        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <Input 
                label="Topic" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <Input 
                  label="Date" 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input 
                  label="Time" 
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>
            {errors.datetime && <p className="text-red-500 text-xs">{errors.datetime}</p>}

            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Duration</label>
              <select 
                className="w-full px-4 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8CFF]/50 focus:border-[#2D8CFF]/50 transition-all"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                style={{ colorScheme: 'dark' }}
              >
                <option value={15} className="bg-gray-900 text-white">15 minutes</option>
                <option value={30} className="bg-gray-900 text-white">30 minutes</option>
                <option value={45} className="bg-gray-900 text-white">45 minutes</option>
                <option value={60} className="bg-gray-900 text-white">1 hour</option>
                <option value={90} className="bg-gray-900 text-white">1 hour 30 minutes</option>
                <option value={120} className="bg-gray-900 text-white">2 hours</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Description (Optional)</label>
              <textarea 
                className="w-full px-4 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#2D8CFF]/50 focus:border-[#2D8CFF]/50 transition-all resize-none"
                rows={3}
                placeholder="Meeting agenda or details"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {errors.api && <p className="text-red-400 text-sm p-3 bg-red-500/10 border border-red-500/20 rounded-xl">{errors.api}</p>}
            
            <div className="pt-4 flex justify-end gap-2 border-t border-white/[0.06]">
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSchedule} disabled={isLoading}>
                {isLoading ? 'Scheduling...' : 'Schedule'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-center py-4">
            <div className="bg-emerald-500/10 text-emerald-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
              <Calendar size={32} />
            </div>
            
            <div>
              <h3 className="font-semibold text-xl text-white">{scheduledMeeting?.title}</h3>
              <p className="text-white/40 mt-1">
                {scheduledMeeting?.scheduled_at ? formatDateTime(scheduledMeeting.scheduled_at) : ''}
              </p>
            </div>

            <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 flex flex-col gap-3">
              <div className="text-xs font-semibold text-white/40 uppercase tracking-wider">Invite Link</div>
              <div className="bg-black/20 border border-white/[0.06] px-3 py-2 rounded-lg text-sm text-white/40 break-all select-all font-mono">
                {scheduledMeeting?.invite_link}
              </div>
              <Button variant="secondary" className="w-full mt-2" onClick={handleCopyLink}>
                {copied ? <Check size={16} className="mr-2 text-green-500" /> : <Copy size={16} className="mr-2" />}
                {copied ? 'Copied to clipboard' : 'Copy Invite Link'}
              </Button>
            </div>

            <div className="pt-2">
              <Button onClick={onClose} className="w-full">Done</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
