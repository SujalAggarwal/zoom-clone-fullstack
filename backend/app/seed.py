import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models import User, Meeting, MeetingType, MeetingStatus
from datetime import datetime, timedelta

def seed_db():
    # Ensure tables are created
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if default user exists
        user = db.query(User).filter(User.email == "alex@example.com").first()
        if not user:
            user = User(name="Alex Morgan", email="alex@example.com")
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created default user: {user.name}")
        else:
            print(f"Default user already exists: {user.name}")

        # Create sample meetings
        existing_meetings = db.query(Meeting).filter(Meeting.host_id == user.id).count()
        if existing_meetings == 0:
            now = datetime.now()
            
            meetings = [
                # Upcoming meetings
                Meeting(meeting_code="zoom123", host_id=user.id, title="Team Sync", description="Weekly sync", meeting_type=MeetingType.scheduled, scheduled_at=now + timedelta(days=1), duration_minutes=60, status=MeetingStatus.scheduled),
                Meeting(meeting_code="zoom456", host_id=user.id, title="Project Review", description="Q3 Review", meeting_type=MeetingType.scheduled, scheduled_at=now + timedelta(days=2), duration_minutes=90, status=MeetingStatus.scheduled),
                Meeting(meeting_code="zoom789", host_id=user.id, title="Client Demo", description="Product demo", meeting_type=MeetingType.scheduled, scheduled_at=now + timedelta(days=3), duration_minutes=45, status=MeetingStatus.scheduled),
                
                # Past/recent meetings
                Meeting(meeting_code="past123", host_id=user.id, title="Design Brainstorm", meeting_type=MeetingType.scheduled, scheduled_at=now - timedelta(days=1), duration_minutes=60, status=MeetingStatus.ended),
                Meeting(meeting_code="past456", host_id=user.id, title="1:1 Meeting", meeting_type=MeetingType.instant, scheduled_at=now - timedelta(days=2), duration_minutes=30, status=MeetingStatus.ended),
            ]
            
            for m in meetings:
                db.add(m)
            
            db.commit()
            print("Seeded database with sample meetings.")
        else:
            print("Sample meetings already exist.")
            
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting database seed...")
    seed_db()
    print("Database seeding completed.")
