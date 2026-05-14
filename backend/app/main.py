# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="MediBrief API",
    description="Backend API for the MediBrief Intelligent Medical Report**Root cause of the production `Not Found` error**

The FastAPI router for the upload endpoints is **not being registered** because the import block in `backend/app/main.py` is wrapped in a `try/except`.  
When the module fails to import (e.g., due to a relative‑import issue), the router is never added, so `/api/reports/upload` simply returns a 404.  

That explains why:

- **Local dev** works (the import succeeds because the module path resolves).  
- **Production (Render + Vercel rewrite)** hits the backend but gets `{"detail":"Not Found"}` – the route simply does not exist.

---

## ✅ Fix – Ensure the router is always loaded

1. **Replace the guarded import with a straightforward relative import** and include the router unconditionally.  
2. **Add a small safety log** in case something truly goes wrong, but let the import raise errors normally (so the deployment will fail loudly if the file is missing).

### Patch to `backend/app/main.py`

```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="MediBrief API",
    description="Backend API for the MediBrief Intelligent Medical Report Analysis Platform",
    version="1.0.0",
)

# Allowed frontend origins
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://medibrief.vercel.app",
    "https://medibrief.onrender.com",
]

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# Register API routers – **must be imported unconditionally**
# -------------------------------------------------
from .api import reports  # <‑‑ direct relative import

app.include_router(
    reports.router,
    prefix="/api/reports",
    tags=["reports"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to MediBrief API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
