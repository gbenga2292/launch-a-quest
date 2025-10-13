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
  quantity: apiAsset.quantity || 0,
  total_stock: apiAsset.total_stock || 0,
  reserved: apiAsset.reserved || 0,
  unit: apiAsset.unit || apiAsset.unitOfMeasurement || 'pcs',
  unitOfMeasurement: apiAsset.unitOfMeasurement || apiAsset.unit || 'pcs',
  category: apiAsset.category as 'Dewatering' | 'Waterproofing',
  type: apiAsset.type as 'consumable' | 'non-consumable' | 'tools' | 'equipment',
  location: apiAsset.location,
  checkoutType: apiAsset.checkoutType as 'waybill' | 'quick_checkout' | 'reconciled',
  checkout_type: apiAsset.checkout_type,
  service: '', // Not available in API
  status: apiAsset.status as 'active' | 'damaged' | 'missing' | 'maintenance',
  condition: apiAsset.condition as 'excellent' | 'good' | 'fair' | 'poor',
  missingCount: 0, // Not available in API
  damagedCount: 0, // Not available in API
  lowStockLevel: apiAsset.lowStockLevel,
  low_stock_level: apiAsset.low_stock_level,
  criticalStockLevel: apiAsset.criticalStockLevel,
  critical_stock_level: apiAsset.critical_stock_level,
  purchaseDate: undefined, // Not available in API
  cost: 0, // Not available in API
  createdAt: new Date(apiAsset.createdAt),
  created_at: typeof apiAsset.created_at === 'string' ? apiAsset.created_at : apiAsset.createdAt.toISOString(),
  updatedAt: new Date(apiAsset.updatedAt),
  updated_at: typeof apiAsset.updated_at === 'string' ? apiAsset.updated_at : apiAsset.updatedAt.toISOString(),
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

  const handleAddAsset = async (assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'created_at' | 'updated_at' | 'reserved'>) => {
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
      const initialStock = assetData.total_stock || assetData.quantity || 0;
      const apiAssetData = {
        name: assetData.name,
        description: assetData.description,
        total_stock: initialStock,  // Total purchased
        quantity: initialStock,  // Available starts at total
        reserved: 0,  // New assets start with 0 reserved
        unit: assetData.unit || assetData.unitOfMeasurement || 'pcs',
        category: assetData.category,
        type: assetData.type,
        location: assetData.location,
        checkout_type: assetData.checkoutType || assetData.checkout_type,
        status: assetData.status,
        condition: assetData.condition,
        low_stock_level: assetData.lowStockLevel || assetData.low_stock_level,
        critical_stock_level: assetData.criticalStockLevel || assetData.critical_stock_level,
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
      // NOTE: total_stock is NOT included here - it only changes on new purchases
      const apiAssetData = {
        name: updatedAsset.name,
        description: updatedAsset.description,
        quantity: updatedAsset.quantity,
        reserved: updatedAsset.reserved || 0,
        unit: updatedAsset.unit || updatedAsset.unitOfMeasurement || 'pcs',
        category: updatedAsset.category,
        type: updatedAsset.type,
        location: updatedAsset.location,
        checkout_type: updatedAsset.checkoutType || updatedAsset.checkout_type,
        status: updatedAsset.status,
        condition: updatedAsset.condition,
        low_stock_level: updatedAsset.lowStockLevel || updatedAsset.low_stock_level,
        critical_stock_level: updatedAsset.criticalStockLevel || updatedAsset.critical_stock_level,
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
      // NOTE: total_stock is NOT included - it only changes on new purchases
      const apiAssets = updatedAssets.map(asset => ({
        name: asset.name,
        description: asset.description,
        quantity: asset.quantity,
        reserved: asset.reserved || 0,
        unit: asset.unit || asset.unitOfMeasurement || 'pcs',
        category: asset.category,
        type: asset.type,
        location: asset.location,
        checkout_type: asset.checkoutType || asset.checkout_type,
        status: asset.status,
        condition: asset.condition,
        low_stock_level: asset.lowStockLevel || asset.low_stock_level,
        critical_stock_level: asset.criticalStockLevel || asset.critical_stock_level,
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
        const initialStock = item.quantity || 0;
        const assetData = {
          name: item.name,
          description: item.description || '',
          total_stock: initialStock,  // Total purchased
          quantity: initialStock,  // Available starts at total
          reserved: 0,
          unit: item.unitOfMeasurement || 'pcs',
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
