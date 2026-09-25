export type MeetingType = "instant" | "scheduled";
export type MeetingStatus = "scheduled" | "ongoing" | "ended";

export interface Meeting {
  id: number;
  meeting_code: string;
  host_id: number;
  title: string;
  description?: string;
  meeting_type: MeetingType;
  status: MeetingStatus;
  scheduled_at?: string;
  duration_minutes: number;
  created_at: string;
  invite_link?: string;
}

export interface Participant {
  id: number;
  meeting_id: number;
  display_name: string;
  is_host: boolean;
  is_muted: boolean;
  joined_at: string;
  left_at?: string;
}

export interface MeetingInstantResponse {
  meeting_id: number;
  meeting_code: string;
  invite_link: string;
}

export interface JoinMeetingResponse {
  participant: Participant;
  meeting_title: string;
  host_name: string;
}
