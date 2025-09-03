-- Create a security definer function to check if current user has admin/recruiter role
CREATE OR REPLACE FUNCTION public.is_admin_or_recruiter()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the current user exists in admin_users table with admin or recruiter role
  RETURN EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE id = auth.uid() 
    AND role IN ('Admin', 'Recruiter')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can read all applicants" ON public.applicants;
DROP POLICY IF EXISTS "Authenticated users can update applicants" ON public.applicants;

-- Create secure policies that only allow admin/recruiter access
CREATE POLICY "Only admin and recruiters can read applicants" 
ON public.applicants 
FOR SELECT 
TO authenticated
USING (public.is_admin_or_recruiter());

CREATE POLICY "Only admin and recruiters can update applicants" 
ON public.applicants 
FOR UPDATE 
TO authenticated
USING (public.is_admin_or_recruiter())
WITH CHECK (public.is_admin_or_recruiter());

-- Add delete policy for admins/recruiters
CREATE POLICY "Only admin and recruiters can delete applicants" 
ON public.applicants 
FOR DELETE 
TO authenticated
USING (public.is_admin_or_recruiter());

-- Keep the existing insert policy as is (anyone can apply for jobs)
-- Policy "Anyone can insert applications" remains unchanged