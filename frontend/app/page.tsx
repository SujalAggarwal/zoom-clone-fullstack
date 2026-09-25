import React from 'react';
import { getUpcomingMeetings, getRecentMeetings } from '@/lib/api';
import DashboardClient from './DashboardClient';
import { Meeting } from '@/types/meeting';
import { Navbar } from '@/components/layout/Navbar';

export const dynamic = 'force-dynamic';

export default async function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0f1117]">
      <Navbar />
      <main className="flex-1">
        <DashboardClient />
      </main>
    </div>
  );
}

