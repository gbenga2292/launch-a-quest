-- Create site_inventory table for tracking current inventory at each site
CREATE TABLE public.site_inventory (
  id TEXT NOT NULL PRIMARY KEY,
  site_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT,
  category TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_site_item UNIQUE(site_id, item_id)
);

-- Enable RLS
ALTER TABLE public.site_inventory ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view site inventory"
ON public.site_inventory
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert site inventory"
ON public.site_inventory
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update site inventory"
ON public.site_inventory
FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete site inventory"
ON public.site_inventory
FOR DELETE
USING (true);

-- Create indexes for faster lookups
CREATE INDEX idx_site_inventory_site_id ON public.site_inventory(site_id);
CREATE INDEX idx_site_inventory_item_id ON public.site_inventory(item_id);

-- Create function to update last_updated timestamp
CREATE OR REPLACE FUNCTION public.update_site_inventory_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_site_inventory_timestamp
BEFORE UPDATE ON public.site_inventory
FOR EACH ROW
EXECUTE FUNCTION public.update_site_inventory_timestamp();