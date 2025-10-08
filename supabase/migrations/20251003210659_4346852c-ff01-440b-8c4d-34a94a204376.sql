-- Add missing location column to items table
ALTER TABLE public.items
ADD COLUMN IF NOT EXISTS location text;