-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  age INTEGER,
  gender TEXT,
  medical_history TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Medical Reports table
CREATE TABLE medical_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Biomarkers table
CREATE TABLE biomarkers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID REFERENCES medical_reports(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  marker_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
  normal_range TEXT,
  status TEXT CHECK (status IN ('low', 'normal', 'borderline', 'high', 'critical')),
  extracted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create AI Summaries table
CREATE TABLE ai_summaries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID REFERENCES medical_reports(id) ON DELETE CASCADE UNIQUE NOT NULL,
  patient_summary TEXT NOT NULL,
  doctor_summary TEXT NOT NULL,
  risk_level TEXT CHECK (risk_level IN ('low', 'moderate', 'high')),
  recommendations JSONB,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Health Scores table
CREATE TABLE health_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  contributing_factors JSONB,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS Policies Setup (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE biomarkers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_scores ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Medical Reports: Users can only see and insert their own
CREATE POLICY "Users can view own reports" ON medical_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reports" ON medical_reports FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Biomarkers
CREATE POLICY "Users can view own biomarkers" ON biomarkers FOR SELECT USING (auth.uid() = user_id);

-- AI Summaries
CREATE POLICY "Users can view summaries of own reports" ON ai_summaries FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM medical_reports mr 
    WHERE mr.id = ai_summaries.report_id AND mr.user_id = auth.uid()
  )
);

-- Health Scores
CREATE POLICY "Users can view own health scores" ON health_scores FOR SELECT USING (auth.uid() = user_id);

-- Storage bucket setup (Assuming you created a bucket named 'medical_reports')
-- Note: These run in the storage schema or through UI
-- CREATE POLICY "Users can upload own reports" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'medical_reports' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can view own reports" ON storage.objects FOR SELECT USING (bucket_id = 'medical_reports' AND auth.uid()::text = (storage.foldername(name))[1]);
