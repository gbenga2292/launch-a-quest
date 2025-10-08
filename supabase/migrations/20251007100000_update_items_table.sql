ALTER TABLE public.items RENAME COLUMN quantity TO total_stock;

ALTER TABLE public.items ADD COLUMN reserved INTEGER DEFAULT 0;
