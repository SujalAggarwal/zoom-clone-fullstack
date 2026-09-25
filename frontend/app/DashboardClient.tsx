"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Video, Calendar, Link as LinkIcon, Copy, Play, 
  Clock, ArrowRight, Users, Zap, Plus, ChevronRight,
  LayoutDashboard, History
} from 'lucide-react';
import { Meeting } from '@/types/meeting';
import { createInstantMeeting, getUpcomingMeetings } from '@/lib/api';
import { JoinMeetingModal } from '@/components/meeting/JoinMeetingModal';
import { ScheduleMeetingModal } from '@/components/meeting/ScheduleMeetingModal';
import { useAuth } from '@/lib/AuthContext';

function formatMeetingDate(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  });
}

function getTimeUntil(isoString: string) {
  const diff = new Date(isoString).getTime() - Date.now();
  if (diff < 0) return 'Started';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `in ${mins}m`;
  const hrs = Math.floor(mins / 60);
  return `in ${hrs}h ${mins % 60}m`;
}

function LiveClock() {
  const [time, setTime] = useState<Date | null>(null);
  useEffect(() => {
    setTime(new Date());
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!time) return <div className="h-16 sm:h-24" />;
  return (
    <div className="mb-6 sm:mb-10">
      <div className="text-4xl sm:text-5xl lg:text-6xl font-light text-white tracking-tight">
        {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="text-white/40 text-xs sm:text-base mt-1 sm:mt-2 font-medium">
        <span className="hidden sm:inline">{time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
        <span className="sm:hidden">{time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
      </div>
    </div>
  );
}

export default function DashboardClient({ initialUpcoming, initialRecent, error }: {
  initialUpcoming: Meeting[], initialRecent: Meeting[], error: string | null
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [upcomingMeetings, setUpcomingMeetings] = useState(initialUpcoming);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'recent'>('upcoming');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  if (!user) return null;

  const refreshUpcoming = async () => {
    try {
      const fresh = await getUpcomingMeetings();
      setUpcomingMeetings(fresh);
    } catch {}
  };

  const handleCopyLink = (meeting: Meeting) => {
    if (meeting.invite_link) {
      navigator.clipboard.writeText(meeting.invite_link);
      setCopiedId(meeting.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleNewMeeting = async () => {
    setIsCreating(true);
    setCreateError(null);
    try {
      const res = await createInstantMeeting();
      sessionStorage.setItem('joinName', user.name);
      sessionStorage.setItem('isHost', 'true');
      router.push(`/meeting/${res.meeting_code}`);
    } catch {
      setCreateError("Failed to create meeting. Is the backend running?");
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-6 sm:mb-10">
          <div>
            <LiveClock />
            <div className="flex items-center gap-2 mt-1">
              <div className="relative w-2 h-2">
                <div className="absolute inset-0 bg-emerald-500 rounded-full pulse-ring"></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full relative"></div>
              </div>
              <span className="text-emerald-400/80 text-xs sm:text-sm font-medium">Good day, {user.name}</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 text-sm text-white/40">
            <LayoutDashboard size={14} />
            <span>Dashboard</span>
          </div>
        </div>

        {createError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm font-medium flex items-center gap-3">
            <Zap size={16} className="shrink-0" />
            {createError}
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {/* New Meeting */}
          <button
            onClick={handleNewMeeting}
            disabled={isCreating}
            className="action-card glass glass-hover rounded-2xl p-6 text-left group relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#2D8CFF]/10 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2D8CFF] to-[#1a6fd4] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20 btn-glow group-hover:scale-110 transition-transform">
                {isCreating
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Video size={22} className="text-white" />
                }
              </div>
              <h3 className="font-semibold text-white text-base mb-1">{isCreating ? 'Creating...' : 'New Meeting'}</h3>
              <p className="text-white/40 text-sm">Start an instant video call</p>
              <div className="mt-4 flex items-center gap-1 text-[#2D8CFF] text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Start now</span><ArrowRight size={12} />
              </div>
            </div>
          </button>

          {/* Join Meeting */}
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="action-card glass glass-hover rounded-2xl p-6 text-left group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <LinkIcon size={22} className="text-white" />
              </div>
              <h3 className="font-semibold text-white text-base mb-1">Join Meeting</h3>
              <p className="text-white/40 text-sm">Enter a code or invite link</p>
              <div className="mt-4 flex items-center gap-1 text-purple-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Join now</span><ArrowRight size={12} />
              </div>
            </div>
          </button>

          {/* Schedule */}
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="action-card glass glass-hover rounded-2xl p-6 text-left group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <Calendar size={22} className="text-white" />
              </div>
              <h3 className="font-semibold text-white text-base mb-1">Schedule</h3>
              <p className="text-white/40 text-sm">Plan a future meeting</p>
              <div className="mt-4 flex items-center gap-1 text-emerald-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Schedule</span><ArrowRight size={12} />
              </div>
            </div>
          </button>
        </div>

        {/* Meetings Section */}
        {error ? (
          <div className="glass rounded-2xl p-8 text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Zap size={20} className="text-red-400" />
            </div>
            <p className="text-white/40 text-sm">{error}</p>
          </div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-white/[0.06] px-6">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex items-center gap-2 py-4 pr-6 text-sm font-medium border-b-2 transition-all ${
                  activeTab === 'upcoming'
                    ? 'border-[#2D8CFF] text-[#2D8CFF]'
                    : 'border-transparent text-white/40 hover:text-white/70'
                }`}
              >
                <Clock size={15} />
                Upcoming
                {upcomingMeetings.length > 0 && (
                  <span className="bg-[#2D8CFF]/20 text-[#2D8CFF] text-xs px-2 py-0.5 rounded-full">{upcomingMeetings.length}</span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`flex items-center gap-2 py-4 pr-6 text-sm font-medium border-b-2 transition-all ${
                  activeTab === 'recent'
                    ? 'border-[#2D8CFF] text-[#2D8CFF]'
                    : 'border-transparent text-white/40 hover:text-white/70'
                }`}
              >
                <History size={15} />
                Recent
              </button>

              <div className="ml-auto flex items-center">
                <button
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-[#2D8CFF] transition-colors py-4"
                >
                  <Plus size={14} />
                  New
                </button>
              </div>
            </div>

            {/* Upcoming */}
            {activeTab === 'upcoming' && (
              <div>
                {upcomingMeetings.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="w-14 h-14 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Calendar size={24} className="text-white/20" />
                    </div>
                    <p className="text-white/30 text-sm">No upcoming meetings scheduled.</p>
                    <button
                      onClick={() => setIsScheduleModalOpen(true)}
                      className="mt-4 text-[#2D8CFF] text-sm hover:underline flex items-center gap-1 mx-auto"
                    >
                      <Plus size={14} /> Schedule one
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.04]">
                    {upcomingMeetings.map(meeting => (
                      <div key={meeting.id} className="meeting-row flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 transition-colors">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#2D8CFF]/20 to-purple-500/10 rounded-xl flex items-center justify-center shrink-0">
                          <Video size={15} className="text-[#2D8CFF]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white/90 text-sm truncate">{meeting.title}</div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                            <span className="text-white/40 text-xs flex items-center gap-1">
                              <Clock size={10} /> {meeting.scheduled_at ? formatMeetingDate(meeting.scheduled_at) : 'No time'}
                            </span>
                            <span className="hidden sm:inline text-white/30 font-mono text-xs">{meeting.meeting_code}</span>
                          </div>
                        </div>
                        <div className="shrink-0 hidden sm:block">
                          {meeting.scheduled_at && (
                            <span className="text-emerald-400 text-xs bg-emerald-500/10 px-2 py-1 rounded-lg font-medium">
                              {getTimeUntil(meeting.scheduled_at)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                          <button
                            onClick={() => handleCopyLink(meeting)}
                            className="p-2 text-white/30 hover:text-white/70 hover:bg-white/[0.06] rounded-lg transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
                            title="Copy invite link"
                          >
                            {copiedId === meeting.id
                              ? <span className="text-emerald-400 text-xs font-medium">✓</span>
                              : <Copy size={14} />
                            }
                          </button>
                          <button
                            onClick={() => router.push(`/meeting/${meeting.meeting_code}`)}
                            className="flex items-center gap-1.5 bg-[#2D8CFF] hover:bg-[#1a6fd4] text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors btn-glow min-h-[36px]"
                          >
                            <Play size={11} className="fill-white" /> Start
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recent */}
            {activeTab === 'recent' && (
              <div>
                {initialRecent.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="w-14 h-14 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <History size={24} className="text-white/20" />
                    </div>
                    <p className="text-white/30 text-sm">No recent meetings.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.04]">
                    {initialRecent.map(meeting => (
                      <div key={meeting.id} className="meeting-row flex items-center gap-4 px-6 py-4 transition-colors">
                        <div className="w-10 h-10 bg-white/[0.04] rounded-xl flex items-center justify-center shrink-0">
                          <Video size={16} className="text-white/30" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white/70 text-sm truncate">{meeting.title}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-white/30 text-xs flex items-center gap-1">
                              <Clock size={11} /> {meeting.scheduled_at ? formatMeetingDate(meeting.scheduled_at) : 'Unknown'}
                            </span>
                          </div>
                        </div>
                        <span className="text-white/20 font-mono text-xs shrink-0">{meeting.meeting_code}</span>
                        <ChevronRight size={14} className="text-white/20 shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <JoinMeetingModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />
      <ScheduleMeetingModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSuccess={refreshUpcoming}
      />
    </div>
  );
}
