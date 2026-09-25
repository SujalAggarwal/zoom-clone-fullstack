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
                # Past/recent meetings only (so Upcoming tab stays clean for user testing)
                Meeting(meeting_code="842-951-332", host_id=user.id, title="Frontend Architecture Review", meeting_type=MeetingType.scheduled, scheduled_at=now - timedelta(days=1), duration_minutes=60, status=MeetingStatus.ended),
                Meeting(meeting_code="521-893-019", host_id=user.id, title="Sprint Retrospective", meeting_type=MeetingType.instant, scheduled_at=now - timedelta(days=2), duration_minutes=30, status=MeetingStatus.ended),
                Meeting(meeting_code="394-118-992", host_id=user.id, title="Client Onboarding", meeting_type=MeetingType.scheduled, scheduled_at=now - timedelta(days=5), duration_minutes=45, status=MeetingStatus.ended),
            ]
            
            for m in meetings:
                db.add(m)
            
            db.commit()
            print("Seeded database with sample past meetings.")
        else:
            print("Sample meetings already exist.")
            
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting database seed...")
    seed_db()
    print("Database seeding completed.")
