-- Ensure authenticated users can insert items
-- First, let's check if there's already an INSERT policy
-- If not, we'll create one

-- Drop existing policy if it exists to recreate it properly
DROP POLICY IF EXISTS "Authenticated users can create items" ON public.items;

-- Create a proper INSERT policy for authenticated users
CREATE POLICY "Authenticated users can create items"
ON public.items
FOR INSERT
TO authenticated
WITH CHECK (true);