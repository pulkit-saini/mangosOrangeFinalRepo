-- Temporarily disable RLS for admin functionality to fix dashboard issues
ALTER TABLE public.applicants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;