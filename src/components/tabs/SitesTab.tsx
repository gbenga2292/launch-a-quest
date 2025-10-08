import { SitesPage } from "@/components/sites/SitesPage";
import { Site, Asset, Waybill, SiteTransaction, Employee } from "@/types/asset";
import { SiteInventoryItem } from "@/hooks/useSiteInventory";

interface SitesTabProps {
  sites: Site[];
  assets: Asset[];
  waybills: Waybill[];
  employees: Employee[];
  vehicles: string[];
  transactions: SiteTransaction[];
  siteInventory: SiteInventoryItem[];
  getSiteInventory: (siteId: string) => SiteInventoryItem[];
  onAddSite: (siteData: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateSite: (site: Site) => Promise<void>;
  onDeleteSite: (siteId: string) => Promise<void>;
  onAddAsset: (assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateAsset: (asset: Asset) => Promise<void>;
  onCreateWaybill: (waybillData: any) => Promise<void>;
  onCreateReturnWaybill: (waybillData: any) => Promise<void>;
  onProcessReturn: (returnData: { waybillId: string; items: any[] }) => Promise<void>;
}

export const SitesTab = ({
  sites,
  assets,
  waybills,
  employees,
  vehicles,
  transactions,
  siteInventory,
  getSiteInventory,
  onAddSite,
  onUpdateSite,
  onDeleteSite,
  onAddAsset,
  onUpdateAsset,
  onCreateWaybill,
  onCreateReturnWaybill,
  onProcessReturn
}: SitesTabProps) => {
  const handleAddSite = async (site: Site) => {
    const { id, createdAt, updatedAt, ...siteData } = site;
    await onAddSite(siteData);
  };

  const handleUpdateSite = async (site: Site) => {
    await onUpdateSite(site);
  };

  const handleDeleteSite = async (siteId: string) => {
    await onDeleteSite(siteId);
  };

  return (
    <SitesPage
      sites={sites}
      assets={assets}
      waybills={waybills}
      employees={employees}
      vehicles={vehicles}
      transactions={transactions}
      siteInventory={siteInventory}
      getSiteInventory={getSiteInventory}
      onAddSite={handleAddSite}
      onUpdateSite={handleUpdateSite}
      onDeleteSite={handleDeleteSite}
      onAddAsset={onAddAsset}
      onUpdateAsset={onUpdateAsset}
      onCreateWaybill={onCreateWaybill}
      onCreateReturnWaybill={onCreateReturnWaybill}
      onProcessReturn={onProcessReturn}
    />
  );
};
