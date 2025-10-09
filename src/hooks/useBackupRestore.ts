
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { logActivity } from '@/utils/activityLogger';
import { saveAs } from 'file-saver';
import { CompanySettings } from '@/types/asset';

export const useBackupRestore = (defaultSettings: CompanySettings) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backupProgress, setBackupProgress] = useState<{ current: number; total: number; step: string } | null>(null);

  const backupOptions = [
    { id: 'assets', label: 'Assets' },
    { id: 'waybills', label: 'Waybills & Returns' },
    { id: 'quickCheckouts', label: 'Quick Checkouts' },
    { id: 'sites', label: 'Sites' },
    { id: 'siteTransactions', label: 'Site Transactions' },
    { id: 'employees', label: 'Employees' },
    { id: 'vehicles', label: 'Vehicles' },
    { id: 'companySettings', label: 'Company Settings' }
  ];

  const [selectedBackupItems, setSelectedBackupItems] = useState<Set<string>>(new Set(backupOptions.map(option => option.id)));

  const handleBackup = async (selectedItems: Set<string>) => {
    setIsLoading(true);
    setError(null);
    setBackupProgress({ current: 0, total: selectedItems.size + 1, step: 'Initializing backup...' });

    try {
      const backupData: any = {};
      let currentStep = 0;

      if (selectedItems.has('assets')) {
        setBackupProgress({ current: ++currentStep, total: selectedItems.size + 1, step: 'Backing up assets...' });
        try {
          const items = await api.getItems();
          backupData.assets = items.map((item: any) => ({
            id: item.id.toString(),
            name: item.name,
            description: item.description || '',
            quantity: item.quantity,
            unitOfMeasurement: item.unit || '',
            category: (item.category as 'dewatering' | 'waterproofing') || 'dewatering',
            type: (item.type as 'consumable' | 'non-consumable' | 'tools' | 'equipment') || 'equipment',
            location: item.location || '',
            status: (item.status === 'inactive' ? 'maintenance' : 'active') as 'active' | 'damaged' | 'missing' | 'maintenance',
            condition: (item.condition === 'damaged' ? 'poor' : (item.condition as 'good' | 'fair' | 'poor' | 'excellent')) || 'good',
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at),
          }));
        } catch (err) {
          console.error('Failed to backup assets:', err);
          setError(`Failed to backup assets: ${err instanceof Error ? err.message : 'Unknown error'}`);
          throw err;
        }
      }

      if (selectedItems.has('sites')) {
        setBackupProgress({ current: ++currentStep, total: selectedItems.size + 1, step: 'Backing up sites...' });
        try {
          const dbSites = await api.getSites();
          backupData.sites = dbSites.map(site => ({
            ...site,
            createdAt: new Date(site.created_at),
            updatedAt: new Date(site.updated_at)
          }));
        } catch (err) {
          console.error('Failed to backup sites:', err);
          setError(`Failed to backup sites: ${err instanceof Error ? err.message : 'Unknown error'}`);
          throw err;
        }
      }

      if (selectedItems.has('employees')) {
        setBackupProgress({ current: ++currentStep, total: selectedItems.size + 1, step: 'Backing up employees...' });
        try {
          const dbEmployees = await api.getEmployees();
          backupData.employees = dbEmployees.map(emp => ({
            ...emp,
            createdAt: new Date(emp.created_at),
            updatedAt: new Date(emp.updated_at)
          }));
        } catch (err) {
          console.error('Failed to backup employees:', err);
          setError(`Failed to backup employees: ${err instanceof Error ? err.message : 'Unknown error'}`);
          throw err;
        }
      }

      if (selectedItems.has('vehicles')) {
        setBackupProgress({ current: ++currentStep, total: selectedItems.size + 1, step: 'Backing up vehicles...' });
        try {
          const dbVehicles = await api.getVehicles();
          backupData.vehicles = dbVehicles.map(vehicle => vehicle.name);
        } catch (err) {
          console.error('Failed to backup vehicles:', err);
          setError(`Failed to backup vehicles: ${err instanceof Error ? err.message : 'Unknown error'}`);
          throw err;
        }
      }

      if (selectedItems.has('companySettings')) {
        setBackupProgress({ current: ++currentStep, total: selectedItems.size + 1, step: 'Backing up company settings...' });
        try {
          const dbSettings = await api.getCompanySettings();
          backupData.company_settings = [{
            companyName: dbSettings.company_name || '',
            logo: dbSettings.logo,
            address: dbSettings.address || '',
            phone: dbSettings.phone || '',
            email: dbSettings.email || '',
            website: dbSettings.website || '',
            currency: dbSettings.currency || 'USD',
            dateFormat: (dbSettings.date_format as 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd') || 'dd/MM/yyyy',
            theme: (dbSettings.theme as 'light' | 'dark' | 'system') || 'light',
            notifications: {
              email: dbSettings.notifications_email || true,
              push: dbSettings.notifications_push || true
            }
          }];
        } catch (err) {
          console.error('Failed to backup company settings:', err);
          setError(`Failed to backup company settings: ${err instanceof Error ? err.message : 'Unknown error'}`);
          throw err;
        }
      }

      if (selectedItems.has('waybills')) {
        setBackupProgress({ current: ++currentStep, total: selectedItems.size + 1, step: 'Backing up waybills...' });
        try {
          const dbWaybills = await api.getWaybills();
          backupData.waybills = dbWaybills.map(waybill => ({
            ...waybill,
            issueDate: new Date(waybill.issue_date),
            expectedReturnDate: waybill.expected_return_date ? new Date(waybill.expected_return_date) : undefined,
            createdAt: new Date(waybill.created_at),
            updatedAt: new Date(waybill.updated_at)
          }));
        } catch (err) {
          console.error('Failed to backup waybills:', err);
          setError(`Failed to backup waybills: ${err instanceof Error ? err.message : 'Unknown error'}`);
          throw err;
        }
      }

      if (selectedItems.has('quickCheckouts')) {
        setBackupProgress({ current: ++currentStep, total: selectedItems.size + 1, step: 'Backing up quick checkouts...' });
        try {
          const dbCheckouts = await api.getQuickCheckouts();
          backupData.quick_checkouts = dbCheckouts.map(checkout => ({
            ...checkout,
            checkoutDate: new Date(checkout.checkout_date)
          }));
        } catch (err) {
          console.error('Failed to backup quick checkouts:', err);
          setError(`Failed to backup quick checkouts: ${err instanceof Error ? err.message : 'Unknown error'}`);
          throw err;
        }
      }

      if (selectedItems.has('siteTransactions')) {
        setBackupProgress({ current: ++currentStep, total: selectedItems.size + 1, step: 'Backing up site transactions...' });
        try {
          const dbTransactions = await api.getSiteTransactions();
          backupData.site_transactions = dbTransactions.map(transaction => ({
            ...transaction,
            createdAt: new Date(transaction.created_at)
          }));
        } catch (err) {
          console.error('Failed to backup site transactions:', err);
          setError(`Failed to backup site transactions: ${err instanceof Error ? err.message : 'Unknown error'}`);
          throw err;
        }
      }

      setBackupProgress({ current: ++currentStep, total: selectedItems.size + 1, step: 'Creating backup file...' });
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-'); // YYYY-MM-DDTHH-MM-SS format
      const filename = `inventory-backup-${timestamp}.json`;

      const backupBlob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      saveAs(backupBlob, filename);

      toast({
        title: "Backup Created",
        description: `Selected data has been backed up to ${filename}.`
      });

      logActivity({
        userId: 'current_user',
        userName: 'Admin',
        action: 'backup',
        entity: 'activities',
        details: `Backed up ${Array.from(selectedItems).join(', ')}`
      });
    } catch (err) {
      console.error('Backup failed:', err);
      const errorMessage = error || `Backup failed: ${err instanceof Error ? err.message : 'Unknown error occurred'}`;
      toast({
        title: "Backup Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setBackupProgress(null);
    }
  };

  const handleRestore = async (restoreFile: File, onRestoreComplete: (data: any) => void) => {
    if (!restoreFile) return;
    setIsLoading(true);
    setError(null);
    try {
      const text = await restoreFile.text();
      const backupData = JSON.parse(text);

      if (backupData.assets) {
        const dbItems = backupData.assets.map((asset: any) => ({
          id: parseInt(asset.id),
          name: asset.name,
          quantity: asset.quantity,
          unit: asset.unitOfMeasurement || '',
          category: asset.category,
          location: asset.location || '',
          description: asset.description || '',
          type: asset.type,
          status: asset.status === 'maintenance' ? 'inactive' : 'active',
          condition: asset.condition === 'poor' ? 'damaged' : asset.condition,
          created_at: asset.createdAt.toISOString(),
          updated_at: asset.updatedAt.toISOString()
        }));
        await api.restoreDatabase(dbItems);
      }

      if (backupData.sites) {
        for (const site of backupData.sites) {
          await api.createSite({
            name: site.name,
            location: site.location,
            description: site.description,
            client_name: site.clientName,
            contact_person: site.contactPerson,
            phone: site.phone,
            status: site.status
          });
        }
      }

      if (backupData.employees) {
        for (const emp of backupData.employees) {
          await api.createEmployee({
            name: emp.name,
            role: emp.role,
            phone: emp.phone,
            email: emp.email,
            status: emp.status
          });
        }
      }

      if (backupData.vehicles) {
        for (const vehicle of backupData.vehicles) {
          await api.createVehicle({ name: vehicle });
        }
      }

      if (backupData.company_settings && backupData.company_settings.length > 0) {
        const settings = backupData.company_settings[0];
        await api.updateCompanySettings({
          company_name: settings.companyName,
          logo: settings.logo,
          address: settings.address,
          phone: settings.phone,
          email: settings.email,
          website: settings.website,
          currency: settings.currency,
          date_format: settings.dateFormat,
          theme: settings.theme,
          notifications_email: settings.notifications.email,
          notifications_push: settings.notifications.push
        });
      }

      if (backupData.waybills) {
        for (const waybill of backupData.waybills) {
          await api.createWaybill({
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
            items: waybill.items
          });
        }
      }

      if (backupData.quick_checkouts) {
        for (const checkout of backupData.quick_checkouts) {
          await api.createQuickCheckout({
            asset_id: checkout.assetId,
            asset_name: checkout.assetName,
            quantity: checkout.quantity,
            employee: checkout.employee,
            checkout_date: checkout.checkoutDate?.toISOString(),
            expected_return_days: checkout.expectedReturnDays,
            status: checkout.status
          });
        }
      }

      if (backupData.site_transactions) {
        for (const transaction of backupData.site_transactions) {
          await api.createSiteTransaction({
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
            created_by: transaction.createdBy
          });
        }
      }

      onRestoreComplete(backupData);

      toast({
        title: "Data Restored",
        description: "Data has been restored successfully."
      });

      logActivity({
        userId: 'current_user',
        userName: 'Admin',
        action: 'restore',
        entity: 'activities',
        details: 'Restored data from backup file'
      });
    } catch (err) {
      setError("Failed to restore data. Invalid file or error occurred.");
      toast({
        title: "Restore Failed",
        description: "An error occurred while restoring data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    backupProgress,
    backupOptions,
    selectedBackupItems,
    setSelectedBackupItems,
    handleBackup,
    handleRestore
  };
};
