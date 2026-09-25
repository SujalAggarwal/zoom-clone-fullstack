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
        # We won't seed any dummy meetings initially.
        # This ensures the Recent tab is completely empty for a new user, 
        # and meetings only show up there after they actually create them.
        pass
        else:
            print("Sample meetings already exist.")
            
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting database seed...")
    seed_db()
    print("Database seeding completed.")
