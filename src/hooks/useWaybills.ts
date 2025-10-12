import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api, Waybill as APIWaybill, QuickCheckout as APIQuickCheckout, ReturnBill as APIReturnBill } from '@/services/api';
import { Waybill, WaybillItem, QuickCheckout, ReturnBill, SiteTransaction, Asset } from '@/types/asset';

// Helper functions to convert between API types and local types
const apiWaybillToWaybill = (apiWaybill: APIWaybill): Waybill => ({
  id: apiWaybill.id.toString(),
  siteId: apiWaybill.siteId,
  driverName: apiWaybill.driverName,
  vehicle: apiWaybill.vehicle,
  issueDate: apiWaybill.issueDate,
  expectedReturnDate: apiWaybill.expectedReturnDate,
  purpose: apiWaybill.purpose,
  service: apiWaybill.service,
  returnToSiteId: apiWaybill.returnToSiteId,
  status: apiWaybill.status as any,
  type: apiWaybill.type as any,
  items: apiWaybill.items.map(item => ({
    assetId: item.assetId,
    assetName: item.assetName,
    quantity: item.quantity,
    returnedQuantity: item.returnedQuantity || 0,
    status: item.status || 'outstanding' as const
  })),
  createdAt: apiWaybill.createdAt,
  updatedAt: apiWaybill.updatedAt
});

const waybillToAPIWaybill = (waybill: Omit<Waybill, 'id' | 'createdAt' | 'updatedAt'>): Partial<APIWaybill> => ({
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
  items: waybill.items.map(item => ({
    assetId: item.assetId,
    assetName: item.assetName,
    quantity: item.quantity,
    returnedQuantity: item.returnedQuantity,
    status: item.status
  }))
});

const apiQuickCheckoutToQuickCheckout = (apiCheckout: APIQuickCheckout): QuickCheckout => ({
  id: apiCheckout.id,
  assetId: apiCheckout.assetId,
  assetName: apiCheckout.assetName,
  quantity: apiCheckout.quantity,
  employee: apiCheckout.employee,
  checkoutDate: apiCheckout.checkoutDate,
  expectedReturnDays: apiCheckout.expectedReturnDays,
  status: apiCheckout.status as any,
  siteId: apiCheckout.siteId
});

const quickCheckoutToAPIQuickCheckout = (checkout: Omit<QuickCheckout, 'id' | 'createdAt'>): Partial<APIQuickCheckout> => ({
  assetId: checkout.assetId,
  assetName: checkout.assetName,
  quantity: checkout.quantity,
  employee: checkout.employee,
  checkoutDate: checkout.checkoutDate,
  expectedReturnDays: checkout.expectedReturnDays,
  status: checkout.status,
  siteId: checkout.siteId
});

export const useWaybills = (
  assets: any[], 
  sites: any[], 
  setAssets: React.Dispatch<React.SetStateAction<any[]>>, 
  siteTransactions: SiteTransaction[], 
  setSiteTransactions: React.Dispatch<React.SetStateAction<SiteTransaction[]>>, 
  handleAddSiteTransaction: (transaction: Omit<SiteTransaction, 'id' | 'createdAt'>) => Promise<void>, 
  handleUpdateAssets: (assets: any[]) => Promise<void>, 
  handleAddAsset: (asset: any) => Promise<void>,
  refreshSiteInventory?: () => Promise<void>
) => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const [waybills, setWaybills] = useState<Waybill[]>([]);
  const [quickCheckouts, setQuickCheckouts] = useState<QuickCheckout[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [apiWaybills, apiQuickCheckouts] = await Promise.all([
          api.getWaybills(),
          api.getQuickCheckouts()
        ]);
        const waybillsData = apiWaybills.map(apiWaybillToWaybill);
        const quickCheckoutsData = apiQuickCheckouts.map(apiQuickCheckoutToQuickCheckout);
        setWaybills(waybillsData);
        setQuickCheckouts(quickCheckoutsData);
      } catch (error) {
        console.error('Failed to load waybills and checkouts:', error);
        toast({
          title: "Error",
          description: "Failed to load waybills and checkouts from server",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [toast]);

  const handleCreateWaybill = async (waybillData: Partial<Waybill>) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to create waybills",
        variant: "destructive"
      });
      return;
    }

    // Validation: Ensure all assets in the waybill exist in inventory
    const missingAssets = (waybillData.items || []).filter(item => {
      const asset = assets.find(a => a.id === item.assetId);
      return !asset || asset.quantity < item.quantity;
    });

    if (missingAssets.length > 0) {
      toast({
        title: "Validation Error",
        description: `Cannot create waybill: ${missingAssets.map(item => item.assetName).join(', ')} are either missing from inventory or insufficient quantity available.`,
        variant: "destructive"
      });
      return;
    }

    try {
      const apiWaybillData = waybillToAPIWaybill({
        siteId: waybillData.siteId,
        driverName: waybillData.driverName,
        vehicle: waybillData.vehicle,
        issueDate: waybillData.issueDate || new Date(),
        expectedReturnDate: waybillData.expectedReturnDate,
        purpose: waybillData.purpose,
        service: waybillData.service || 'dewatering',
        returnToSiteId: waybillData.returnToSiteId,
        status: waybillData.status || 'outstanding',
        type: waybillData.type || 'waybill',
        items: (waybillData.items || []).map(item => ({
          assetId: item.assetId,
          assetName: item.assetName,
          quantity: item.quantity,
          returnedQuantity: item.returnedQuantity || 0,
          status: item.status || 'outstanding'
        }))
      });

      const createdWaybill = await api.createWaybill(apiWaybillData);
      const newWaybill = apiWaybillToWaybill(createdWaybill);
      
      // Reserve items: reduce quantity (available) and increase reserved
      const updatedAssets: Asset[] = [];
      waybillData.items?.forEach(item => {
        const mainAsset = assets.find(a => a.id === item.assetId && !a.siteId);
        if (mainAsset) {
          updatedAssets.push({
            ...mainAsset,
            quantity: mainAsset.quantity - item.quantity,
            reserved: (mainAsset.reserved || 0) + item.quantity,
            updatedAt: new Date()
          });
        }
      });

      if (updatedAssets.length > 0) {
        await handleUpdateAssets(updatedAssets);
        setAssets(prev => prev.map(asset => {
          const updated = updatedAssets.find(u => u.id === asset.id);
          return updated || asset;
        }));
      }

      setWaybills(prev => [...prev, newWaybill]);

      toast({
        title: "Waybill Created",
        description: `Waybill ${newWaybill.id} created and items reserved`
      });
      return newWaybill;
    } catch (error) {
      console.error('Failed to create waybill:', error);
      toast({
        title: "Error",
        description: "Failed to create waybill",
        variant: "destructive"
      });
    }
  };

  const handleDeleteWaybill = async (waybill: Waybill) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to delete waybills",
        variant: "destructive"
      });
      return;
    }
    try {
      if (waybill.type === 'return') {
        if (waybill.status !== 'outstanding') {
          toast({
            title: "Cannot Delete",
            description: `Processed returns cannot be deleted.`,
            variant: "destructive"
          });
          return;
        }
      } else {
        // For draft/outstanding waybills, unreserve items
        if (waybill.status === 'outstanding') {
          const updatedAssets: Asset[] = [];
          waybill.items.forEach(item => {
            const mainAsset = assets.find(a => a.id === item.assetId && !a.siteId);
            if (mainAsset) {
              updatedAssets.push({
                ...mainAsset,
                quantity: mainAsset.quantity + item.quantity,
                reserved: (mainAsset.reserved || 0) - item.quantity,
                updatedAt: new Date()
              });
            }
          });
          if (updatedAssets.length > 0) {
            await handleUpdateAssets(updatedAssets);
            setAssets(prev => prev.map(asset => {
              const updated = updatedAssets.find(u => u.id === asset.id);
              return updated || asset;
            }));
          }
        }
        // For waybills sent to site, items are already at site - no inventory adjustment needed
      }
      await api.deleteWaybill(waybill.id);
      setWaybills(prev => prev.filter(wb => wb.id !== waybill.id));
      toast({
        title: "Waybill Deleted",
        description: `Waybill ${waybill.id} deleted successfully`
      });
    } catch (error) {
      console.error('Failed to delete waybill:', error);
      toast({
        title: "Error",
        description: "Failed to delete waybill",
        variant: "destructive"
      });
    }
  };

  const handleSentToSite = async (waybill: Waybill) => {
    try {
      const siteId = waybill.returnToSiteId || waybill.siteId;
      if (!siteId) {
        throw new Error('No site selected for waybill');
      }

      // 1. Update waybill status in database
      await api.sendToSite(waybill.id, siteId);

      // 2. Unreserve items in main inventory (items now at site, no longer reserved)
      const updatedAssets: Asset[] = [];
      waybill.items.forEach(item => {
        const mainAsset = assets.find(a => a.id === item.assetId && !a.siteId);
        if (mainAsset) {
          updatedAssets.push({
            ...mainAsset,
            reserved: (mainAsset.reserved || 0) - item.quantity,
            updatedAt: new Date()
          });
        }
      });

      if (updatedAssets.length > 0) {
        await handleUpdateAssets(updatedAssets);
      }

      // 3. Update/create site inventory records
      for (const item of waybill.items) {
        const mainAsset = assets.find(a => a.id === item.assetId);
        await api.upsertSiteInventory({
          site_id: siteId,
          item_id: item.assetId,
          item_name: item.assetName,
          quantity: item.quantity,
          unit: mainAsset?.unitOfMeasurement,
          category: mainAsset?.category
        });
      }

      // 4. Create site transactions for audit trail
      const transactions = waybill.items.map(item => ({
        siteId,
        assetId: item.assetId,
        assetName: item.assetName,
        quantity: item.quantity,
        type: 'out' as const,
        transactionType: 'waybill' as const,
        referenceId: waybill.id,
        referenceType: 'waybill' as const,
        notes: `Materials sent to site via waybill ${waybill.id}`,
        createdAt: new Date(),
        createdBy: waybill.driverName
      }));

      await Promise.all(transactions.map(handleAddSiteTransaction));

      // 5. Refresh site inventory to show updated materials at site
      if (refreshSiteInventory) {
        await refreshSiteInventory();
      }

      // 6. Update local state
      setWaybills(prev => prev.map(wb => wb.id === waybill.id ? { ...wb, status: 'sent_to_site' } : wb));
      setAssets(prev => prev.map(asset => {
        const updated = updatedAssets.find(u => u.id === asset.id);
        return updated || asset;
      }));

      toast({
        title: "Waybill Sent to Site",
        description: `Waybill ${waybill.id} sent to site. Inventory updated.`,
      });
    } catch (error) {
      console.error('Failed to send waybill to site:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send waybill to site",
        variant: "destructive"
      });
    }
  };

  const handleProcessReturn = async (returnData: { waybillId: string; items: any[] }) => {
    // Validation logic here (simplified)
    const waybill = waybills.find(wb => wb.id === returnData.waybillId);
    const siteId = waybill?.siteId;

    setWaybills(prev => prev.map(waybill => {
      if (waybill.id === returnData.waybillId) {
        const updatedItems = waybill.items.map(item => {
          const returnItem = returnData.items.find(ri => ri.assetId === item.assetId);
          if (returnItem) {
            return {
              ...item,
              returnedQuantity: item.returnedQuantity + returnItem.quantity,
              status: (item.returnedQuantity + returnItem.quantity >= item.quantity)
                ? 'return_completed' as const
                : 'partial_returned' as const
            };
          }
          return item;
        });

        const allItemsReturned = updatedItems.every(item => item.returnedQuantity >= item.quantity);

        return {
          ...waybill,
          items: updatedItems,
          status: allItemsReturned ? 'return_completed' as const : 'partial_returned' as const,
          updatedAt: new Date()
        };
      }
      return waybill;
    }));

    // Process returns - add quantity back to main inventory ONLY for good items
    // Damaged and missing items are tracked via site_transactions only
    for (const returnItem of returnData.items) {
      if (returnItem.condition === 'good') {
        // Add good items back to main inventory
        setAssets(prev => prev.map(asset => {
          if (asset.id === returnItem.assetId && !asset.siteId) {
            return { ...asset, quantity: asset.quantity + returnItem.quantity, updatedAt: new Date() };
          }
          return asset;
        }));
      }
      
      // Update site inventory - reduce quantity for ALL returned items (good, damaged, missing)
      if (siteId) {
        try {
          await api.upsertSiteInventory({
            site_id: siteId,
            item_id: returnItem.assetId,
            item_name: returnItem.assetName,
            quantity: -returnItem.quantity, // Negative to reduce quantity
            unit: returnItem.unit,
            category: returnItem.category
          });
        } catch (error) {
          console.error('Failed to update site inventory:', error);
        }
      }
    }

    const originalWaybill = waybills.find(wb => wb.id === returnData.waybillId && wb.type === 'waybill');
    const returnTransactions: SiteTransaction[] = returnData.items.map(returnItem => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      siteId: siteId || '',
      assetId: returnItem.assetId,
      assetName: returnItem.assetName,
      quantity: returnItem.quantity,
      type: 'in',
      transactionType: 'return',
      referenceId: returnData.waybillId,
      referenceType: 'waybill',
      condition: returnItem.condition,
      notes: `Material returned from site - Condition: ${returnItem.condition}`,
      createdAt: new Date(),
      createdBy: originalWaybill?.driverName || 'Unknown'
    }));

    await Promise.all(returnTransactions.map(handleAddSiteTransaction));
    
    // Refresh site inventory after processing return
    if (refreshSiteInventory) {
      await refreshSiteInventory();
    }

    toast({
      title: "Return Processed",
      description: `Items returned successfully. Good items added back to main inventory.`
    });
  };

  const handleQuickCheckout = async (checkoutData: Omit<QuickCheckout, 'id'>) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to checkout items",
        variant: "destructive"
      });
      return;
    }

    // Validation: Ensure asset exists in main inventory and has sufficient quantity
    const asset = assets.find(a => a.id === checkoutData.assetId);
    if (!asset) {
      toast({
        title: "Validation Error",
        description: `Asset ${checkoutData.assetName} not found in inventory.`,
        variant: "destructive"
      });
      return;
    }

    if (asset.quantity < checkoutData.quantity) {
      toast({
        title: "Validation Error",
        description: `Insufficient quantity for ${checkoutData.assetName}. Available: ${asset.quantity}, Requested: ${checkoutData.quantity}`,
        variant: "destructive"
      });
      return;
    }

    try {
      const apiCheckoutData = quickCheckoutToAPIQuickCheckout(checkoutData);
      const createdCheckout = await api.createQuickCheckout(apiCheckoutData);
      const newCheckout = apiQuickCheckoutToQuickCheckout(createdCheckout);
      setQuickCheckouts(prev => [...prev, newCheckout]);

      // Note: According to benchmark, main inventory should NOT change via checkouts
      // Quick checkouts are separate from main inventory management

      // Handle inventory updates - ONLY reduce from main inventory, never create new assets
      let assetsToUpdate: Asset[] = [];

      // Reduce quantity from main inventory
      const mainInventoryAsset = assets.find(a => a.id === checkoutData.assetId && !a.siteId);
      if (mainInventoryAsset) {
        assetsToUpdate.push({
          ...mainInventoryAsset,
          quantity: mainInventoryAsset.quantity - checkoutData.quantity,
          updatedAt: new Date()
        });
      }

      // If site is selected, create "out" transaction for tracking (no new assets)
      if (checkoutData.siteId) {
        const outTransaction: SiteTransaction = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          siteId: checkoutData.siteId,
          assetId: checkoutData.assetId,
          assetName: checkoutData.assetName,
          quantity: checkoutData.quantity,
          type: 'out' as const,
          transactionType: 'waybill' as const,
          referenceId: newCheckout.id,
          referenceType: 'quick_checkout' as const,
          notes: `Quick checkout to site: ${checkoutData.assetName} checked out by ${checkoutData.employee}`,
          createdAt: new Date(),
          createdBy: checkoutData.employee
        };

        await handleAddSiteTransaction(outTransaction);
      }

      // Update assets (only quantity changes, no new assets)
      if (assetsToUpdate.length > 0) {
        await handleUpdateAssets(assetsToUpdate);
      }

      toast({
        title: "Quick Checkout Created",
        description: `${checkoutData.assetName} checked out by ${checkoutData.employee}`
      });
    } catch (error) {
      console.error('Failed to create quick checkout:', error);
      toast({
        title: "Error",
        description: "Failed to create quick checkout",
        variant: "destructive"
      });
    }
  };

  const handleReturnItem = async (checkoutId: string) => {
    const checkout = quickCheckouts.find(c => c.id === checkoutId);
    if (!checkout) return;

    try {
      // Update the quick checkout status on the server
      // Fix: Send only the partial update with status field
      await api.updateQuickCheckout(checkoutId, { status: 'return_completed' });

      // Update local state
      setQuickCheckouts(prev => prev.map(c =>
        c.id === checkoutId ? { ...c, status: 'return_completed' } : c
      ));

      // Handle inventory updates based on whether item was checked out to a site
      if (checkout.siteId) {
        // Item was checked out to a site - reduce site inventory and add back to main inventory
        setAssets(prev => prev.map(asset => {
          if (asset.id === checkout.assetId && asset.siteId === checkout.siteId) {
            // Reduce quantity from site inventory
            const newQuantity = asset.quantity - checkout.quantity;
            return {
              ...asset,
              quantity: Math.max(0, newQuantity), // Ensure quantity doesn't go negative
              siteId: newQuantity <= 0 ? undefined : asset.siteId, // Remove from site if quantity becomes 0
              updatedAt: new Date()
            };
          } else if (asset.id === checkout.assetId && !asset.siteId) {
            // Add quantity back to main inventory
            return {
              ...asset,
              quantity: asset.quantity + checkout.quantity,
              updatedAt: new Date()
            };
          }
          return asset;
        }));

        // Create site transaction for the return
        const returnTransaction: SiteTransaction = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          siteId: checkout.siteId,
          assetId: checkout.assetId,
          assetName: checkout.assetName,
          quantity: checkout.quantity,
          type: 'in' as const,
          transactionType: 'return' as const,
          referenceId: checkoutId,
          referenceType: 'quick_checkout' as const,
          condition: 'good' as const,
          notes: `Quick checkout return: ${checkout.assetName} returned by ${checkout.employee}`,
          createdAt: new Date(),
          createdBy: checkout.employee
        };

        await handleAddSiteTransaction(returnTransaction);
      } else {
        // Item was not checked out to a site - just add back to main inventory
        setAssets(prev => prev.map(asset =>
          asset.id === checkout.assetId
            ? { ...asset, quantity: asset.quantity + checkout.quantity, updatedAt: new Date() }
            : asset
        ));
      }

      toast({
        title: "Item Returned",
        description: `${checkout.assetName} returned by ${checkout.employee}`
      });
    } catch (error) {
      console.error('Failed to return item:', error);
      toast({
        title: "Error",
        description: "Failed to return item",
        variant: "destructive"
      });
    }
  };

  const handleDeleteQuickCheckout = async (checkoutId: string) => {
    const checkout = quickCheckouts.find(c => c.id === checkoutId);
    if (!checkout) return;

    try {
      // Delete the quick checkout on the server
      await api.deleteQuickCheckout(checkoutId);

      // Update local state
      setQuickCheckouts(prev => prev.filter(c => c.id !== checkoutId));

      // Handle inventory updates based on whether item was checked out to a site
      if (checkout.siteId) {
        // Item was checked out to a site - reduce site inventory and add back to main inventory
        setAssets(prev => prev.map(asset => {
          if (asset.id === checkout.assetId && asset.siteId === checkout.siteId) {
            // Reduce quantity from site inventory
            const newQuantity = asset.quantity - checkout.quantity;
            return {
              ...asset,
              quantity: Math.max(0, newQuantity), // Ensure quantity doesn't go negative
              siteId: newQuantity <= 0 ? undefined : asset.siteId, // Remove from site if quantity becomes 0
              updatedAt: new Date()
            };
          } else if (asset.id === checkout.assetId && !asset.siteId) {
            // Add quantity back to main inventory
            return {
              ...asset,
              quantity: asset.quantity + checkout.quantity,
              updatedAt: new Date()
            };
          }
          return asset;
        }));
      } else {
        // Item was not checked out to a site - just add back to main inventory
        setAssets(prev => prev.map(asset =>
          asset.id === checkout.assetId
            ? { ...asset, quantity: asset.quantity + checkout.quantity, updatedAt: new Date() }
            : asset
        ));
      }

      toast({
        title: "Quick Checkout Deleted",
        description: `${checkout.assetName} checkout deleted and quantity returned to inventory`
      });
    } catch (error) {
      console.error('Failed to delete quick checkout:', error);
      toast({
        title: "Error",
        description: "Failed to delete quick checkout",
        variant: "destructive"
      });
    }
  };

  // New function to reconcile site materials by aggregating quick checkout and waybill materials
  const handleReconcileSiteMaterials = async (siteId: string) => {
    // Aggregate quick checkout materials for the site
    const quickCheckoutMaterials = quickCheckouts.filter(qc => qc.siteId === siteId);

    // Aggregate waybill materials sent to the site (status 'sent_to_site')
    const waybillMaterials = waybills
      .filter(wb => wb.siteId === siteId && wb.status === 'sent_to_site')
      .flatMap(wb => wb.items.map(item => ({
        assetId: item.assetId,
        assetName: item.assetName,
        quantity: item.quantity
      })));

    // Create a map to aggregate quantities by assetId
    const materialMap = new Map<string, { assetName: string; quantity: number }>();

    // Add quick checkout materials
    quickCheckoutMaterials.forEach(qc => {
      if (materialMap.has(qc.assetId)) {
        const existing = materialMap.get(qc.assetId)!;
        existing.quantity += qc.quantity;
        materialMap.set(qc.assetId, existing);
      } else {
        materialMap.set(qc.assetId, { assetName: qc.assetName, quantity: qc.quantity });
      }
    });

    // Add waybill materials
    waybillMaterials.forEach(wm => {
      if (materialMap.has(wm.assetId)) {
        const existing = materialMap.get(wm.assetId)!;
        existing.quantity += wm.quantity;
        materialMap.set(wm.assetId, existing);
      } else {
        materialMap.set(wm.assetId, { assetName: wm.assetName, quantity: wm.quantity });
      }
    });

    // Create new assets for reconciled materials
    const reconciledAssets = Array.from(materialMap.entries()).map(([assetId, { assetName, quantity }]) => ({
      id: assetId,
      name: assetName,
      quantity,
      unitOfMeasurement: '', // Could be improved by fetching from main inventory
      category: 'Dewatering' as const, // Default category, could be improved
      type: 'equipment', // Default type, could be improved
      location: '',
      siteId,
      status: 'active' as const,
      condition: 'good' as const,
      description: '',
      checkoutType: 'reconciled' as const,
      service: '',
      missingCount: 0,
      damagedCount: 0,
      lowStockLevel: undefined,
      criticalStockLevel: undefined,
      purchaseDate: undefined,
      cost: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    // Add reconciled assets to inventory
    for (const asset of reconciledAssets) {
      const { id, createdAt, updatedAt, ...assetData } = asset;
      await handleAddAsset(assetData);
    }

    // Update assets state for the site with reconciled materials
    setAssets(prevAssets => {
      // Filter out existing assets for the site that are quick_checkout or waybill type
      const filteredAssets = prevAssets.filter(asset =>
        !(asset.siteId === siteId && ['quick_checkout', 'waybill'].includes(asset.checkoutType))
      );

      return [...filteredAssets, ...reconciledAssets];
    });
  };

  return {
    waybills,
    quickCheckouts,
    loading,
    handleCreateWaybill,
    handleDeleteWaybill,
    handleSentToSite,
    handleProcessReturn,
    handleQuickCheckout,
    handleReturnItem,
    handleReconcileSiteMaterials,
    setWaybills,
    setQuickCheckouts
  };
};
