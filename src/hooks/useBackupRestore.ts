
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
          backupData.assets = items;
        } catch (err) {
          console.error('Failed to backup assets:', err);
          setError(`Failed to backup assets: ${err instanceof Error ? err.message : 'Unknown error'}`);
          throw err;
        }
      }

      if (selectedItems.has('sites')) {
        setBackupProgress({ current: ++currentStep, total: selectedItems.size + 1, step: 'Backing up sites...' });
        try {
          const sites = await api.getSites();
          backupData.sites = sites;
        } catch (err) {
          console.error('Failed to backup sites:', err);
          setError(`Failed to backup sites: ${err instanceof Error ? err.message : 'Unknown error'}`);
          throw err;
        }
      }

      if (selectedItems.has('employees')) {
        setBackupProgress({ current: ++currentStep, total: selectedItems.size + 1, step: 'Backing up employees...' });
        try {
          const employees = await api.getEmployees();
          backupData.employees = employees;
        } catch (err) {
          console.error('Failed to backup employees:', err);
          setError(`Failed to backup employees: ${err instanceof Error ? err.message : 'Unknown error'}`);
          throw err;
        }
      }

      if (selectedItems.has('vehicles')) {
        setBackupProgress({ current: ++currentStep, total: selectedItems.size + 1, step: 'Backing up vehicles...' });
        try {
          const vehicles = await api.getVehicles();
          backupData.vehicles = vehicles.map(v => v.name);
        } catch (err) {
          console.error('Failed to backup vehicles:', err);
          setError(`Failed to backup vehicles: ${err instanceof Error ? err.message : 'Unknown error'}`);
          throw err;
        }
      }

      if (selectedItems.has('companySettings')) {
        setBackupProgress({ current: ++currentStep, total: selectedItems.size + 1, step: 'Backing up company settings...' });
        try {
          const settings = await api.getCompanySettings();
          backupData.company_settings = [settings];
        } catch (err) {
          console.error('Failed to backup company settings:', err);
          setError(`Failed to backup company settings: ${err instanceof Error ? err.message : 'Unknown error'}`);
          throw err;
        }
      }

      if (selectedItems.has('waybills')) {
        setBackupProgress({ current: ++currentStep, total: selectedItems.size + 1, step: 'Backing up waybills...' });
        try {
          const waybills = await api.getWaybills();
          backupData.waybills = waybills;
        } catch (err) {
          console.error('Failed to backup waybills:', err);
          setError(`Failed to backup waybills: ${err instanceof Error ? err.message : 'Unknown error'}`);
          throw err;
        }
      }

      if (selectedItems.has('quickCheckouts')) {
        setBackupProgress({ current: ++currentStep, total: selectedItems.size + 1, step: 'Backing up quick checkouts...' });
        try {
          const checkouts = await api.getQuickCheckouts();
          backupData.quick_checkouts = checkouts;
        } catch (err) {
          console.error('Failed to backup quick checkouts:', err);
          setError(`Failed to backup quick checkouts: ${err instanceof Error ? err.message : 'Unknown error'}`);
          throw err;
        }
      }

      if (selectedItems.has('siteTransactions')) {
        setBackupProgress({ current: ++currentStep, total: selectedItems.size + 1, step: 'Backing up site transactions...' });
        try {
          const transactions = await api.getSiteTransactions();
          backupData.site_transactions = transactions;
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

      // Restore each data type by calling the API
      if (backupData.assets) {
        for (const asset of backupData.assets) {
          await api.updateItem(asset.id, asset);
        }
      }

      if (backupData.sites) {
        for (const site of backupData.sites) {
          await api.updateSite(site.id, site);
        }
      }

      if (backupData.employees) {
        for (const emp of backupData.employees) {
          await api.updateEmployee(emp.id, emp);
        }
      }

      if (backupData.vehicles) {
        for (const vehicleName of backupData.vehicles) {
          await api.createVehicle({ name: vehicleName });
        }
      }

      if (backupData.company_settings && backupData.company_settings.length > 0) {
        const settings = backupData.company_settings[0];
        await api.updateCompanySettings(settings);
      }

      if (backupData.waybills) {
        for (const waybill of backupData.waybills) {
          await api.updateWaybill(waybill.id, waybill);
        }
      }

      if (backupData.quick_checkouts) {
        for (const checkout of backupData.quick_checkouts) {
          await api.createQuickCheckout(checkout);
        }
      }

      if (backupData.site_transactions) {
        for (const transaction of backupData.site_transactions) {
          await api.createSiteTransaction(transaction);
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
