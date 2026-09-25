"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Calendar, Link as LinkIcon, Copy, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Meeting } from '@/types/meeting';
import { createInstantMeeting, getUpcomingMeetings } from '@/lib/api';
import { JoinMeetingModal } from '@/components/meeting/JoinMeetingModal';
import { ScheduleMeetingModal } from '@/components/meeting/ScheduleMeetingModal';

function formatMeetingDate(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function LiveClock() {
  const [time, setTime] = useState<Date | null>(null);
  
  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return <div className="h-16 mb-8"></div>;

  return (
    <div className="mb-8">
      <div className="text-4xl font-light text-gray-800">
        {time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
      </div>
      <div className="text-lg text-gray-500 font-medium mt-1">
        {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
      </div>
    </div>
  );
}

export default function DashboardClient({ 
  initialUpcoming, 
  initialRecent, 
  error 
}: { 
  initialUpcoming: Meeting[], 
  initialRecent: Meeting[], 
  error: string | null 
}) {
  const router = useRouter();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  
  const [upcomingMeetings, setUpcomingMeetings] = useState(initialUpcoming);

  const refreshUpcoming = async () => {
    try {
      const fresh = await getUpcomingMeetings();
      setUpcomingMeetings(fresh);
    } catch (err) {
      console.error("Failed to refresh upcoming meetings");
    }
  };

  const handleCopyLink = (link?: string) => {
    if (link) {
      navigator.clipboard.writeText(link);
      alert('Invite link copied!');
    }
  };

  const handleNewMeeting = async () => {
    setIsCreating(true);
    setCreateError(null);
    try {
      const res = await createInstantMeeting();
      router.push(`/meeting/${res.meeting_code}`);
    } catch (err) {
      setCreateError("Failed to create meeting.");
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full p-6 md:p-8">
      <LiveClock />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative">
        {createError && (
          <div className="absolute -top-12 left-0 right-0 p-3 bg-red-50 text-red-600 rounded-lg text-center font-medium shadow-sm border border-red-100">
            {createError}
          </div>
        )}
        <Card 
          className={`p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer border-zoom-blue/20 ${isCreating ? 'opacity-70 pointer-events-none' : 'hover:bg-gray-50'}`}
          onClick={handleNewMeeting}
        >
          <div className="bg-zoom-blue text-white p-4 rounded-2xl mb-4 shadow-sm relative">
            {isCreating ? (
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Video size={32} />
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{isCreating ? 'Creating...' : 'New Meeting'}</h3>
          <p className="text-sm text-gray-500 mt-1">Start an instant meeting</p>
        </Card>

        <Card 
          className="p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => setIsJoinModalOpen(true)}
        >
          <div className="bg-zoom-blue/10 text-zoom-blue p-4 rounded-2xl mb-4 shadow-sm border border-zoom-blue/20">
            <LinkIcon size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Join Meeting</h3>
          <p className="text-sm text-gray-500 mt-1">Join with a code or link</p>
        </Card>

        <Card 
          className="p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => setIsScheduleModalOpen(true)}
        >
          <div className="bg-zoom-blue/10 text-zoom-blue p-4 rounded-2xl mb-4 shadow-sm border border-zoom-blue/20">
            <Calendar size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Schedule</h3>
          <p className="text-sm text-gray-500 mt-1">Plan a future meeting</p>
        </Card>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <section>
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Upcoming Meetings</h2>
            {upcomingMeetings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500 shadow-sm">
                <Calendar className="mx-auto mb-3 text-gray-300" size={40} />
                <p>No upcoming meetings today.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingMeetings.map(meeting => (
                  <Card key={meeting.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {meeting.scheduled_at ? formatMeetingDate(meeting.scheduled_at) : 'No time set'}
                      </p>
                      <p className="text-sm text-gray-500">ID: {meeting.meeting_code}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => handleCopyLink(meeting.invite_link)}>
                        <Copy size={16} className="mr-2 text-gray-500" /> Copy Link
                      </Button>
                      <Button size="sm">
                        <Play size={16} className="mr-2 fill-white" /> Start
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Recent Meetings</h2>
            {initialRecent.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500 shadow-sm">
                <p>No recent meetings.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="divide-y divide-gray-100">
                  {initialRecent.map(meeting => (
                    <div key={meeting.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors gap-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{meeting.title}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">ID: {meeting.meeting_code}</p>
                      </div>
                      <div className="text-sm text-gray-500 whitespace-nowrap">
                        {meeting.scheduled_at ? formatMeetingDate(meeting.scheduled_at) : 'Unknown Date'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Modals */}
      <JoinMeetingModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)} 
      />

      <ScheduleMeetingModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSuccess={refreshUpcoming}
      />
    </div>
  );
}
