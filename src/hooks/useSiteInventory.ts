import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';

export interface SiteInventoryItem {
  id: string;
  siteId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unit?: string;
  category?: string;
  lastUpdated: Date;
  createdAt: Date;
}

const apiToLocal = (apiItem: any): SiteInventoryItem => ({
  id: apiItem.id,
  siteId: apiItem.site_id,
  itemId: apiItem.item_id,
  itemName: apiItem.item_name,
  quantity: apiItem.quantity,
  unit: apiItem.unit,
  category: apiItem.category,
  lastUpdated: new Date(apiItem.last_updated),
  createdAt: new Date(apiItem.created_at)
});

export const useSiteInventory = () => {
  const { toast } = useToast();
  const [siteInventory, setSiteInventory] = useState<SiteInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSiteInventory = async () => {
      try {
        setLoading(true);
        // Compute materials at site directly from waybills to ensure completeness
        const waybills = await api.getWaybills();
        const inventoryMap = new Map<string, SiteInventoryItem>();

        waybills
          .filter((wb: any) => (wb.type === 'waybill') && (wb.status === 'sent_to_site'))
          .forEach((wb: any) => {
            const siteId = wb.return_to_site_id && wb.return_to_site_id !== '' ? wb.return_to_site_id : wb.site_id;
            const updatedAt = new Date(wb.updated_at || wb.created_at);
            (wb.items || []).forEach((it: any) => {
              const key = `${siteId}_${it.id}`;
              const existing = inventoryMap.get(key);
              if (existing) {
                existing.quantity += it.quantity || 0;
                // Keep most recent timestamp
                if (existing.lastUpdated < updatedAt) existing.lastUpdated = updatedAt;
              } else {
                inventoryMap.set(key, {
                  id: key,
                  siteId,
                  itemId: it.id,
                  itemName: it.name,
                  quantity: it.quantity || 0,
                  unit: it.unit,
                  category: undefined,
                  lastUpdated: updatedAt,
                  createdAt: updatedAt,
                });
              }
            });
          });

        setSiteInventory(Array.from(inventoryMap.values()));
      } catch (error) {
        console.error('Failed to load site inventory:', error);
        toast({
          title: "Error",
          description: "Failed to load site inventory",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    loadSiteInventory();
  }, [toast]);

  const getSiteInventory = (siteId: string) => {
    return siteInventory.filter(item => item.siteId === siteId);
  };

  const refreshSiteInventory = async () => {
    try {
      const waybills = await api.getWaybills();
      const inventoryMap = new Map<string, SiteInventoryItem>();
      waybills
        .filter((wb: any) => (wb.type === 'waybill') && (wb.status === 'sent_to_site'))
        .forEach((wb: any) => {
          const siteId = wb.return_to_site_id && wb.return_to_site_id !== '' ? wb.return_to_site_id : wb.site_id;
          const updatedAt = new Date(wb.updated_at || wb.created_at);
          (wb.items || []).forEach((it: any) => {
            const key = `${siteId}_${it.id}`;
            const existing = inventoryMap.get(key);
            if (existing) {
              existing.quantity += it.quantity || 0;
              if (existing.lastUpdated < updatedAt) existing.lastUpdated = updatedAt;
            } else {
              inventoryMap.set(key, {
                id: key,
                siteId,
                itemId: it.id,
                itemName: it.name,
                quantity: it.quantity || 0,
                unit: it.unit,
                category: undefined,
                lastUpdated: updatedAt,
                createdAt: updatedAt,
              });
            }
          });
        });
      setSiteInventory(Array.from(inventoryMap.values()));
    } catch (error) {
      console.error('Failed to refresh site inventory:', error);
    }
  };

  const reconcileSiteMaterials = async (siteId: string) => {
    try {
      const result = await api.reconcileSiteMaterials(siteId);
      await refreshSiteInventory();
      toast({
        title: "Success",
        description: `Reconciled ${result.itemsReconciled} items for this site`,
      });
      return result;
    } catch (error) {
      console.error('Failed to reconcile site materials:', error);
      toast({
        title: "Error",
        description: "Failed to reconcile site materials",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    siteInventory,
    loading,
    getSiteInventory,
    refreshSiteInventory,
    reconcileSiteMaterials
  };
};
