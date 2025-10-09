import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { saveAs } from 'file-saver';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';

export const BackupSettings = (props: any) => {
  const {
    assets,
    waybills,
    quickCheckouts,
    sites,
    siteTransactions,
    employees,
    vehicles,
    onAssetsChange,
    onWaybillsChange,
    onQuickCheckoutsChange,
    onSitesChange,
    onSiteTransactionsChange,
    onEmployeesChange,
    onVehiclesChange,
    onResetAllData,
  } = props;

  const { toast } = useToast();
  const [isRestoring, setIsRestoring] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dataCategories = [
    { id: 'assets', label: 'Assets', description: 'Inventory items and equipment' },
    { id: 'sites', label: 'Sites', description: 'Construction sites and locations' },
    { id: 'employees', label: 'Employees', description: 'Staff and personnel data' },
    { id: 'vehicles', label: 'Vehicles', description: 'Fleet and vehicle information' },
    { id: 'company-settings', label: 'Company Settings', description: 'Company configuration' },
    { id: 'waybills', label: 'Waybills', description: 'Material transfer documents' },
    { id: 'quick-checkouts', label: 'Quick Checkouts', description: 'Temporary asset checkouts' },
    { id: 'return-bills', label: 'Return Bills', description: 'Asset return documents' },
    { id: 'site-transactions', label: 'Site Transactions', description: 'Site-specific transactions' },
    { id: 'activities', label: 'Activities', description: 'System activity logs' },
  ];

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId]);
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  const handleSelectAll = () => {
    setSelectedCategories(dataCategories.map(cat => cat.id));
  };

  const handleDeselectAll = () => {
    setSelectedCategories([]);
  };

  const handleBackup = () => {
    try {
      const backupData = {
        assets,
        waybills,
        quickCheckouts,
        sites,
        siteTransactions,
        employees,
        vehicles,
        timestamp: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      saveAs(blob, `inventory-flow-backup-${new Date().toISOString()}.json`);
      toast({
        title: 'Backup Created',
        description: 'Backup file has been downloaded successfully.',
      });
    } catch (error) {
      toast({
        title: 'Backup Failed',
        description: 'An error occurred while creating backup.',
        variant: 'destructive',
      });
    }
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsRestoring(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          try {
            const restoredData = JSON.parse(content);
            onAssetsChange(restoredData.assets || []);
            onWaybillsChange(restoredData.waybills || []);
            onQuickCheckoutsChange(restoredData.quickCheckouts || []);
            onSitesChange(restoredData.sites || []);
            onSiteTransactionsChange(restoredData.siteTransactions || []);
            onEmployeesChange(restoredData.employees || []);
            onVehiclesChange(restoredData.vehicles || []);
            toast({
              title: 'Data Restored',
              description: 'Data has been restored successfully.',
            });
          } catch (error) {
            console.error('Error parsing backup file:', error);
            toast({
              title: 'Restore Failed',
              description: 'Error restoring data. Please check the file format.',
              variant: 'destructive',
            });
          }
        }
        setIsRestoring(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetConfirm = async () => {
    if (selectedCategories.length === 0) {
      toast({
        title: 'No Categories Selected',
        description: 'Please select at least one data category to reset.',
        variant: 'destructive',
      });
      return;
    }

    setIsResetting(true);
    try {
      // Call backend API to reset database
      await api.resetDatabase();

      // Reset frontend state for selected categories
      if (onResetAllData) {
        onResetAllData(selectedCategories);
      }

      // Reload assets from backend if assets were reset
      if (selectedCategories.includes('assets') && onAssetsChange) {
        try {
          const items = await api.getItems();
          // Convert items back to assets format (simplified conversion)
          const reloadedAssets = items.map(item => ({
            id: item.id.toString(),
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitOfMeasurement: item.unit || '',
            category: (item.category as 'dewatering' | 'waterproofing') || 'dewatering',
            type: (item.type as 'consumable' | 'non-consumable' | 'tools' | 'equipment') || 'equipment',
            location: item.location,
            siteId: item.location,
            status: (item.status as 'active' | 'damaged' | 'missing' | 'maintenance') || 'active',
            condition: (item.condition as 'excellent' | 'good' | 'fair' | 'poor') || 'good',
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at)
          }));
          onAssetsChange(reloadedAssets);
        } catch (reloadError) {
          console.error('Failed to reload assets after reset:', reloadError);
          // Don't show error toast for reload failure as reset was successful
        }
      }

      setShowResetDialog(false);
      setSelectedCategories([]);
    } catch (error) {
      console.error('Error resetting data:', error);
      toast({
        title: 'Reset Failed',
        description: 'An error occurred while resetting data.',
        variant: 'destructive',
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Data Management</h3>
        <p className="text-sm text-muted-foreground">
          Backup, restore, or reset your application data.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        <Button onClick={handleBackup} variant="outline">
          Backup All Data
        </Button>
        <Button asChild variant="outline" disabled={isRestoring}>
          <label htmlFor="restore-input" className="cursor-pointer">
            {isRestoring ? 'Restoring...' : 'Restore from Backup'}
            <input
              id="restore-input"
              type="file"
              accept=".json"
              className="sr-only"
              onChange={handleRestore}
              ref={fileInputRef}
              disabled={isRestoring}
            />
          </label>
        </Button>
      </div>
      <div className="mt-8 border-t border-border pt-4">
        <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-4">
          This action cannot be undone. This will permanently delete selected data categories.
        </p>
        <Button variant="destructive" onClick={() => setShowResetDialog(true)}>
          Reset Data
        </Button>
      </div>

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Data Reset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select the data categories you want to reset. This action cannot be undone.
            </p>
            <div className="flex gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                Deselect All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {dataCategories.map((category) => (
                <div key={category.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={category.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {category.label}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {selectedCategories.length > 0 && (
              <p className="text-sm text-orange-600">
                {selectedCategories.length} categories selected for reset
              </p>
            )}
          </div>
          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleResetConfirm}
              disabled={selectedCategories.length === 0 || isResetting}
            >
              {isResetting ? 'Resetting...' : 'Reset Selected Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
