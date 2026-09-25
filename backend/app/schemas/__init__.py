from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.models import MeetingType, MeetingStatus

class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MeetingBase(BaseModel):
    title: str
    description: Optional[str] = None
    duration_minutes: int = 60

class MeetingSchedule(MeetingBase):
    scheduled_at: datetime

class MeetingResponse(MeetingBase):
    id: int
    meeting_code: str
    host_id: int
    meeting_type: MeetingType
    status: MeetingStatus
    scheduled_at: Optional[datetime]
    created_at: datetime
    invite_link: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class MeetingInstantResponse(BaseModel):
    meeting_id: int
    meeting_code: str
    invite_link: str

class ParticipantBase(BaseModel):
    display_name: str

class ParticipantCreate(ParticipantBase):
    pass

class ParticipantResponse(ParticipantBase):
    id: int
    meeting_id: int
    is_host: bool
    is_muted: bool
    joined_at: datetime
    left_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)

class JoinMeetingResponse(BaseModel):
    participant: ParticipantResponse
    meeting_title: str
    host_name: str
