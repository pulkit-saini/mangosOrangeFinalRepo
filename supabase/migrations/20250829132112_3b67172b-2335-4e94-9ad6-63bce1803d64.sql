-- Update the is_admin_or_recruiter function to work with the auth mapping
CREATE OR REPLACE FUNCTION public.is_admin_or_recruiter()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_metadata jsonb;
  admin_user_id uuid;
BEGIN
  -- Get the current auth user's metadata
  SELECT raw_user_meta_data INTO user_metadata
  FROM auth.users 
  WHERE id = auth.uid();
  
  -- If we have user_id in metadata, use that
  IF user_metadata IS NOT NULL AND user_metadata->>'user_id' IS NOT NULL THEN
    admin_user_id := (user_metadata->>'user_id')::uuid;
  ELSE
    -- Fallback: try to find admin_users record by auth user id
    admin_user_id := auth.uid();
  END IF;
  
  -- Check if the user exists in admin_users table with admin or recruiter role
  RETURN EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE id = admin_user_id
    AND role IN ('Admin', 'Recruiter')
  );
END;
$function$

-- Update admin_users policies to work with the new auth system
DROP POLICY IF EXISTS "Admin users can read own data" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can update own data" ON public.admin_users;

CREATE POLICY "Admin users can read own data" 
ON public.admin_users 
FOR SELECT 
USING (
  CASE 
    WHEN auth.uid() IS NULL THEN false
    ELSE (
      -- Check if auth user metadata contains user_id that matches
      (SELECT raw_user_meta_data->>'user_id' FROM auth.users WHERE id = auth.uid())::uuid = admin_users.id
      OR 
      -- Direct match fallback
      auth.uid() = admin_users.id
    )
  END
);

CREATE POLICY "Admin users can update own data" 
ON public.admin_users 
FOR UPDATE 
USING (
  CASE 
    WHEN auth.uid() IS NULL THEN false
    ELSE (
      -- Check if auth user metadata contains user_id that matches
      (SELECT raw_user_meta_data->>'user_id' FROM auth.users WHERE id = auth.uid())::uuid = admin_users.id
      OR 
      -- Direct match fallback
      auth.uid() = admin_users.id
    )
  END
);