-- Create items table
CREATE TABLE IF NOT EXISTS public.items (
  id TEXT PRIMARY KEY,
  site_id TEXT DEFAULT NULL,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 0 CHECK (quantity >= 0),
  unit TEXT,
  category TEXT,
  description TEXT,
  type TEXT,
  status TEXT DEFAULT 'active',
  condition TEXT DEFAULT 'good',
  checkout_type TEXT DEFAULT NULL,
  low_stock_level INTEGER DEFAULT 0,
  critical_stock_level INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sites table
CREATE TABLE IF NOT EXISTS public.sites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  description TEXT,
  client_name TEXT,
  contact_person TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS public.vehicles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create company_settings table
CREATE TABLE IF NOT EXISTS public.company_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create backup_settings table
CREATE TABLE IF NOT EXISTS public.backup_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  auto_backup BOOLEAN DEFAULT false,
  frequency TEXT DEFAULT 'weekly',
  retention_count INTEGER DEFAULT 5,
  last_backup TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create waybills table
CREATE TABLE IF NOT EXISTS public.waybills (
  id TEXT PRIMARY KEY,
  site_id TEXT,
  driver_name TEXT,
  vehicle TEXT,
  issue_date TIMESTAMP WITH TIME ZONE,
  expected_return_date TIMESTAMP WITH TIME ZONE,
  purpose TEXT,
  service TEXT,
  return_to_site_id TEXT,
  status TEXT DEFAULT 'outstanding',
  type TEXT DEFAULT 'waybill',
  items JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create quick_checkouts table
CREATE TABLE IF NOT EXISTS public.quick_checkouts (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  employee TEXT NOT NULL,
  checkout_date TIMESTAMP WITH TIME ZONE,
  expected_return_days INTEGER,
  status TEXT DEFAULT 'outstanding',
  site_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create return_bills table
CREATE TABLE IF NOT EXISTS public.return_bills (
  id TEXT PRIMARY KEY,
  waybill_id TEXT,
  return_date TIMESTAMP WITH TIME ZONE,
  received_by TEXT,
  condition TEXT,
  notes TEXT,
  status TEXT DEFAULT 'initiated',
  items JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create site_transactions table
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT
);

-- Create activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  action TEXT,
  entity TEXT,
  entity_id TEXT,
  details TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waybills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users (read/write access)
-- Items policies
CREATE POLICY "Authenticated users can view items" ON public.items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create items" ON public.items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update items" ON public.items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete items" ON public.items FOR DELETE TO authenticated USING (true);

-- Sites policies
CREATE POLICY "Authenticated users can view sites" ON public.sites FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create sites" ON public.sites FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update sites" ON public.sites FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete sites" ON public.sites FOR DELETE TO authenticated USING (true);

-- Employees policies
CREATE POLICY "Authenticated users can view employees" ON public.employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create employees" ON public.employees FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update employees" ON public.employees FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete employees" ON public.employees FOR DELETE TO authenticated USING (true);

-- Vehicles policies
CREATE POLICY "Authenticated users can view vehicles" ON public.vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create vehicles" ON public.vehicles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can delete vehicles" ON public.vehicles FOR DELETE TO authenticated USING (true);

-- Company settings policies
CREATE POLICY "Authenticated users can view company settings" ON public.company_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update company settings" ON public.company_settings FOR UPDATE TO authenticated USING (true);

-- Backup settings policies
CREATE POLICY "Authenticated users can view backup settings" ON public.backup_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update backup settings" ON public.backup_settings FOR UPDATE TO authenticated USING (true);

-- Waybills policies
CREATE POLICY "Authenticated users can view waybills" ON public.waybills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create waybills" ON public.waybills FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update waybills" ON public.waybills FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete waybills" ON public.waybills FOR DELETE TO authenticated USING (true);

-- Quick checkouts policies
CREATE POLICY "Authenticated users can view quick checkouts" ON public.quick_checkouts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create quick checkouts" ON public.quick_checkouts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update quick checkouts" ON public.quick_checkouts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete quick checkouts" ON public.quick_checkouts FOR DELETE TO authenticated USING (true);

-- Return bills policies
CREATE POLICY "Authenticated users can view return bills" ON public.return_bills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create return bills" ON public.return_bills FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update return bills" ON public.return_bills FOR UPDATE TO authenticated USING (true);

-- Site transactions policies
CREATE POLICY "Authenticated users can view site transactions" ON public.site_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create site transactions" ON public.site_transactions FOR INSERT TO authenticated WITH CHECK (true);

-- Activities policies
CREATE POLICY "Authenticated users can view activities" ON public.activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create activities" ON public.activities FOR INSERT TO authenticated WITH CHECK (true);

-- Add foreign key constraint for items referencing sites
ALTER TABLE public.items ADD CONSTRAINT items_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE SET NULL;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON public.sites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON public.company_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_backup_settings_updated_at BEFORE UPDATE ON public.backup_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_waybills_updated_at BEFORE UPDATE ON public.waybills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quick_checkouts_updated_at BEFORE UPDATE ON public.quick_checkouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();