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
        # Clear all existing meetings to ensure a completely fresh start for the user
        db.query(Meeting).delete()
        db.commit()
        print("Database wiped clean for fresh user testing.")
            
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting database seed...")
    seed_db()
    print("Database seeding completed.")
