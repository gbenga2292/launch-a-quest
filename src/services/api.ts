import { supabase } from '@/integrations/supabase/client';

// Database types (snake_case)
export interface ItemDB {
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

// Frontend types (from asset.ts)
import type { Asset, Site as SiteFE, Employee as EmployeeFE, Waybill as WaybillFE, QuickCheckout as QuickCheckoutFE, ReturnBill, SiteTransaction as SiteTransactionFE, Activity as ActivityFE, ReturnItem } from '@/types/asset';

// Re-export types for backward compatibility
export type Item = Asset;
export type Site = SiteFE;
export type Employee = EmployeeFE;
export type Waybill = WaybillFE;
export type QuickCheckout = QuickCheckoutFE;
export type SiteTransaction = SiteTransactionFE;
export type Activity = ActivityFE;
export type { ReturnItem, Asset };

export interface SiteDB {
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

export interface EmployeeDB {
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

export interface WaybillDB {
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
  items: any;
  created_at: string;
  updated_at: string;
}

export interface QuickCheckoutDB {
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

export interface SiteTransactionDB {
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

export interface ActivityDB {
  id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  entity: string;
  entity_id?: string;
  details?: string;
  timestamp: string;
}

// Conversion functions
const dbItemToAsset = (item: ItemDB): Asset => ({
  id: item.id,
  name: item.name,
  description: item.description || undefined,
  quantity: item.quantity || 0,
  unitOfMeasurement: item.unit || 'pcs',
  category: (item.category as any) || 'Dewatering',
  type: (item.type as any) || 'equipment',
  location: item.location,
  siteId: item.site_id,
  checkoutType: item.checkout_type as any,
  status: (item.status as any) || 'active',
  condition: (item.condition as any) || 'good',
  lowStockLevel: item.low_stock_level,
  criticalStockLevel: item.critical_stock_level,
  createdAt: item.created_at ? new Date(item.created_at) : new Date(),
  updatedAt: item.updated_at ? new Date(item.updated_at) : new Date(),
});

const assetToDbItem = (asset: Partial<Asset>): Partial<ItemDB> => ({
  name: asset.name,
  description: asset.description,
  quantity: asset.quantity,
  unit: asset.unitOfMeasurement,
  category: asset.category,
  type: asset.type,
  location: asset.location,
  site_id: asset.siteId,
  checkout_type: asset.checkoutType,
  status: asset.status,
  condition: asset.condition,
  low_stock_level: asset.lowStockLevel,
  critical_stock_level: asset.criticalStockLevel,
});

const dbSiteToSite = (site: SiteDB): SiteFE => ({
  id: site.id,
  name: site.name,
  location: site.location || '',
  description: site.description,
  clientName: site.client_name,
  contactPerson: site.contact_person,
  phone: site.phone,
  services: [],
  status: (site.status as any) || 'active',
  createdAt: site.created_at ? new Date(site.created_at) : new Date(),
  updatedAt: site.updated_at ? new Date(site.updated_at) : new Date(),
});

const dbEmployeeToEmployee = (emp: EmployeeDB): EmployeeFE => ({
  id: emp.id,
  name: emp.name,
  role: emp.role || '',
  phone: emp.phone,
  email: emp.email,
  status: (emp.status as any) || 'active',
  createdAt: emp.created_at ? new Date(emp.created_at) : new Date(),
  updatedAt: emp.updated_at ? new Date(emp.updated_at) : new Date(),
});

const dbWaybillToWaybill = (wb: WaybillDB): WaybillFE => {
  const items = typeof wb.items === 'string' ? JSON.parse(wb.items) : wb.items;
  return {
    id: wb.id,
    items: items.map((item: any) => ({
      assetId: item.id || item.assetId,
      assetName: item.name || item.assetName,
      quantity: item.quantity,
      returnedQuantity: item.returnedQuantity || 0,
      status: item.status || 'outstanding',
    })),
    siteId: wb.site_id || '',
    driverName: wb.driver_name || '',
    vehicle: wb.vehicle || '',
    issueDate: wb.issue_date ? new Date(wb.issue_date) : new Date(),
    expectedReturnDate: wb.expected_return_date ? new Date(wb.expected_return_date) : undefined,
    purpose: wb.purpose || '',
    service: wb.service || '',
    returnToSiteId: wb.return_to_site_id,
    status: (wb.status as any) || 'outstanding',
    type: (wb.type as any) || 'waybill',
    createdAt: wb.created_at ? new Date(wb.created_at) : new Date(),
    updatedAt: wb.updated_at ? new Date(wb.updated_at) : new Date(),
  };
};

const dbQuickCheckoutToQuickCheckout = (qc: QuickCheckoutDB): QuickCheckoutFE => ({
  id: qc.id,
  assetId: qc.asset_id,
  assetName: qc.asset_name,
  quantity: qc.quantity,
  employee: qc.employee,
  checkoutDate: qc.checkout_date ? new Date(qc.checkout_date) : new Date(),
  expectedReturnDays: qc.expected_return_days || 0,
  status: (qc.status as any) || 'outstanding',
  siteId: qc.site_id,
});

const dbSiteTransactionToSiteTransaction = (st: SiteTransactionDB): SiteTransactionFE => ({
  id: st.id,
  siteId: st.site_id || '',
  assetId: st.asset_id || '',
  assetName: st.asset_name || '',
  quantity: st.quantity || 0,
  type: (st.type as any) || 'in',
  transactionType: (st.transaction_type as any) || 'waybill',
  referenceId: st.reference_id || '',
  referenceType: (st.reference_type as any) || 'waybill',
  condition: st.condition as any,
  notes: st.notes,
  createdAt: st.created_at ? new Date(st.created_at) : new Date(),
  createdBy: st.created_by,
});

const dbActivityToActivity = (act: ActivityDB): ActivityFE => ({
  id: act.id,
  userId: act.user_id || '',
  userName: act.user_name,
  action: act.action as any,
  entity: act.entity as any,
  entityId: act.entity_id,
  details: act.details,
  timestamp: act.timestamp ? new Date(act.timestamp) : new Date(),
});

export const api = {
  async getItems(): Promise<Asset[]> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to fetch items');
    return (data || []).map(dbItemToAsset);
  },

  async createItem(item: Partial<Asset>): Promise<Asset> {
    const id = `item_${Date.now()}`;
    const dbItem = assetToDbItem(item);
    const { data, error } = await supabase
      .from('items')
      .insert({
        id,
        ...dbItem,
        quantity: dbItem.quantity ?? 0,
        low_stock_level: dbItem.low_stock_level ?? 0,
        critical_stock_level: dbItem.critical_stock_level ?? 0,
      })
      .select()
      .single();

    if (error) throw new Error('Failed to create item');
    return dbItemToAsset(data);
  },

  async updateItem(id: string, item: Partial<Asset>): Promise<Asset> {
    const dbItem = assetToDbItem(item);
    const { data, error } = await supabase
      .from('items')
      .update(dbItem)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error('Failed to update item');
    return dbItemToAsset(data);
  },

  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) throw new Error('Failed to delete item');
  },

  async backupDatabase(): Promise<{ items: Asset[], timestamp: string, version: string }> {
    const items = await this.getItems();
    return {
      items,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
  },

  async restoreDatabase(items: Asset[]): Promise<void> {
    // Delete all existing items
    await supabase.from('items').delete().neq('id', '');

    // Convert and insert all items
    const dbItems = items.map(item => assetToDbItem(item));
    const { error } = await supabase
      .from('items')
      .insert(dbItems);

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

  async getSites(): Promise<SiteFE[]> {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to fetch sites');
    return (data || []).map(dbSiteToSite);
  },

  async createSite(site: Partial<SiteFE>): Promise<SiteFE> {
    const id = `site_${Date.now()}`;
    const { data, error } = await supabase
      .from('sites')
      .insert({ 
        id, 
        name: site.name,
        location: site.location,
        description: site.description,
        client_name: site.clientName,
        contact_person: site.contactPerson,
        phone: site.phone,
        status: site.status,
      })
      .select()
      .single();

    if (error) throw new Error('Failed to create site');
    return dbSiteToSite(data);
  },

  async updateSite(id: string, site: Partial<SiteFE>): Promise<void> {
    const { error } = await supabase
      .from('sites')
      .update({
        name: site.name,
        location: site.location,
        description: site.description,
        client_name: site.clientName,
        contact_person: site.contactPerson,
        phone: site.phone,
        status: site.status,
      })
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

  async getEmployees(): Promise<EmployeeFE[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to fetch employees');
    return (data || []).map(dbEmployeeToEmployee);
  },

  async createEmployee(employee: Partial<EmployeeFE>): Promise<EmployeeFE> {
    const id = `emp_${Date.now()}`;
    const { data, error } = await supabase
      .from('employees')
      .insert({ id, name: employee.name, role: employee.role, phone: employee.phone, email: employee.email, status: employee.status })
      .select()
      .single();

    if (error) throw new Error('Failed to create employee');
    return dbEmployeeToEmployee(data);
  },

  async updateEmployee(id: string, employee: Partial<EmployeeFE>): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .update({ name: employee.name, role: employee.role, phone: employee.phone, email: employee.email, status: employee.status })
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

  async getWaybills(): Promise<WaybillFE[]> {
    const { data, error } = await supabase
      .from('waybills')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to fetch waybills');
    return (data || []).map(dbWaybillToWaybill);
  },

  async createWaybill(waybill: Partial<WaybillFE>): Promise<WaybillFE> {
    const id = `wb_${Date.now()}`;
    
    // Deduct inventory for items in the waybill
    if (waybill.items && waybill.items.length > 0) {
      for (const item of waybill.items) {
        const { data: currentItem } = await supabase
          .from('items')
          .select('quantity')
          .eq('id', item.assetId)
          .single();
        
        if (currentItem) {
          const newQuantity = (currentItem.quantity || 0) - item.quantity;
          await supabase
            .from('items')
            .update({ quantity: newQuantity })
            .eq('id', item.assetId);
        }
      }
    }
    
    const { data, error } = await supabase
      .from('waybills')
      .insert({
        id,
        site_id: waybill.siteId,
        driver_name: waybill.driverName,
        vehicle: waybill.vehicle,
        issue_date: waybill.issueDate?.toISOString(),
        expected_return_date: waybill.expectedReturnDate?.toISOString(),
        purpose: waybill.purpose,
        service: waybill.service,
        return_to_site_id: waybill.returnToSiteId,
        status: waybill.status,
        type: waybill.type,
        items: JSON.stringify(waybill.items || []),
      })
      .select()
      .single();

    if (error) throw new Error('Failed to create waybill: ' + error.message);
    return dbWaybillToWaybill(data);
  },

  async updateWaybill(id: string, waybill: Partial<WaybillFE>): Promise<void> {
    const { error } = await supabase
      .from('waybills')
      .update({
        site_id: waybill.siteId,
        driver_name: waybill.driverName,
        vehicle: waybill.vehicle,
        issue_date: waybill.issueDate?.toISOString(),
        expected_return_date: waybill.expectedReturnDate?.toISOString(),
        purpose: waybill.purpose,
        service: waybill.service,
        return_to_site_id: waybill.returnToSiteId,
        status: waybill.status,
        type: waybill.type,
        items: waybill.items ? JSON.stringify(waybill.items) : undefined,
      })
      .eq('id', id);

    if (error) throw new Error('Failed to update waybill: ' + error.message);
  },

  async deleteWaybill(id: string): Promise<void> {
    const { error } = await supabase
      .from('waybills')
      .delete()
      .eq('id', id);

    if (error) throw new Error('Failed to delete waybill: ' + error.message);
  },

  async getQuickCheckouts(): Promise<QuickCheckoutFE[]> {
    const { data, error } = await supabase
      .from('quick_checkouts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to fetch quick checkouts');
    return (data || []).map(dbQuickCheckoutToQuickCheckout);
  },

  async createQuickCheckout(checkout: Partial<QuickCheckoutFE>): Promise<QuickCheckoutFE> {
    const id = `qc_${Date.now()}`;
    const { data, error } = await supabase
      .from('quick_checkouts')
      .insert({ 
        id, 
        asset_id: checkout.assetId,
        asset_name: checkout.assetName,
        quantity: checkout.quantity,
        employee: checkout.employee,
        checkout_date: checkout.checkoutDate?.toISOString(),
        expected_return_days: checkout.expectedReturnDays,
        status: checkout.status,
        site_id: checkout.siteId,
      })
      .select()
      .single();

    if (error) throw new Error('Failed to create quick checkout');
    return dbQuickCheckoutToQuickCheckout(data);
  },

  async updateQuickCheckout(id: string, checkout: Partial<QuickCheckoutFE>): Promise<void> {
    const { error } = await supabase
      .from('quick_checkouts')
      .update({
        asset_id: checkout.assetId,
        asset_name: checkout.assetName,
        quantity: checkout.quantity,
        employee: checkout.employee,
        checkout_date: checkout.checkoutDate?.toISOString(),
        expected_return_days: checkout.expectedReturnDays,
        status: checkout.status,
        site_id: checkout.siteId,
      })
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

  async getSiteTransactions(siteId?: string): Promise<SiteTransactionFE[]> {
    let query = supabase
      .from('site_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (siteId) {
      query = query.eq('site_id', siteId);
    }

    const { data, error } = await query;

    if (error) throw new Error('Failed to fetch site transactions');
    return (data || []).map(dbSiteTransactionToSiteTransaction);
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

  async createSiteTransaction(transaction: Partial<SiteTransactionFE>): Promise<SiteTransactionFE> {
    const id = `st_${Date.now()}`;
    const { data, error } = await supabase
      .from('site_transactions')
      .insert({ 
        id, 
        site_id: transaction.siteId,
        asset_id: transaction.assetId,
        asset_name: transaction.assetName,
        quantity: transaction.quantity,
        type: transaction.type,
        transaction_type: transaction.transactionType,
        reference_id: transaction.referenceId,
        reference_type: transaction.referenceType,
        condition: transaction.condition,
        notes: transaction.notes,
        created_by: transaction.createdBy,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create site transaction:', error);
      throw new Error(`Failed to create site transaction: ${error.message}`);
    }
    return dbSiteTransactionToSiteTransaction(data);
  },

  async getActivities(): Promise<ActivityFE[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw new Error('Failed to fetch activities');
    return (data || []).map(dbActivityToActivity);
  },

  async logActivity(activity: Partial<ActivityFE>): Promise<void> {
    const id = `act_${Date.now()}`;
    const { error } = await supabase
      .from('activities')
      .insert({ 
        id, 
        user_id: activity.userId,
        user_name: activity.userName,
        action: activity.action,
        entity: activity.entity,
        entity_id: activity.entityId,
        details: activity.details,
      });

    if (error) {
      console.error('Failed to log activity:', error);
      throw new Error(`Failed to log activity: ${error.message}`);
    }
  },

  async createActivity(activity: Partial<ActivityFE>): Promise<void> {
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
