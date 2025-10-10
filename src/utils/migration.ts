import { api } from '@/services/api';
import { Asset, Waybill, QuickCheckout, Site, Employee, CompanySettings, SiteTransaction } from '@/types/asset';

export const migrateLocalStorageToDatabase = async (): Promise<void> => {
  console.log('Starting migration from localStorage to database...');

  try {
    // Migrate assets
    const assets = JSON.parse(localStorage.getItem('inventory-assets') || '[]') as Asset[];
    if (assets.length > 0) {
      console.log(`Migrating ${assets.length} assets...`);
      for (const asset of assets) {
        try {
          await api.createItem({
            name: asset.name,
            quantity: asset.quantity,
            unit: asset.unitOfMeasurement,
            category: asset.category,
            type: asset.type,
            location: asset.location,
            description: asset.description,
            status: asset.status,
            condition: asset.condition
          });
        } catch (error) {
          console.error(`Failed to migrate asset ${asset.id}:`, error);
        }
      }
    }

    // Migrate sites
    const sites = JSON.parse(localStorage.getItem('inventory-sites') || '[]') as Site[];
    if (sites.length > 0) {
      console.log(`Migrating ${sites.length} sites...`);
      for (const site of sites) {
        try {
          await api.createSite({
            name: site.name,
            location: site.location,
            description: site.description,
            clientName: site.clientName,
            contactPerson: site.contactPerson,
            phone: site.phone,
            status: site.status
          });
        } catch (error) {
          console.error(`Failed to migrate site ${site.id}:`, error);
        }
      }
    }

    // Migrate employees
    const employees = JSON.parse(localStorage.getItem('inventory-employees') || '[]') as Employee[];
    if (employees.length > 0) {
      console.log(`Migrating ${employees.length} employees...`);
      for (const employee of employees) {
        try {
          await api.createEmployee({
            name: employee.name,
            role: employee.role,
            phone: employee.phone,
            email: employee.email,
            status: employee.status
          });
        } catch (error) {
          console.error(`Failed to migrate employee ${employee.id}:`, error);
        }
      }
    }

    // Migrate vehicles
    const vehicles = JSON.parse(localStorage.getItem('inventory-vehicles') || '[]') as { id: number; name: string }[];
    if (vehicles.length > 0) {
      console.log(`Migrating ${vehicles.length} vehicles...`);
      for (const vehicle of vehicles) {
        try {
          await api.createVehicle({
            name: vehicle.name
          });
        } catch (error) {
          console.error(`Failed to migrate vehicle ${vehicle.id}:`, error);
        }
      }
    }

    // Migrate company settings
    const companySettings = JSON.parse(localStorage.getItem('inventory-company-settings') || 'null') as CompanySettings | null;
    if (companySettings) {
      console.log('Migrating company settings...');
      try {
        await api.updateCompanySettings({
          company_name: companySettings.companyName,
          logo: companySettings.logo,
          address: companySettings.address,
          phone: companySettings.phone,
          email: companySettings.email,
          website: companySettings.website,
          currency: companySettings.currency,
          date_format: companySettings.dateFormat,
          theme: companySettings.theme,
          notifications_email: companySettings.notifications.email,
          notifications_push: companySettings.notifications.push
        });
      } catch (error) {
        console.error('Failed to migrate company settings:', error);
      }
    }

    // Migrate waybills
    const waybills = JSON.parse(localStorage.getItem('inventory-waybills') || '[]') as Waybill[];
    if (waybills.length > 0) {
      console.log(`Migrating ${waybills.length} waybills...`);
      for (const waybill of waybills) {
        try {
          await api.createWaybill({
            siteId: waybill.siteId,
            driverName: waybill.driverName,
            vehicle: waybill.vehicle,
            issueDate: waybill.issueDate,
            expectedReturnDate: waybill.expectedReturnDate,
            purpose: waybill.purpose,
            service: waybill.service,
            returnToSiteId: waybill.returnToSiteId,
            status: waybill.status,
            type: waybill.type,
            items: waybill.items
          });
        } catch (error) {
          console.error(`Failed to migrate waybill ${waybill.id}:`, error);
        }
      }
    }

    // Migrate quick checkouts
    const quickCheckouts = JSON.parse(localStorage.getItem('inventory-quick-checkouts') || '[]') as QuickCheckout[];
    if (quickCheckouts.length > 0) {
      console.log(`Migrating ${quickCheckouts.length} quick checkouts...`);
      for (const checkout of quickCheckouts) {
        try {
          await api.createQuickCheckout({
            assetId: checkout.assetId,
            assetName: checkout.assetName,
            quantity: checkout.quantity,
            employee: checkout.employee,
            checkoutDate: checkout.checkoutDate,
            expectedReturnDays: checkout.expectedReturnDays,
            status: checkout.status
          });
        } catch (error) {
          console.error(`Failed to migrate quick checkout ${checkout.id}:`, error);
        }
      }
    }

    // Migrate site transactions
    const siteTransactions = JSON.parse(localStorage.getItem('inventory-site-transactions') || '[]') as SiteTransaction[];
    if (siteTransactions.length > 0) {
      console.log(`Migrating ${siteTransactions.length} site transactions...`);
      for (const transaction of siteTransactions) {
        try {
          await api.createSiteTransaction({
            siteId: transaction.siteId,
            assetId: transaction.assetId,
            assetName: transaction.assetName,
            quantity: transaction.quantity,
            type: transaction.type,
            transactionType: transaction.transactionType,
            referenceId: transaction.referenceId,
            referenceType: transaction.referenceType,
            condition: transaction.condition,
            notes: transaction.notes,
            createdBy: transaction.createdBy
          });
        } catch (error) {
          console.error(`Failed to migrate site transaction ${transaction.id}:`, error);
        }
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

export const hasLocalStorageData = (): boolean => {
  const keys = [
    'inventory-assets',
    'inventory-sites',
    'inventory-employees',
    'inventory-vehicles',
    'inventory-company-settings',
    'inventory-waybills',
    'inventory-quick-checkouts',
    'inventory-site-transactions'
  ];

  return keys.some(key => {
    const data = localStorage.getItem(key);
    return data && data !== '[]' && data !== 'null';
  });
};
