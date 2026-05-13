from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="MediBrief API",
    description="Backend API for the MediBrief Intelligent Medical Report Analysis Platform",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost:5173",  # Frontend Vite default
    "http://127.0.0.1:5173",
    # Add production frontend URL here later
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api import reports

app.include_router(reports.router, prefix="/api/reports", tags=["reports"])

@app.get("/")
async def root():
    return {"message": "Welcome to MediBrief API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
