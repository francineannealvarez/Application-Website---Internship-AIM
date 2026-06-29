-- Supabase RMS Schema
-- Simplified 2-role system: Admin/HR and Applicant
-- Tables: profiles, job_postings, applications, notifications
-- All tables have Row Level Security enabled with TODO policy stubs

-- ============================================================================
-- 1. PROFILES TABLE
-- Stores user roles and basic info
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'applicant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- TODO: Create RLS policy for profiles
-- - Admins can view all profiles
-- - Applicants can only view their own profile
-- CREATE POLICY "policy_name" ON profiles FOR SELECT USING (...);

-- ============================================================================
-- 2. JOB_POSTINGS TABLE
-- HR creates job postings; applicants view open ones
-- ============================================================================
CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_open BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;

-- TODO: Create RLS policies for job_postings
-- - Admins can create, update, delete all postings
-- - Applicants can only view postings where is_open = true
-- CREATE POLICY "admin_full_access" ON job_postings ...;
-- CREATE POLICY "applicant_view_open" ON job_postings FOR SELECT USING (...);

-- ============================================================================
-- 3. APPLICATIONS TABLE
-- Applicants submit applications; HR reviews and updates status
-- ============================================================================
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  job_posting_id UUID NOT NULL REFERENCES job_postings ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- TODO: Create RLS policies for applications
-- - Admins can view, update all applications
-- - Applicants can only view/create their own applications
-- CREATE POLICY "admin_full_access" ON applications ...;
-- CREATE POLICY "applicant_view_own" ON applications FOR SELECT USING (...);
-- CREATE POLICY "applicant_create" ON applications FOR INSERT WITH CHECK (...);

-- ============================================================================
-- 4. NOTIFICATIONS TABLE
-- System notifications for both admins and applicants
-- ============================================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- TODO: Create RLS policies for notifications
-- - Users can only view their own notifications
-- - System can insert notifications for any user (admin client)
-- CREATE POLICY "users_view_own" ON notifications FOR SELECT USING (...);
-- CREATE POLICY "system_insert" ON notifications FOR INSERT WITH CHECK (...);
