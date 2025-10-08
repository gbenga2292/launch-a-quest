import { SiteWaybills } from "@/components/waybills/SiteWaybills";
import { Site, Waybill, Asset, Employee } from "@/types/asset";
import { SiteInventoryItem } from "@/hooks/useSiteInventory";

interface SiteWaybillsTabProps {
  sites: Site[];
  waybills: Waybill[];
  assets: Asset[];
  employees: Employee[];
  siteInventory: SiteInventoryItem[];
  getSiteInventory: (siteId: string) => SiteInventoryItem[];
  handleViewWaybill: (waybill: Waybill) => void;
  setActiveTab: (tab: string) => void;
  setSelectedSite: (site: Site | null) => void;
  setShowReturnForm: (waybill: Waybill | null) => void;
  handleReconcileSiteMaterials: (siteId: string) => void;
}

export const SiteWaybillsTab = ({
  sites,
  waybills,
  assets,
  employees,
  siteInventory,
  getSiteInventory,
  handleViewWaybill,
  setActiveTab,
  setSelectedSite,
  setShowReturnForm,
  handleReconcileSiteMaterials
}: SiteWaybillsTabProps) => {
  return (
    <SiteWaybills
      sites={sites}
      waybills={waybills}
      assets={assets}
      employees={employees}
      siteInventory={siteInventory}
      getSiteInventory={getSiteInventory}
      onViewWaybill={handleViewWaybill}
      onPrepareReturnWaybill={(site) => {
        setSelectedSite(site);
        setActiveTab("prepare-return-waybill");
      }}
      onProcessReturn={(site) => {
        // This might need to be implemented based on requirements
        console.log('Process return for site:', site);
      }}
      onReconcileSiteMaterials={handleReconcileSiteMaterials}
    />
  );
};
