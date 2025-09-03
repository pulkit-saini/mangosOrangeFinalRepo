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