import { ReturnWaybillForm } from "@/components/waybills/ReturnWaybillForm";
import { Site, Asset, Employee, Waybill } from "@/types/asset";
import { SiteInventoryItem } from "@/hooks/useSiteInventory";

interface PrepareReturnWaybillTabProps {
  selectedSite: Site | null;
  sites: Site[];
  assets: Asset[];
  siteInventory: SiteInventoryItem[];
  employees: Employee[];
  vehicles: string[];
  handleCreateReturnWaybill: (waybillData: {
    siteId: string;
    returnToSiteId?: string;
    items: any[];
    driverName: string;
    vehicle: string;
    purpose: string;
    service: string;
    expectedReturnDate?: Date;
  }) => void;
  setActiveTab: (tab: string) => void;
  setSelectedSite: (site: Site | null) => void;
}

export const PrepareReturnWaybillTab = ({
  selectedSite,
  sites,
  assets,
  siteInventory,
  employees,
  vehicles,
  handleCreateReturnWaybill,
  setActiveTab,
  setSelectedSite
}: PrepareReturnWaybillTabProps) => {
  if (!selectedSite) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">No site selected</h3>
        <p className="text-muted-foreground">
          Please select a site from the Site Waybills section to prepare a return waybill.
        </p>
      </div>
    );
  }

  return (
    <ReturnWaybillForm
      site={selectedSite}
      sites={sites}
      assets={assets}
      siteInventory={siteInventory}
      employees={employees}
      vehicles={vehicles}
      onCreateReturnWaybill={handleCreateReturnWaybill}
      onCancel={() => {
        setSelectedSite(null);
        setActiveTab("site-waybills");
      }}
    />
  );
};
