-- ==============================================================================
-- PERSONAL STUDY PROGRESS TRACKER & PERFORMANCE ANALYTICS
-- Complete Supabase PostgreSQL Schema with Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  target_daily_study_hours NUMERIC(4, 2) DEFAULT 6.0,
  target_daily_questions INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. TIMETABLE TEMPLATES
CREATE TABLE IF NOT EXISTS public.timetable_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL CHECK (template_type IN ('college', 'no-college', 'custom')),
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. TIMETABLE TASKS (Template Tasks)
CREATE TABLE IF NOT EXISTS public.timetable_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.timetable_templates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_order INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  subject TEXT NOT NULL CHECK (subject IN ('DSA', 'MERN', 'Python', 'DevOps', 'Aptitude', 'Revision', 'General', 'Break')),
  start_time TEXT NOT NULL, -- Format 'HH:mm'
  end_time TEXT NOT NULL,   -- Format 'HH:mm'
  planned_duration_minutes INTEGER NOT NULL CHECK (planned_duration_minutes >= 0),
  spans_midnight BOOLEAN DEFAULT false,
  questions_planned INTEGER DEFAULT 0 CHECK (questions_planned >= 0),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. DAILY STUDY DAYS
CREATE TABLE IF NOT EXISTS public.study_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL, -- Asia/Kolkata date
  template_type TEXT NOT NULL CHECK (template_type IN ('college', 'no-college', 'custom')),
  notes TEXT,
  sleep_hours NUMERIC(3, 1) CHECK (sleep_hours IS NULL OR (sleep_hours >= 0 AND sleep_hours <= 24)),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, date)
);

-- 5. DAILY TASK RECORDS
CREATE TABLE IF NOT EXISTS public.daily_task_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  study_day_id UUID REFERENCES public.study_days(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  task_order INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  subject TEXT NOT NULL CHECK (subject IN ('DSA', 'MERN', 'Python', 'DevOps', 'Aptitude', 'Revision', 'General', 'Break')),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  planned_duration_minutes INTEGER NOT NULL DEFAULT 0 CHECK (planned_duration_minutes >= 0),
  actual_duration_minutes INTEGER NOT NULL DEFAULT 0 CHECK (actual_duration_minutes >= 0),
  status TEXT NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Completed', 'Partially Completed', 'Missed')),
  is_completed BOOLEAN DEFAULT false,
  questions_planned INTEGER NOT NULL DEFAULT 0 CHECK (questions_planned >= 0),
  questions_attempted INTEGER NOT NULL DEFAULT 0 CHECK (questions_attempted >= 0),
  correct_answers INTEGER NOT NULL DEFAULT 0 CHECK (correct_answers >= 0),
  incorrect_answers INTEGER NOT NULL DEFAULT 0 CHECK (incorrect_answers >= 0),
  difficult_topics_notes TEXT,
  mistake_notes TEXT,
  revision_required BOOLEAN DEFAULT false,
  personal_notes TEXT,
  spans_midnight BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  CONSTRAINT chk_questions_valid CHECK (correct_answers + incorrect_answers <= questions_attempted)
);

-- 6. CODING MISTAKES (DSA & Coding Mistake Tracker)
CREATE TABLE IF NOT EXISTS public.coding_mistakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  daily_task_id UUID REFERENCES public.daily_task_records(id) ON DELETE SET NULL,
  problem_name TEXT NOT NULL,
  problem_url TEXT,
  topic TEXT NOT NULL, -- e.g. Binary Search, Dynamic Programming, Graph, Sliding Window
  pattern TEXT,        -- e.g. Two Pointers, Monotonic Stack, Backtracking
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  category TEXT NOT NULL CHECK (category IN ('Conceptual', 'Logical', 'Implementation', 'Edge Case', 'Time Complexity')),
  mistake_explanation TEXT NOT NULL,
  correct_approach TEXT NOT NULL,
  next_revision_date DATE,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 7. DIFFICULT TOPICS (Weak Topics Tracker with revision tracking)
CREATE TABLE IF NOT EXISTS public.difficult_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_name TEXT NOT NULL,
  domain TEXT NOT NULL CHECK (domain IN ('DSA', 'MERN', 'Python', 'DevOps', 'Aptitude', 'CS Fundamentals', 'Other')),
  reason_difficult TEXT NOT NULL,
  confidence_rating INTEGER NOT NULL DEFAULT 1 CHECK (confidence_rating BETWEEN 1 AND 5),
  revision_attempts INTEGER NOT NULL DEFAULT 0 CHECK (revision_attempts >= 0),
  last_revised_date DATE,
  understanding_status TEXT NOT NULL DEFAULT 'Struggling' CHECK (understanding_status IN ('Struggling', 'Improving', 'Comfortable', 'Mastered')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 8. REVISION LOGS
CREATE TABLE IF NOT EXISTS public.revision_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('difficult_topic', 'coding_mistake', 'daily_task')),
  target_id UUID NOT NULL,
  previous_confidence INTEGER CHECK (previous_confidence BETWEEN 1 AND 5),
  new_confidence INTEGER CHECK (new_confidence BETWEEN 1 AND 5),
  notes TEXT,
  revision_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 9. STUDY SESSIONS (Time tracking stopwatch or session records)
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  daily_task_id UUID REFERENCES public.daily_task_records(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 0 CHECK (duration_minutes >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 10. REPORT GOALS AND REFLECTIONS
CREATE TABLE IF NOT EXISTS public.report_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('weekly', '15-day', 'monthly', 'custom')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reflections TEXT,
  next_period_goals TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE ANALYTICS AND QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_study_days_user_date ON public.study_days(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_date ON public.daily_task_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_subject ON public.daily_task_records(user_id, subject);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_status ON public.daily_task_records(user_id, status);
CREATE INDEX IF NOT EXISTS idx_coding_mistakes_user ON public.coding_mistakes(user_id);
CREATE INDEX IF NOT EXISTS idx_coding_mistakes_category ON public.coding_mistakes(user_id, category);
CREATE INDEX IF NOT EXISTS idx_coding_mistakes_resolved ON public.coding_mistakes(user_id, is_resolved);
CREATE INDEX IF NOT EXISTS idx_difficult_topics_user ON public.difficult_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_difficult_topics_confidence ON public.difficult_topics(user_id, confidence_rating);
CREATE INDEX IF NOT EXISTS idx_revision_logs_user_target ON public.revision_logs(user_id, target_id);
CREATE INDEX IF NOT EXISTS idx_report_goals_user_period ON public.report_goals(user_id, report_type, start_date, end_date);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_task_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.difficult_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_goals ENABLE ROW LEVEL SECURITY;

-- 1. Profiles RLS
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Timetable Templates RLS
CREATE POLICY "Users can view own templates" ON public.timetable_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own templates" ON public.timetable_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON public.timetable_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON public.timetable_templates FOR DELETE USING (auth.uid() = user_id);

-- 3. Timetable Tasks RLS
CREATE POLICY "Users can view own template tasks" ON public.timetable_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own template tasks" ON public.timetable_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own template tasks" ON public.timetable_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own template tasks" ON public.timetable_tasks FOR DELETE USING (auth.uid() = user_id);

-- 4. Study Days RLS
CREATE POLICY "Users can view own study days" ON public.study_days FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own study days" ON public.study_days FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own study days" ON public.study_days FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own study days" ON public.study_days FOR DELETE USING (auth.uid() = user_id);

-- 5. Daily Task Records RLS
CREATE POLICY "Users can view own task records" ON public.daily_task_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own task records" ON public.daily_task_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own task records" ON public.daily_task_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own task records" ON public.daily_task_records FOR DELETE USING (auth.uid() = user_id);

-- 6. Coding Mistakes RLS
CREATE POLICY "Users can view own coding mistakes" ON public.coding_mistakes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own coding mistakes" ON public.coding_mistakes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own coding mistakes" ON public.coding_mistakes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own coding mistakes" ON public.coding_mistakes FOR DELETE USING (auth.uid() = user_id);

-- 7. Difficult Topics RLS
CREATE POLICY "Users can view own difficult topics" ON public.difficult_topics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own difficult topics" ON public.difficult_topics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own difficult topics" ON public.difficult_topics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own difficult topics" ON public.difficult_topics FOR DELETE USING (auth.uid() = user_id);

-- 8. Revision Logs RLS
CREATE POLICY "Users can view own revision logs" ON public.revision_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own revision logs" ON public.revision_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own revision logs" ON public.revision_logs FOR DELETE USING (auth.uid() = user_id);

-- 9. Study Sessions RLS
CREATE POLICY "Users can view own study sessions" ON public.study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own study sessions" ON public.study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own study sessions" ON public.study_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own study sessions" ON public.study_sessions FOR DELETE USING (auth.uid() = user_id);

-- 10. Report Goals RLS
CREATE POLICY "Users can view own report goals" ON public.report_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own report goals" ON public.report_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own report goals" ON public.report_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own report goals" ON public.report_goals FOR DELETE USING (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
