import { supabase } from '@/integrations/supabase/client';

export interface Item {
  id: string;
  name: string;
  quantity: number | null;
  unit?: string | null;
  category?: string | null;
  location?: string | null;
  description?: string | null;
  type?: string | null;
  status?: string | null;
  condition?: string | null;
  site_id?: string | null;
  checkout_type?: string | null;
  low_stock_level?: number | null;
  critical_stock_level?: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Site {
  id: string;
  name: string;
  location?: string;
  description?: string;
  client_name?: string;
  contact_person?: string;
  phone?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  name: string;
  role?: string;
  phone?: string;
  email?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  name: string;
  created_at: string;
}

export interface CompanySettings {
  id: number;
  company_name?: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  currency?: string;
  date_format?: string;
  theme?: string;
  notifications_email?: boolean;
  notifications_push?: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackupSettings {
  id: number;
  auto_backup: boolean;
  frequency: string;
  retention_count: number;
  last_backup?: string;
  created_at: string;
  updated_at: string;
}

export interface WaybillItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
}

export interface Waybill {
  id: string;
  site_id?: string;
  driver_name?: string;
  vehicle?: string;
  issue_date?: string;
  expected_return_date?: string;
  purpose?: string;
  service?: string;
  return_to_site_id?: string;
  status?: string;
  type?: string;
  items: WaybillItem[];
  created_at: string;
  updated_at: string;
}

export interface QuickCheckout {
  id: string;
  asset_id: string;
  asset_name: string;
  quantity: number;
  employee: string;
  checkout_date?: string;
  expected_return_days?: number;
  status?: string;
  site_id?: string;
  created_at: string;
}

export interface ReturnBillItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  condition?: string;
}

export interface ReturnBill {
  id: string;
  waybill_id?: string;
  return_date?: string;
  received_by?: string;
  condition?: string;
  notes?: string;
  status?: string;
  items: ReturnBillItem[];
  created_at: string;
}

export interface SiteInventory {
  id: string;
  site_id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  unit?: string;
  category?: string;
  last_updated: string;
  created_at: string;
}

export interface SiteTransaction {
  id: string;
  site_id?: string;
  asset_id?: string;
  asset_name?: string;
  quantity?: number;
  type?: string;
  transaction_type?: string;
  reference_id?: string;
  reference_type?: string;
  condition?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
}

export interface Activity {
  id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  entity: string;
  entity_id?: string;
  details?: string;
  timestamp: string;
}

export const api = {
  async getItems(): Promise<Item[]> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to fetch items');
    return data || [];
  },

  async createItem(item: Omit<Item, 'id' | 'created_at' | 'updated_at'>): Promise<Item> {
    const id = `item_${Date.now()}`;
    const { data, error } = await supabase
      .from('items')
      .insert({
        id,
        ...item,
        quantity: item.quantity ?? 0,
        low_stock_level: item.low_stock_level ?? 0,
        critical_stock_level: item.critical_stock_level ?? 0,
      })
      .select()
      .single();

    if (error) throw new Error('Failed to create item');
    return data;
  },

  async updateItem(id: string, item: Partial<Omit<Item, 'id' | 'created_at' | 'updated_at'>>): Promise<Item> {
    const { data, error } = await supabase
      .from('items')
      .update(item)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error('Failed to update item');
    return data;
  },

  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) throw new Error('Failed to delete item');
  },

  async backupDatabase(): Promise<{ items: Item[], timestamp: string, version: string }> {
    const items = await this.getItems();
    return {
      items,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
  },

  async restoreDatabase(items: Item[]): Promise<void> {
    // Delete all existing items
    await supabase.from('items').delete().neq('id', '');

    // Insert all items
    const { error } = await supabase
      .from('items')
      .insert(items);

    if (error) throw new Error('Failed to restore database');
  },

  async resetDatabase(): Promise<void> {
    // Reset tables individually to avoid TypeScript issues
    const { error: itemsError } = await supabase.from('items').delete().neq('id', '');
    if (itemsError) throw new Error('Failed to reset items table');

    const { error: sitesError } = await supabase.from('sites').delete().neq('id', '');
    if (sitesError) throw new Error('Failed to reset sites table');

    const { error: employeesError } = await supabase.from('employees').delete().neq('id', '');
    if (employeesError) throw new Error('Failed to reset employees table');

    const { error: vehiclesError } = await supabase.from('vehicles').delete().neq('id', '');
    if (vehiclesError) throw new Error('Failed to reset vehicles table');

    const { error: waybillsError } = await supabase.from('waybills').delete().neq('id', '');
    if (waybillsError) throw new Error('Failed to reset waybills table');

    const { error: quickCheckoutsError } = await supabase.from('quick_checkouts').delete().neq('id', '');
    if (quickCheckoutsError) throw new Error('Failed to reset quick_checkouts table');

    const { error: siteTransactionsError } = await supabase.from('site_transactions').delete().neq('id', '');
    if (siteTransactionsError) throw new Error('Failed to reset site_transactions table');

    const { error: returnBillsError } = await supabase.from('return_bills').delete().neq('id', '');
    if (returnBillsError) throw new Error('Failed to reset return_bills table');

    const { error: siteInventoryError } = await supabase.from('site_inventory').delete().neq('id', '');
    if (siteInventoryError) throw new Error('Failed to reset site_inventory table');

    const { error: activitiesError } = await supabase.from('activities').delete().neq('id', '');
    if (activitiesError) throw new Error('Failed to reset activities table');

    // Reset company settings
    const { error: updateError } = await supabase
      .from('company_settings')
      .update({
        company_name: null,
        logo: null,
        address: null,
        phone: null,
        email: null,
        website: null,
        currency: 'USD',
        date_format: 'MM/dd/yyyy',
        theme: 'light',
        notifications_email: true,
        notifications_push: true,
      })
      .eq('id', 1);

    if (updateError) throw new Error('Failed to reset company settings');
  },

  async getSites(): Promise<Site[]> {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to fetch sites');
    return data || [];
  },

  async createSite(site: Omit<Site, 'id' | 'created_at' | 'updated_at'>): Promise<Site> {
    const id = `site_${Date.now()}`;
    const { data, error } = await supabase
      .from('sites')
      .insert({ id, ...site })
      .select()
      .single();

    if (error) throw new Error('Failed to create site');
    return data;
  },

  async updateSite(id: string, site: Partial<Omit<Site, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const { error } = await supabase
      .from('sites')
      .update(site)
      .eq('id', id);

    if (error) throw new Error('Failed to update site');
  },

  async deleteSite(id: string): Promise<void> {
    const { error } = await supabase
      .from('sites')
      .delete()
      .eq('id', id);

    if (error) throw new Error('Failed to delete site');
  },

  async getEmployees(): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to fetch employees');
    return data || [];
  },

  async createEmployee(employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): Promise<Employee> {
    const id = `emp_${Date.now()}`;
    const { data, error } = await supabase
      .from('employees')
      .insert({ id, ...employee })
      .select()
      .single();

    if (error) throw new Error('Failed to create employee');
    return data;
  },

  async updateEmployee(id: string, employee: Partial<Omit<Employee, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .update(employee)
      .eq('id', id);

    if (error) throw new Error('Failed to update employee');
  },

  async deleteEmployee(id: string): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) throw new Error('Failed to delete employee');
  },

  async getVehicles(): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to fetch vehicles');
    return data || [];
  },

  async createVehicle(vehicle: Omit<Vehicle, 'id' | 'created_at'>): Promise<Vehicle> {
    const id = `veh_${Date.now()}`;
    const { data, error } = await supabase
      .from('vehicles')
      .insert({ id, ...vehicle })
      .select()
      .single();

    if (error) throw new Error('Failed to create vehicle');
    return data;
  },

  async deleteVehicle(id: string): Promise<void> {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) throw new Error('Failed to delete vehicle');
  },

  async getCompanySettings(): Promise<CompanySettings> {
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) throw new Error('Failed to fetch company settings');

    if (!data) {
      // Create default settings if none exist
      const defaultSettings = {
        id: 1,
        currency: 'USD',
        date_format: 'MM/dd/yyyy',
        theme: 'light',
        notifications_email: true,
        notifications_push: true,
      };

      const { data: newData, error: insertError } = await supabase
        .from('company_settings')
        .insert(defaultSettings)
        .select()
        .single();

      if (insertError) throw new Error('Failed to create default company settings');
      return newData;
    }

    return data;
  },

  async updateCompanySettings(settings: Partial<Omit<CompanySettings, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const { error } = await supabase
      .from('company_settings')
      .update(settings)
      .eq('id', 1);

    if (error) throw new Error('Failed to update company settings');
  },

  async getBackupSettings(): Promise<BackupSettings> {
    const { data, error } = await supabase
      .from('backup_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) throw new Error('Failed to fetch backup settings');

    if (!data) {
      // Create default settings if none exist
      const defaultSettings = {
        id: 1,
        auto_backup: false,
        frequency: 'weekly',
        retention_count: 5,
      };

      const { data: newData, error: insertError } = await supabase
        .from('backup_settings')
        .insert(defaultSettings)
        .select()
        .single();

      if (insertError) throw new Error('Failed to create default backup settings');
      return newData;
    }

    return data;
  },

  async updateBackupSettings(settings: Partial<Omit<BackupSettings, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const { error } = await supabase
      .from('backup_settings')
      .update(settings)
      .eq('id', 1);

    if (error) throw new Error('Failed to update backup settings');
  },

  async getWaybills(): Promise<Waybill[]> {
    const { data, error } = await supabase
      .from('waybills')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to fetch waybills');
    return (data || []).map(w => ({
      ...w,
      items: typeof w.items === 'string' ? JSON.parse(w.items) : w.items
    }));
  },

  async createWaybill(waybill: Omit<Waybill, 'id' | 'created_at' | 'updated_at'>): Promise<Waybill> {
    // Use type assertion for RPC call
    const { data, error } = await (supabase.rpc as any)('create_waybill_and_reserve_stock', { waybill_data: waybill });

    if (error) throw new Error('Failed to create waybill: ' + error.message);

    return data;
  },

  async updateWaybill(id: string, waybill: Partial<Omit<Waybill, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    // Use type assertion for RPC call
    const { error } = await (supabase.rpc as any)('update_waybill_and_adjust_stock', { waybill_id_to_update: id, waybill_data: waybill });

    if (error) throw new Error('Failed to update waybill: ' + error.message);
  },

  async deleteWaybill(id: string): Promise<void> {
    // Use type assertion for RPC call
    const { error } = await (supabase.rpc as any)('delete_waybill_and_release_stock', { waybill_id_to_delete: id });

    if (error) throw new Error('Failed to delete waybill: ' + error.message);
  },

  async getQuickCheckouts(): Promise<QuickCheckout[]> {
    const { data, error } = await supabase
      .from('quick_checkouts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to fetch quick checkouts');
    return data || [];
  },

  async createQuickCheckout(checkout: Omit<QuickCheckout, 'id' | 'created_at'>): Promise<QuickCheckout> {
    const id = `qc_${Date.now()}`;
    const { data, error } = await supabase
      .from('quick_checkouts')
      .insert({ id, ...checkout })
      .select()
      .single();

    if (error) throw new Error('Failed to create quick checkout');
    return data;
  },

  async updateQuickCheckout(id: string, checkout: Partial<Omit<QuickCheckout, 'id' | 'created_at'>>): Promise<void> {
    const { error } = await supabase
      .from('quick_checkouts')
      .update(checkout)
      .eq('id', id);

    if (error) throw new Error('Failed to update quick checkout');
  },

  async deleteQuickCheckout(id: string): Promise<void> {
    const { error } = await supabase
      .from('quick_checkouts')
      .delete()
      .eq('id', id);

    if (error) throw new Error('Failed to delete quick checkout');
  },

  async getReturnBills(): Promise<ReturnBill[]> {
    const { data, error } = await supabase
      .from('return_bills')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to fetch return bills');
    return (data || []).map(rb => ({
      ...rb,
      items: typeof rb.items === 'string' ? JSON.parse(rb.items) : rb.items
    }));
  },

  async createReturnBill(returnBill: Omit<ReturnBill, 'id' | 'created_at'>): Promise<ReturnBill> {
    const id = `rb_${Date.now()}`;
    const { data, error } = await supabase
      .from('return_bills')
      .insert({
        ...returnBill,
        id,
        items: returnBill.items as any
      })
      .select()
      .single();

    if (error) throw new Error('Failed to create return bill');
    return {
      ...data,
      items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items
    };
  },

  async getSiteTransactions(siteId?: string): Promise<SiteTransaction[]> {
    let query = supabase
      .from('site_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (siteId) {
      query = query.eq('site_id', siteId);
    }

    const { data, error } = await query;

    if (error) throw new Error('Failed to fetch site transactions');
    return data || [];
  },

  async getSiteInventory(siteId?: string): Promise<SiteInventory[]> {
    let query = supabase
      .from('site_inventory')
      .select('*')
      .order('item_name', { ascending: true });

    if (siteId) {
      query = query.eq('site_id', siteId);
    }

    const { data, error } = await query;

    if (error) throw new Error('Failed to fetch site inventory');
    return data || [];
  },

  async upsertSiteInventory(inventory: Omit<SiteInventory, 'id' | 'created_at' | 'last_updated'>): Promise<SiteInventory> {
    // Check if record exists
    const { data: existing } = await supabase
      .from('site_inventory')
      .select('*')
      .eq('site_id', inventory.site_id)
      .eq('item_id', inventory.item_id)
      .maybeSingle();

    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('site_inventory')
        .update({
          quantity: existing.quantity + inventory.quantity,
          item_name: inventory.item_name,
          unit: inventory.unit,
          category: inventory.category
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw new Error('Failed to update site inventory');
      return data;
    } else {
      // Insert new record
      const id = `si_${Date.now()}`;
      const { data, error } = await supabase
        .from('site_inventory')
        .insert({
          id,
          ...inventory
        })
        .select()
        .single();

      if (error) throw new Error('Failed to create site inventory');
      return data;
    }
  },

  async createSiteTransaction(transaction: Omit<SiteTransaction, 'id' | 'created_at'>): Promise<SiteTransaction> {
    const id = `st_${Date.now()}`;
    const { data, error } = await supabase
      .from('site_transactions')
      .insert({ id, ...transaction })
      .select()
      .single();

    if (error) {
      console.error('Failed to create site transaction:', error);
      throw new Error(`Failed to create site transaction: ${error.message}`);
    }
    return data;
  },

  async getActivities(): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw new Error('Failed to fetch activities');
    return data || [];
  },

  async logActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Promise<void> {
    const id = `act_${Date.now()}`;
    const { error } = await supabase
      .from('activities')
      .insert({ id, ...activity });

    if (error) {
      console.error('Failed to log activity:', error);
      throw new Error(`Failed to log activity: ${error.message}`);
    }
  },

  async createActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Promise<void> {
    return this.logActivity(activity);
  },

  async sendToSite(waybillId: string, targetSiteId: string): Promise<void> {
    // Use type assertion for RPC call
    const { error } = await (supabase.rpc as any)('finalize_waybill_and_update_stock', { waybill_id_to_finalize: waybillId });

    if (error) throw new Error('Failed to send to site: ' + error.message);
  },

  async reconcileSiteMaterials(siteId: string): Promise<{ success: boolean; itemsReconciled: number }> {
    // Fetch all waybills sent to this site
    const { data: waybills, error: waybillError } = await supabase
      .from('waybills')
      .select('*')
      .eq('site_id', siteId)
      .eq('status', 'sent_to_site')
      .eq('type', 'waybill');

    if (waybillError) throw new Error('Failed to fetch waybills');

    // Clear existing site inventory for this site
    const { error: deleteError } = await supabase
      .from('site_inventory')
      .delete()
      .eq('site_id', siteId);

    if (deleteError) throw new Error('Failed to clear site inventory');

    // Aggregate all items from waybills
    const inventoryMap = new Map<string, any>();

    waybills?.forEach((waybill: any) => {
      const items = waybill.items || [];
      items.forEach((item: any) => {
        const key = item.id;
        if (inventoryMap.has(key)) {
          const existing = inventoryMap.get(key);
          existing.quantity += item.quantity;
        } else {
          inventoryMap.set(key, {
            site_id: siteId,
            item_id: item.id,
            item_name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            category: item.category
          });
        }
      });
    });

    // Insert aggregated inventory
    if (inventoryMap.size > 0) {
      const inventoryRecords = Array.from(inventoryMap.values());
      const { error: insertError } = await supabase
        .from('site_inventory')
        .insert(inventoryRecords);

      if (insertError) throw new Error('Failed to insert site inventory');
    }

    return { success: true, itemsReconciled: inventoryMap.size };
  },
};
