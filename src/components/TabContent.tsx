import { Item as Asset, Waybill, WaybillItem, QuickCheckout, Site, SiteTransaction, CompanySettings, Employee, ReturnItem } from "@/services/api";
import { DashboardTab } from "@/components/tabs/DashboardTab";
import { AssetsTab } from "@/components/tabs/AssetsTab";
import { CreateWaybillTab } from "@/components/tabs/CreateWaybillTab";
import { WaybillsTab } from "@/components/tabs/WaybillsTab";
import { ReturnsTab } from "@/components/tabs/ReturnsTab";
import { SiteWaybillsTab } from "@/components/tabs/SiteWaybillsTab";
import { PrepareReturnWaybillTab } from "@/components/tabs/PrepareReturnWaybillTab";
import { QuickCheckoutTab } from "@/components/tabs/QuickCheckoutTab";
import { SettingsTab } from "@/components/tabs/SettingsTab";
import { SitesTab } from "@/components/tabs/SitesTab";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { SiteInventoryItem } from "@/hooks/useSiteInventory";
import { ToastProps } from "@/components/ui/toast";

interface TabContentProps {
  activeTab: string;
  assets: Asset[];
  sites: Site[];
  employees: Employee[];
  vehicles: string[];
  companySettings: CompanySettings;
  waybills: Waybill[];
  quickCheckouts: QuickCheckout[];
  siteTransactions: SiteTransaction[];
  siteInventory: SiteInventoryItem[];
  isAuthenticated: boolean;
  toast: (props: ToastProps) => void;
  selectedSite: Site | null;
  setAssets: (assets: Asset[]) => void;
  setActiveTab: (tab: string) => void;
  setSelectedSite: (site: Site | null) => void;
  setShowReturnForm: (waybill: Waybill | null) => void;
  handleEditAsset: (asset: Asset) => void;
  handleDeleteAsset: (asset: Asset) => void;
  handleCreateWaybill: (waybillData: Partial<Waybill>) => Promise<void>;
  handleViewWaybill: (waybill: Waybill) => void;
  handleEditWaybill: (waybill: Waybill) => void;
  handleInitiateReturn: (waybill: Waybill) => void;
  handleDeleteWaybill: (waybillId: string) => Promise<void>;
  handleSentToSite: (waybillId: string) => Promise<void>;
  handleOpenReturnDialog: (waybill: Waybill) => void;
  handleQuickCheckout: (checkoutData: Omit<QuickCheckout, 'id'>) => Promise<void>;
  handleReturnItem: (checkoutId: string) => Promise<void>;
  handleCreateReturnWaybill: (waybillData: { siteId: string; returnToSiteId?: string; items: WaybillItem[]; driverName: string; vehicle: string; purpose: string; expectedReturnDate?: Date; }) => Promise<void>;
  handleDeleteQuickCheckout: (checkoutId: string) => Promise<void>;
  handleReconcileSiteMaterials: (siteId: string) => Promise<void>;
  getSiteInventory: (siteId: string) => Promise<SiteInventoryItem[]>;
  handleAddSite: () => void;
  handleSaveSite: (site: Site) => Promise<void>;
  confirmDeleteSite: (siteId: string) => Promise<void>;
  handleAddAsset: (asset: Asset) => Promise<void>;
  handleUpdateAsset: (asset: Asset) => Promise<void>;
  handleProcessReturn: (returnData: { waybillId: string; items: ReturnItem[] }) => Promise<void>;
  setEmployees: (employees: Employee[]) => void;
  setVehicles: (vehicles: string[]) => void;
  setCompanySettings: (settings: CompanySettings) => void;
  setWaybills: (waybills: Waybill[]) => void;
  setQuickCheckouts: (checkouts: QuickCheckout[]) => void;
  setSites: (sites: Site[]) => void;
  setSiteTransactions: (transactions: SiteTransaction[]) => void;
  handleResetAllData: () => Promise<void>;
}

export const TabContent = ({
  activeTab,
  assets,
  sites,
  employees,
  vehicles,
  companySettings,
  waybills,
  quickCheckouts,
  siteTransactions,
  siteInventory,
  isAuthenticated,
  toast,
  selectedSite,
  setAssets,
  setActiveTab,
  setSelectedSite,
  setShowReturnForm,
  handleEditAsset,
  handleDeleteAsset,
  handleCreateWaybill,
  handleViewWaybill,
  handleEditWaybill,
  handleInitiateReturn,
  handleDeleteWaybill,
  handleSentToSite,
  handleOpenReturnDialog,
  handleQuickCheckout,
  handleReturnItem,
  handleCreateReturnWaybill,
  handleDeleteQuickCheckout,
  handleReconcileSiteMaterials,
  getSiteInventory,
  handleAddSite,
  handleSaveSite,
  confirmDeleteSite,
  handleAddAsset,
  handleUpdateAsset,
  handleProcessReturn,
  setEmployees,
  setVehicles,
  setCompanySettings,
  setWaybills,
  setQuickCheckouts,
  setSites,
  setSiteTransactions,
  handleResetAllData,
}: TabContentProps) => {
  switch (activeTab) {
    case "dashboard":
      return <DashboardTab assets={assets} waybills={waybills} quickCheckouts={quickCheckouts} sites={sites} siteTransactions={siteTransactions} />;
    case "assets":
      return (
        <AssetsTab
          assets={assets}
          setAssets={setAssets}
          isAuthenticated={isAuthenticated}
          handleEditAsset={handleEditAsset}
          handleDeleteAsset={handleDeleteAsset}
          toast={toast}
          waybills={waybills}
          quickCheckouts={quickCheckouts}
          siteTransactions={siteTransactions}
          sites={sites}
        />
      );
    case "create-waybill":
      return <CreateWaybillTab
        assets={assets}
        sites={sites}
        employees={employees}
        vehicles={vehicles}
        handleCreateWaybill={handleCreateWaybill}
        setActiveTab={setActiveTab}
      />;
    case "waybills":
      return <WaybillsTab
        waybills={waybills}
        sites={sites}
        assets={assets}
        employees={employees}
        vehicles={vehicles}
        handleCreateWaybill={handleCreateWaybill}
        setActiveTab={setActiveTab}
        handleViewWaybill={handleViewWaybill}
        handleEditWaybill={handleEditWaybill}
        handleInitiateReturn={handleInitiateReturn}
        handleDeleteWaybill={handleDeleteWaybill}
        handleSentToSite={handleSentToSite}
      />;
    case "returns":
      return <ReturnsTab
        waybills={waybills}
        sites={sites}
        handleViewWaybill={(waybill) => handleViewWaybill(waybill)}
        handleEditWaybill={handleEditWaybill}
        handleDeleteWaybill={handleDeleteWaybill}
        handleOpenReturnDialog={handleOpenReturnDialog}
      />;
    case "site-waybills":
      return <SiteWaybillsTab
        sites={sites}
        waybills={waybills}
        assets={assets}
        employees={employees}
        siteInventory={siteInventory}
        getSiteInventory={getSiteInventory}
        handleViewWaybill={handleViewWaybill}
        setActiveTab={setActiveTab}
        setSelectedSite={setSelectedSite}
        setShowReturnForm={setShowReturnForm}
        handleReconcileSiteMaterials={handleReconcileSiteMaterials}
      />;
    case "prepare-return-waybill":
      return <PrepareReturnWaybillTab
        selectedSite={selectedSite}
        sites={sites}
        assets={assets}
        siteInventory={siteInventory}
        employees={employees}
        vehicles={vehicles}
        handleCreateReturnWaybill={handleCreateReturnWaybill}
        setActiveTab={setActiveTab}
        setSelectedSite={setSelectedSite}
      />;
    case "quick-checkout":
      return <QuickCheckoutTab
        assets={assets}
        employees={employees}
        sites={sites}
        quickCheckouts={quickCheckouts}
        setQuickCheckouts={setQuickCheckouts}
        handleQuickCheckout={handleQuickCheckout}
        handleReturnItem={handleReturnItem}
        handleDeleteQuickCheckout={handleDeleteQuickCheckout}
        isAuthenticated={isAuthenticated}
        toast={toast}
      />;
    case "settings":
      return <SettingsTab
        companySettings={companySettings}
        setCompanySettings={setCompanySettings}
        isAuthenticated={isAuthenticated}
        employees={employees}
        setEmployees={setEmployees}
        vehicles={vehicles}
        setVehicles={setVehicles}
        assets={assets}
        setAssets={setAssets}
        waybills={waybills}
        setWaybills={setWaybills}
        quickCheckouts={quickCheckouts}
        setQuickCheckouts={setQuickCheckouts}
        sites={sites}
        setSites={setSites}
        siteTransactions={siteTransactions}
        setSiteTransactions={setSiteTransactions}
        handleResetAllData={handleResetAllData}
        toast={toast}
      />;
    case "sites":
      return <SitesTab
        sites={sites}
        assets={assets}
        waybills={waybills}
        employees={employees}
        vehicles={vehicles}
        transactions={siteTransactions}
        siteInventory={siteInventory}
        getSiteInventory={getSiteInventory}
        onAddSite={handleAddSite}
        onUpdateSite={handleSaveSite}
        onDeleteSite={confirmDeleteSite}
        onAddAsset={handleAddAsset}
        onUpdateAsset={handleUpdateAsset}
        onCreateWaybill={async (waybillData) => { await handleCreateWaybill(waybillData); }}
        onCreateReturnWaybill={async (waybillData) => { handleCreateReturnWaybill(waybillData); }}
        onProcessReturn={handleProcessReturn}
      />;
    default:
      return <Dashboard assets={assets} waybills={waybills} quickCheckouts={quickCheckouts} sites={sites} siteTransactions={siteTransactions} />;
  }
};
