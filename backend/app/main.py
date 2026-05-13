from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="MediBrief API",
    description="Backend API for the MediBrief Intelligent Medical Report Analysis Platform",
    version="1.0.0"
)

# Allowed frontend origins
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://your-frontend.vercel.app",  # Replace after Vercel deploy
]

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import reports router safely
try:
    from app.api import reports

    app.include_router(
        reports.router,
        prefix="/api/reports",
        tags=["reports"]
    )

except Exception as e:
    print(f"Reports router failed to load: {e}")


@app.get("/")
async def root():
    return {
        "message": "Welcome to MediBrief API",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy"
    }