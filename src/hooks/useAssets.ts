import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api, Item as ApiAsset } from '@/services/api';
import { Asset } from '@/types/asset';
import { ExcelAssetData } from '@/utils/excelParser';

// Transformation function to convert API type to local type
const transformApiAsset = (apiAsset: ApiAsset): Asset => ({
  id: apiAsset.id,
  name: apiAsset.name,
  description: apiAsset.description,
  quantity: apiAsset.total_stock,
  unitOfMeasurement: apiAsset.unit || '',
  category: apiAsset.category as 'Dewatering' | 'Waterproofing',
  type: apiAsset.type as 'consumable' | 'non-consumable' | 'tools' | 'equipment',
  location: apiAsset.location,
  siteId: apiAsset.site_id,
  checkoutType: apiAsset.checkout_type as 'waybill' | 'quick_checkout' | 'reconciled',
  service: '', // Not available in API
  status: apiAsset.status as 'active' | 'damaged' | 'missing' | 'maintenance',
  condition: apiAsset.condition as 'excellent' | 'good' | 'fair' | 'poor',
  missingCount: 0, // Not available in API
  damagedCount: 0, // Not available in API
  lowStockLevel: apiAsset.low_stock_level,
  criticalStockLevel: apiAsset.critical_stock_level,
  purchaseDate: undefined, // Not available in API
  cost: 0, // Not available in API
  createdAt: new Date(apiAsset.created_at),
  updatedAt: new Date(apiAsset.updated_at),
});

export const useAssets = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  // Load assets from API on mount
  useEffect(() => {
    const loadAssets = async () => {
      try {
        setLoading(true);
        const items = await api.getItems();
        const transformedAssets = items.map(transformApiAsset);
        setAssets(transformedAssets);
      } catch (error) {
        console.error('Failed to load assets:', error);
        toast({
          title: "Error",
          description: "Failed to load assets from server",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    loadAssets();
  }, [toast]);

  const handleAddAsset = async (assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('assetData', assetData);
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to add assets",
        variant: "destructive"
      });
      return;
    }
    try {
      // Convert local Asset format to API format
      const apiAssetData = {
        name: assetData.name,
        description: assetData.description,
        total_stock: assetData.quantity,
        unit: assetData.unitOfMeasurement,
        category: assetData.category,
        type: assetData.type,
        location: assetData.location,
        site_id: assetData.siteId,
        checkout_type: assetData.checkoutType,
        status: assetData.status,
        condition: assetData.condition,
        low_stock_level: assetData.lowStockLevel,
        critical_stock_level: assetData.criticalStockLevel,
      };
      const createdItem = await api.createItem(apiAssetData as any);
      const transformedAsset = transformApiAsset(createdItem);
      setAssets(prev => [...prev, transformedAsset]);
      toast({
        title: "Success",
        description: "Asset added successfully",
      });
    } catch (error) {
      console.error('Failed to add asset:', error);
      toast({
        title: "Error",
        description: "Failed to add asset",
        variant: "destructive"
      });
    }
  };

  const handleSaveAsset = async (updatedAsset: Asset) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to edit assets",
        variant: "destructive"
      });
      return;
    }
    try {
      console.log('Updating asset:', updatedAsset.id, 'with data:', updatedAsset);
      // Convert local Asset format to API format
      const apiAssetData = {
        name: updatedAsset.name,
        description: updatedAsset.description,
        total_stock: updatedAsset.quantity,
        unit: updatedAsset.unitOfMeasurement,
        category: updatedAsset.category,
        type: updatedAsset.type,
        location: updatedAsset.location,
        site_id: updatedAsset.siteId,
        checkout_type: updatedAsset.checkoutType,
        status: updatedAsset.status,
        condition: updatedAsset.condition,
        low_stock_level: updatedAsset.lowStockLevel,
        critical_stock_level: updatedAsset.criticalStockLevel,
      };
      const updatedItem = await api.updateItem(updatedAsset.id, apiAssetData as any);
      console.log('Updated item from server:', updatedItem);
      const transformedAsset = transformApiAsset(updatedItem);
      setAssets(prev =>
        prev.map(asset => (asset.id === updatedAsset.id ? transformedAsset : asset))
      );
      toast({
        title: "Success",
        description: "Asset updated successfully",
      });
    } catch (error) {
      console.error('Failed to update asset:', error);
      console.error('Error details:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  const handleUpdateAssets = async (updatedAssets: Asset[]) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to edit assets",
        variant: "destructive"
      });
      return;
    }
    try {
      // Convert local Assets to API format
      const apiAssets = updatedAssets.map(asset => ({
        name: asset.name,
        description: asset.description,
        total_stock: asset.quantity,
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
      }));
      await Promise.all(updatedAssets.map((asset, index) => api.updateItem(asset.id, apiAssets[index] as any)));
      setAssets(prev =>
        prev.map(asset => {
          const updatedAsset = updatedAssets.find(ua => ua.id === asset.id);
          return updatedAsset ? { ...asset, ...updatedAsset, updatedAt: new Date() } : asset;
        })
      );
      toast({
        title: "Success",
        description: "Assets updated successfully",
      });
    } catch (error) {
      console.error('Failed to update assets:', error);
      toast({
        title: "Error",
        description: "Failed to update assets",
        variant: "destructive"
      });
    }
  };

  const confirmDeleteAsset = async (assetId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to delete assets",
        variant: "destructive"
      });
      return;
    }
    try {
      await api.deleteItem(assetId);
      setAssets(prev => prev.filter(asset => asset.id !== assetId));
      toast({
        title: "Success",
        description: "Asset deleted successfully",
      });
    } catch (error) {
      console.error('Failed to delete asset:', error);
      toast({
        title: "Error",
        description: "Failed to delete asset",
        variant: "destructive"
      });
    }
  };

  const handleImport = async (importedAssets: ExcelAssetData[]) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to import assets",
        variant: "destructive"
      });
      return;
    }
    try {
      const newAssets: Asset[] = [];
      for (const item of importedAssets) {
        const assetData = {
          name: item.name,
          description: item.description || '',
          total_stock: item.quantity,
          unit: item.unitOfMeasurement,
          category: item.category,
          type: item.type,
          location: item.location || '',
          status: item.status || 'active',
          condition: item.condition || 'good',
          low_stock_level: undefined, // Not available in ExcelAssetData
          critical_stock_level: undefined,
        };
        const createdItem = await api.createItem(assetData as any);
        const transformedAsset = transformApiAsset(createdItem);
        newAssets.push(transformedAsset);
      }
      setAssets(prev => [...prev, ...newAssets]);
      toast({
        title: "Import Successful",
        description: `${newAssets.length} assets imported successfully`,
      });
    } catch (error) {
      console.error('Failed to import assets:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import some or all assets",
        variant: "destructive"
      });
    }
  };

  return {
    assets,
    loading,
    handleAddAsset,
    handleSaveAsset,
    confirmDeleteAsset,
    handleImport,
    setAssets,
    handleUpdateAssets
  };
};
