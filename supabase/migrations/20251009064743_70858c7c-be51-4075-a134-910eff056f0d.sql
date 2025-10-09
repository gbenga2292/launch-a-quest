-- Add total_stock and reserved columns to items table
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS total_stock integer DEFAULT 0;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS reserved integer DEFAULT 0;

-- Copy quantity to total_stock for existing records
UPDATE public.items SET total_stock = COALESCE(quantity, 0) WHERE total_stock = 0;

-- We'll keep quantity column for now for backward compatibility
-- Later we can remove it once everything is migrated