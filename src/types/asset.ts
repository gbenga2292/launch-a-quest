export interface Asset {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitOfMeasurement: string;
  category: 'Dewatering' | 'Waterproofing';
  type: 'consumable' | 'non-consumable' | 'tools' | 'equipment';
  location?: string;
  siteId?: string; // Link asset to a specific site
  checkoutType?: 'waybill' | 'quick_checkout' | 'reconciled'; // Added to demarcate checkout type
  service?: string; // Service classification for sorting
  status: 'active' | 'damaged' | 'missing' | 'maintenance';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  missingCount?: number;
  damagedCount?: number;
  lowStockLevel?: number;
  criticalStockLevel?: number;
  purchaseDate?: Date;
  cost?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Waybill {
  id: string;
  items: WaybillItem[];
  siteId: string;
  driverName: string;
  vehicle: string;
  issueDate: Date;
  expectedReturnDate?: Date;
  purpose: string;
  service: string;
  returnToSiteId?: string;
  status: 'outstanding' | 'partial_returned' | 'return_completed' | 'sent_to_site';
  type: 'waybill' | 'return';
  createdAt: Date;
  updatedAt: Date;
}

export interface WaybillItem {
  assetId: string;
  assetName: string;
  quantity: number;
  returnedQuantity: number;
  status: 'outstanding' | 'partial_returned' | 'return_completed' | 'lost' | 'damaged';
}

export interface QuickCheckout {
  id: string;
  assetId: string;
  assetName: string;
  quantity: number;
  employee: string;
  checkoutDate: Date;
  expectedReturnDays: number;
  status: 'outstanding' | 'return_completed' | 'lost' | 'damaged';
  siteId?: string; // Optional site for direct site checkout
}

export interface ReturnBill {
  id: string;
  waybillId: string;
  items: ReturnItem[];
  returnDate: Date;
  receivedBy: string;
  condition: 'good' | 'damaged' | 'missing';
  notes?: string;
  status: 'initiated' | 'completed';
}

export interface ReturnItem {
  assetId: string;
  assetName: string;
  quantity: number;
  condition: 'good' | 'damaged' | 'missing';
}

export interface Site {
  id: string;
  name: string;
  location: string;
  description?: string;
  clientName?: string;
  contactPerson?: string;
  phone?: string;
  services: string[]; // Array of services: dewatering, waterproofing, tiling, sale service and maintenance
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanySettings {
  companyName: string;
  logo?: string; // base64 or URL
  address: string;
  phone: string;
  email: string;
  website?: string;
  currency: string;
  dateFormat: 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd';
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
  };
}

export interface Employee {
  id: string;
  name: string;
  role: string; // e.g., 'driver', 'manager', etc.
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteTransaction {
  id: string;
  siteId: string;
  assetId: string;
  assetName: string;
  quantity: number;
  type: 'in' | 'out'; // 'in' for materials coming to site, 'out' for materials leaving site
  transactionType: 'waybill' | 'return'; // what caused this transaction
  referenceId: string; // waybill id or return id
  referenceType: 'waybill' | 'return_waybill' | 'quick_checkout';
  condition?: 'good' | 'damaged' | 'missing'; // for returns
  notes?: string;
  createdAt: Date;
  createdBy?: string; // user who performed the action
}

export interface Activity {
  id: string;
  userId: string;
  userName?: string;
  action: 'create' | 'update' | 'delete' | 'process_return' | 'add_site' | 'update_site' | 'delete_site' | 'add_asset' | 'update_asset' | 'delete_asset' | 'add_employee' | 'backup' | 'restore' | 'clear';
  entity: 'waybill' | 'return' | 'site' | 'asset' | 'employee' | 'company_settings' | 'activities' | 'vehicle';
  entityId?: string;
  details?: string;
  timestamp: Date;
}
