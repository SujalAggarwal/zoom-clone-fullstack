import { Meeting, MeetingInstantResponse, JoinMeetingResponse, Participant } from '../types/meeting';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function getUpcomingMeetings(email: string): Promise<Meeting[]> {
  const res = await fetch(`${API_URL}/meetings/upcoming?email=${encodeURIComponent(email)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch upcoming meetings');
  return res.json();
}

export async function getRecentMeetings(email: string): Promise<Meeting[]> {
  const res = await fetch(`${API_URL}/meetings/recent?email=${encodeURIComponent(email)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch recent meetings');
  return res.json();
}

export async function createInstantMeeting(email: string, title?: string): Promise<MeetingInstantResponse> {
  const res = await fetch(`${API_URL}/meetings/instant?email=${encodeURIComponent(email)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: title ? JSON.stringify({ title }) : undefined,
  });
  if (!res.ok) throw new Error('Failed to create instant meeting');
  return res.json();
}

export async function scheduleMeeting(email: string, data: any): Promise<Meeting> {
  const res = await fetch(`${API_URL}/meetings/schedule?email=${encodeURIComponent(email)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to schedule meeting');
  return res.json();
}

export async function getMeetingByCode(code: string): Promise<Meeting> {
  const res = await fetch(`${API_URL}/meetings/${code}`);
  if (!res.ok) throw new Error('Failed to fetch meeting');
  return res.json();
}

export async function joinMeeting(code: string, displayName: string): Promise<JoinMeetingResponse> {
  const res = await fetch(`${API_URL}/meetings/${code}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ display_name: displayName }),
  });
  if (!res.ok) throw new Error('Failed to join meeting');
  return res.json();
}
