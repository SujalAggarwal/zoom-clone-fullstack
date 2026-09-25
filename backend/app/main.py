from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import meetings, signaling

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Zoom Clone API")

# Configure CORS — list all allowed origins explicitly
origins = [
    "http://localhost:3000",
    "https://frontend-eight-livid-03b04fqa69.vercel.app",
    # Allow all vercel previews for this project
    "https://*.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meetings.router, prefix="/meetings", tags=["Meetings"])
app.include_router(signaling.router, tags=["Signaling"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
