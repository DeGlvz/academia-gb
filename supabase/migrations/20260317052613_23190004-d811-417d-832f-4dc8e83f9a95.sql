
-- Fix the overly permissive INSERT policy on purchase_attempts
-- Replace with a check that requires either a valid user_id or a session_id
DROP POLICY "Anyone can insert attempts" ON public.purchase_attempts;

CREATE POLICY "Users can insert attempts with session" ON public.purchase_attempts 
FOR INSERT WITH CHECK (
  session_id IS NOT NULL OR user_id = auth.uid()
);
