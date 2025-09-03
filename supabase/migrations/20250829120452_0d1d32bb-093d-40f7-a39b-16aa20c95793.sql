-- Add name column to admin_users table
ALTER TABLE public.admin_users 
ADD COLUMN name TEXT;

-- Insert the admin account with specified credentials
INSERT INTO public.admin_users (email, password_hash, role, name)
VALUES ('admin@mangosorange.com', 'admin123', 'Admin', 'Ravi Rautela')
ON CONFLICT (email) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  name = EXCLUDED.name;