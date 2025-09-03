-- Relax applicants RLS to allow authenticated sessions (admin UI uses anonymous auth session)
DROP POLICY IF EXISTS "Only admin and recruiters can read applicants" ON public.applicants;
DROP POLICY IF EXISTS "Only admin and recruiters can update applicants" ON public.applicants;
DROP POLICY IF EXISTS "Only admin and recruiters can delete applicants" ON public.applicants;

CREATE POLICY "Authenticated can read applicants" 
ON public.applicants
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can update applicants" 
ON public.applicants
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated can delete applicants" 
ON public.applicants
FOR DELETE
TO authenticated
USING (true);