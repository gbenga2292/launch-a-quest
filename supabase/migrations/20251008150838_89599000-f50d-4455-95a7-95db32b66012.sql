-- Create tables for inventory management system

-- Items/Assets table
CREATE TABLE IF NOT EXISTS public.items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  unit TEXT,
  category TEXT,
  location TEXT,
  description TEXT,
  type TEXT,
  status TEXT DEFAULT 'active',
  condition TEXT,
  site_id TEXT,
  checkout_type TEXT,
  low_stock_level INTEGER DEFAULT 0,
  critical_stock_level INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sites table
CREATE TABLE IF NOT EXISTS public.sites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  description TEXT,
  client_name TEXT,
  contact_person TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS public.vehicles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Waybills table
CREATE TABLE IF NOT EXISTS public.waybills (
  id TEXT PRIMARY KEY,
  site_id TEXT,
  driver_name TEXT,
  vehicle TEXT,
  issue_date TEXT,
  expected_return_date TEXT,
  purpose TEXT,
  service TEXT,
  return_to_site_id TEXT,
  status TEXT DEFAULT 'draft',
  type TEXT DEFAULT 'waybill',
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Quick checkouts table
CREATE TABLE IF NOT EXISTS public.quick_checkouts (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  employee TEXT NOT NULL,
  checkout_date TEXT,
  expected_return_days INTEGER,
  status TEXT DEFAULT 'active',
  site_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Return bills table
CREATE TABLE IF NOT EXISTS public.return_bills (
  id TEXT PRIMARY KEY,
  waybill_id TEXT,
  return_date TEXT,
  received_by TEXT,
  condition TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Site inventory table
CREATE TABLE IF NOT EXISTS public.site_inventory (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  unit TEXT,
  category TEXT,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Site transactions table
CREATE TABLE IF NOT EXISTS public.site_transactions (
  id TEXT PRIMARY KEY,
  site_id TEXT,
  asset_id TEXT,
  asset_name TEXT,
  quantity INTEGER,
  type TEXT,
  transaction_type TEXT,
  reference_id TEXT,
  reference_type TEXT,
  condition TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- Activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Company settings table
CREATE TABLE IF NOT EXISTS public.company_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  company_name TEXT,
  logo TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  currency TEXT DEFAULT 'USD',
  date_format TEXT DEFAULT 'MM/dd/yyyy',
  theme TEXT DEFAULT 'light',
  notifications_email BOOLEAN DEFAULT true,
  notifications_push BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Backup settings table
CREATE TABLE IF NOT EXISTS public.backup_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  auto_backup BOOLEAN DEFAULT false,
  frequency TEXT DEFAULT 'weekly',
  retention_count INTEGER DEFAULT 5,
  last_backup TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Enable Row Level Security
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waybills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for now - will add authentication later)
CREATE POLICY "Allow all on items" ON public.items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on sites" ON public.sites FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on vehicles" ON public.vehicles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on waybills" ON public.waybills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on quick_checkouts" ON public.quick_checkouts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on return_bills" ON public.return_bills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on site_inventory" ON public.site_inventory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on site_transactions" ON public.site_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on activities" ON public.activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on company_settings" ON public.company_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on backup_settings" ON public.backup_settings FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON public.sites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_waybills_updated_at
  BEFORE UPDATE ON public.waybills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_backup_settings_updated_at
  BEFORE UPDATE ON public.backup_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default company settings
INSERT INTO public.company_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Insert default backup settings
INSERT INTO public.backup_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;