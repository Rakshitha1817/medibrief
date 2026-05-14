# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="MediBrief API",
    description="Backend API for the MediBrief Intelligent**What’s happening now**

- The **router import block** in `backend/app/main.py` is still being overwritten by a large explanatory comment block that you added while trying to fix the issue.  
- Because that comment block is inside the Python file, the interpreter treats everything after line 7 as part of the **string literal** for `description`. Consequently the code that registers the router (`from .api import reports`) is **never executed**.  
- The FastAPI app therefore has **no `/api/reports/...` routes**, which is why the production backend still returns **404 Not Found** (the same as you saw when calling `https://medibrief.onrender.com/api/reports/upload`).

### Fix – Clean out the explanatory comment and keep only valid Python code

We need to replace the entire `backend/app/main.py` with a clean, functional FastAPI app that:

1. Defines `app` with title, description, version.  
2. Sets CORS origins.  
3. **Imports the `reports` router unconditionally** and includes it.  
4. Provides the simple root and health endpoints.

#### Correct content for `backend/app/main.py`

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

# Register API routers – must be imported unconditionally
from .api import reports

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
