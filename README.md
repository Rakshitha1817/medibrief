# MediBrief — Intelligent Medical Report Analysis Platform

MediBrief is a production-ready, full-stack AI healthcare web application for analyzing blood reports and prescriptions using the Groq API.

## Tech Stack
- **Frontend**: React + Vite + TypeScript + Tailwind CSS v4 + Framer Motion
- **Backend**: Python FastAPI + PyMuPDF + Groq API
- **Database/Auth**: Supabase (PostgreSQL + Auth + Storage)
- **Hosting**: Vercel (frontend) + Render (backend)

## Features
- PDF and image upload for lab reports and prescriptions
- AI-powered biomarker extraction and health summary (Groq LLaMA 3)
- Prescription medicine breakdown with generic alternatives
- Secure authentication via Supabase Auth
- Clean, professional dashboard UI

## Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # fill in your keys
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local  # fill in your keys
npm run dev
```

## Environment Variables

### Backend `.env`
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
ENVIRONMENT=development
```

### Frontend `.env.local`
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=http://localhost:8000
```

## Disclaimer
This platform is for informational purposes only and does not constitute medical advice.
