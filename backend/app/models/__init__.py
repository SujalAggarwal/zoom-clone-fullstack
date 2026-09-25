from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class MeetingType(str, enum.Enum):
    instant = "instant"
    scheduled = "scheduled"

class MeetingStatus(str, enum.Enum):
    scheduled = "scheduled"
    ongoing = "ongoing"
    ended = "ended"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    meetings = relationship("Meeting", back_populates="host")

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    meeting_code = Column(String, unique=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    description = Column(String, nullable=True)
    meeting_type = Column(Enum(MeetingType))
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    duration_minutes = Column(Integer, default=60)
    status = Column(Enum(MeetingStatus), default=MeetingStatus.scheduled)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    host = relationship("User", back_populates="meetings")
    participants = relationship("Participant", back_populates="meeting")

class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"))
    display_name = Column(String)
    is_host = Column(Boolean, default=False)
    is_muted = Column(Boolean, default=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    left_at = Column(DateTime(timezone=True), nullable=True)

    meeting = relationship("Meeting", back_populates="participants")
