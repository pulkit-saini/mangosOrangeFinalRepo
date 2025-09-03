-- Create a policy to allow authentication queries (reading admin_users for login)
CREATE POLICY "Allow authentication queries" 
ON public.admin_users 
FOR SELECT 
USING (true);

-- Also ensure we can insert new admin users during signup
CREATE POLICY "Allow admin user creation" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (true);