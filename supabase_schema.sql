-- =====================================================
-- MediBrief Supabase Schema (v2 — with analysis storage)
-- Run this in Supabase SQL Editor
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Profiles ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  age INTEGER,
  gender TEXT,
  medical_history TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Medical Reports ───────────────────────────────────
-- Stores file metadata + full analysis results in JSON columns
CREATE TABLE IF NOT EXISTS medical_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  report_type TEXT DEFAULT 'lab_report' CHECK (report_type IN ('lab_report', 'prescription')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  biomarkers_json JSONB,
  ai_summary_text TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS ───────────────────────────────────────────────
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_reports ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users view own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Medical Reports
CREATE POLICY "Users view own reports"   ON medical_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own reports" ON medical_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own reports" ON medical_reports FOR DELETE USING (auth.uid() = user_id);

-- ── Auto-create profile on signup ─────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
