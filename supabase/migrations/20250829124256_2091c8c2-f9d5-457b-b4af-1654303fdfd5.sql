-- Fix the function search path security warning by setting search_path
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;