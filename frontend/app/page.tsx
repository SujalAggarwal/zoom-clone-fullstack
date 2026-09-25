import React from 'react';
import { getUpcomingMeetings, getRecentMeetings } from '@/lib/api';
import DashboardClient from './DashboardClient';
import { Meeting } from '@/types/meeting';
import { Navbar } from '@/components/layout/Navbar';

export const dynamic = 'force-dynamic'; // Ensure fresh data on every request

export default async function Home() {
  let upcoming: Meeting[] = [];
  let recent: Meeting[] = [];
  let error: string | null = null;

  try {
    upcoming = await getUpcomingMeetings();
    recent = await getRecentMeetings();
  } catch (err) {
    error = "Failed to load meetings. Make sure the backend is running.";
  }

  return (
    <div className="min-h-screen flex flex-col bg-zoom-gray-bg">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <DashboardClient 
          initialUpcoming={upcoming} 
          initialRecent={recent} 
          error={error} 
        />
      </main>
    </div>
  );
}
