import random
import string
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models import Meeting, User, Participant, MeetingType, MeetingStatus
from app.schemas import (
    MeetingSchedule, MeetingResponse, MeetingInstantResponse, 
    ParticipantCreate, ParticipantResponse, JoinMeetingResponse
)
from pydantic import BaseModel

class InstantMeetingCreate(BaseModel):
    title: str | None = None
import os
from app.routers.signaling import manager

router = APIRouter()

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://frontend-eight-livid-03b04fqa69.vercel.app")

def get_current_user(db: Session, email: str = None) -> User:
    if not email:
        email = "alex@example.com"
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Create user on the fly if they don't exist
        name = email.split('@')[0].capitalize()
        user = User(email=email, name=name)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def generate_meeting_code(db: Session) -> str:
    while True:
        # e.g., 123-456-789
        code = f"{random.randint(100, 999)}-{random.randint(100, 999)}-{random.randint(100, 999)}"
        if not db.query(Meeting).filter(Meeting.meeting_code == code).first():
            return code

@router.post("/instant", response_model=MeetingInstantResponse, status_code=status.HTTP_201_CREATED)
def create_instant_meeting(email: str = None, meeting_in: InstantMeetingCreate | None = None, db: Session = Depends(get_db)):
    """
    Creates an instant meeting for the given user.
    Auto-generates a unique meeting_code and sets meeting_type = instant.
    """
    host = get_current_user(db, email)
    code = generate_meeting_code(db)
    
    meeting_title = meeting_in.title if meeting_in and meeting_in.title else f"{host.name}'s Instant Meeting"
    
    meeting = Meeting(
        meeting_code=code,
        host_id=host.id,
        title=meeting_title,
        meeting_type=MeetingType.instant,
        status=MeetingStatus.ongoing,
        scheduled_at=datetime.utcnow(),
        duration_minutes=60
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    
    invite_link = f"{FRONTEND_URL}/meeting/{code}"
    return MeetingInstantResponse(
        meeting_id=meeting.id,
        meeting_code=code,
        invite_link=invite_link
    )

@router.post("/schedule", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
def schedule_meeting(meeting_in: MeetingSchedule, email: str = None, db: Session = Depends(get_db)):
    """
    Creates a scheduled meeting for the given user.
    Rejects requests with past scheduled times.
    """
    # Remove timezone info for comparison with naive datetime
    sched_at = meeting_in.scheduled_at.replace(tzinfo=None)
    
    if sched_at < datetime.now():
        raise HTTPException(status_code=400, detail="Cannot schedule a meeting in the past")

    host = get_current_user(db, email)
    code = generate_meeting_code(db)
    
    meeting = Meeting(
        meeting_code=code,
        host_id=host.id,
        title=meeting_in.title,
        description=meeting_in.description,
        meeting_type=MeetingType.scheduled,
        status=MeetingStatus.scheduled,
        scheduled_at=sched_at,
        duration_minutes=meeting_in.duration_minutes
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    
    # Inject invite_link to the response
    meeting_resp = MeetingResponse.model_validate(meeting)
    meeting_resp.invite_link = f"{FRONTEND_URL}/meeting/{code}"
    return meeting_resp

@router.get("/upcoming", response_model=List[MeetingResponse])
def get_upcoming_meetings(email: str = None, db: Session = Depends(get_db)):
    """
    Returns all upcoming scheduled meetings for the given user.
    """
    host = get_current_user(db, email)
    now = datetime.now()
    meetings = db.query(Meeting).filter(
        Meeting.host_id == host.id,
        Meeting.meeting_type == MeetingType.scheduled,
        Meeting.scheduled_at >= now
    ).order_by(Meeting.scheduled_at.asc()).all()
    
    res = []
    for m in meetings:
        r = MeetingResponse.model_validate(m)
        r.invite_link = f"{FRONTEND_URL}/meeting/{m.meeting_code}"
        res.append(r)
    return res

@router.get("/recent", response_model=List[MeetingResponse])
def get_recent_meetings(email: str = None, db: Session = Depends(get_db)):
    """
    Returns up to 10 recent (ended or past) meetings for the given user.
    """
    host = get_current_user(db, email)
    now = datetime.now()
    meetings = db.query(Meeting).filter(
        Meeting.host_id == host.id,
        or_(
            Meeting.status == MeetingStatus.ended,
            Meeting.scheduled_at < now
        )
    ).order_by(Meeting.scheduled_at.desc()).limit(10).all()
    
    res = []
    for m in meetings:
        r = MeetingResponse.model_validate(m)
        r.invite_link = f"{FRONTEND_URL}/meeting/{m.meeting_code}"
        res.append(r)
    return res

@router.get("/{meeting_code}", response_model=MeetingResponse)
def get_meeting_by_code(meeting_code: str, db: Session = Depends(get_db)):
    """
    Looks up a meeting by its code. Used for validating before joining.
    """
    meeting = db.query(Meeting).filter(Meeting.meeting_code == meeting_code).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    r = MeetingResponse.model_validate(meeting)
    r.invite_link = f"{FRONTEND_URL}/meeting/{meeting.meeting_code}"
    return r

@router.post("/{meeting_code}/join", response_model=JoinMeetingResponse)
def join_meeting(meeting_code: str, participant_in: ParticipantCreate, db: Session = Depends(get_db)):
    """
    Joins a meeting by code. Creates a new Participant.
    """
    meeting = db.query(Meeting).filter(Meeting.meeting_code == meeting_code).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    host = db.query(User).filter(User.id == meeting.host_id).first()
    is_host = False
    
    if host and participant_in.display_name == host.name:
        is_host = True

    participant = Participant(
        meeting_id=meeting.id,
        display_name=participant_in.display_name,
        is_host=is_host,
        joined_at=datetime.now()
    )
    db.add(participant)
    
    if meeting.status == MeetingStatus.scheduled:
        meeting.status = MeetingStatus.ongoing
        
    db.commit()
    db.refresh(participant)
    
    return JoinMeetingResponse(
        participant=ParticipantResponse.model_validate(participant),
        meeting_title=meeting.title,
        host_name=host.name if host else "Unknown Host"
    )

@router.get("/{meeting_code}/participants", response_model=List[ParticipantResponse])
def get_meeting_participants(meeting_code: str, db: Session = Depends(get_db)):
    """
    Returns list of all current participants for a meeting.
    """
    meeting = db.query(Meeting).filter(Meeting.meeting_code == meeting_code).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    participants = db.query(Participant).filter(
        Participant.meeting_id == meeting.id,
        Participant.left_at == None
    ).all()
    return [ParticipantResponse.model_validate(p) for p in participants]

@router.post("/{meeting_code}/mute-all")
async def mute_all(meeting_code: str, exclude_client_id: str = None, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.meeting_code == meeting_code).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    db.query(Participant).filter(
        Participant.meeting_id == meeting.id,
        Participant.is_host == False
    ).update({"is_muted": True})
    db.commit()
    
    await manager.broadcast_force_mute(meeting_code, exclude_client_id)
    return {"message": "All participants muted"}

@router.post("/{meeting_code}/participants/{client_id}/remove")
async def remove_participant(meeting_code: str, client_id: str, db: Session = Depends(get_db)):
    await manager.force_remove(meeting_code, client_id)
    return {"message": "Participant removed"}

@router.post("/{meeting_code}/participants/{client_id}/mute")
async def mute_participant(meeting_code: str, client_id: str, db: Session = Depends(get_db)):
    await manager.force_mute_user(meeting_code, client_id)
    return {"message": "Participant muted"}

@router.post("/{meeting_code}/participants/{client_id}/video-off")
async def video_off_participant(meeting_code: str, client_id: str, db: Session = Depends(get_db)):
    await manager.force_video_off_user(meeting_code, client_id)
    return {"message": "Participant video turned off"}

