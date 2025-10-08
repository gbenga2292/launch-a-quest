import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useDashboardState } from "@/hooks/useDashboardState";
import { MainLayout } from "@/components/layout/MainLayout";
import { TabContent } from "@/components/TabContent";
import { AssetDialogs } from "@/components/dialogs/AssetDialogs";
import { WaybillDialogs } from "@/components/dialogs/WaybillDialogs";
import { AssetInventoryHeader } from "@/components/assets/AssetInventoryHeader";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Use the consolidated dashboard state hook
  const {
    // State
    activeTab,
    setActiveTab,
    mobileMenuOpen,
    setMobileMenuOpen,
    showWaybillDocument,
    setShowWaybillDocument,
    showReturnWaybillDocument,
    setShowReturnWaybillDocument,
    showReturnForm,
    setShowReturnForm,
    processingReturnWaybill,
    setProcessingReturnWaybill,
    editingWaybill,
    setEditingWaybill,
    editingReturnWaybill,
    setEditingReturnWaybill,
    editingAsset,
    setEditingAsset,
    deletingAsset,
    setDeletingAsset,
    selectedSite,
    setSelectedSite,

    // Data
    assets,
    sites,
    employees,
    vehicles,
    companySettings,
    waybills,
    quickCheckouts,
    siteTransactions,
    siteInventory,

    // Loading states
    assetsLoading,
    sitesLoading,
    employeesLoading,
    vehiclesLoading,
    companySettingsLoading,
    waybillsLoading,
    siteTransactionsLoading,

    // Handlers
    handleEditAsset,
    handleDeleteAsset,
    handleSaveAsset,
    confirmDeleteAsset,
    handleImport,
    handleAddSite,
    handleSaveSite,
    confirmDeleteSite,
    handleAddEmployee,
    handleSaveEmployee,
    confirmDeleteEmployee,
    handleAddVehicle,
    confirmDeleteVehicle,
    handleSaveCompanySettings,
    handleAddSiteTransaction,
    getSiteInventory,
    reconcileSiteMaterials,
    handleCreateWaybill,
    handleDeleteWaybill,
    handleSentToSite,
    handleProcessReturn,
    handleQuickCheckout,
    handleReturnItem,
    handleCreateReturnWaybill,
    handleUpdateReturnWaybill,
    handleUpdateWaybill,
    handleViewWaybill,
    handleEditWaybill,
    handleInitiateReturn,
    handleOpenReturnDialog,
    handleResetAllData,
    handleReconcileSiteMaterials,
    handleDeleteQuickCheckout,
    handleAddAsset,
    handleUpdateAsset,
    setAssets,
    setSites,
    setEmployees,
    setVehicles,
    setCompanySettings,
    setWaybills,
    setQuickCheckouts,
    setSiteTransactions,
  } = useDashboardState();

  return (
    <MainLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
    >
      <TabContent
        activeTab={activeTab}
        assets={assets as any}
        sites={sites as any}
        employees={employees as any}
        vehicles={vehicles}
        companySettings={companySettings as any}
        waybills={waybills as any}
        quickCheckouts={quickCheckouts as any}
        siteTransactions={siteTransactions as any}
        siteInventory={siteInventory}
        isAuthenticated={isAuthenticated}
        toast={toast}
        selectedSite={selectedSite as any}
        setAssets={setAssets as any}
        setActiveTab={setActiveTab}
        setSelectedSite={setSelectedSite as any}
        setShowReturnForm={setShowReturnForm as any}
        handleEditAsset={handleEditAsset as any}
        handleDeleteAsset={handleDeleteAsset as any}
        handleCreateWaybill={handleCreateWaybill}
        handleViewWaybill={handleViewWaybill as any}
        handleEditWaybill={handleEditWaybill as any}
        handleInitiateReturn={handleInitiateReturn as any}
        handleDeleteWaybill={handleDeleteWaybill}
        handleSentToSite={handleSentToSite}
        handleOpenReturnDialog={handleOpenReturnDialog as any}
        handleQuickCheckout={handleQuickCheckout}
        handleReturnItem={handleReturnItem}
        handleCreateReturnWaybill={handleCreateReturnWaybill}
        handleDeleteQuickCheckout={handleDeleteQuickCheckout}
        handleReconcileSiteMaterials={handleReconcileSiteMaterials}
        getSiteInventory={getSiteInventory}
        handleAddSite={handleAddSite}
        handleSaveSite={handleSaveSite as any}
        confirmDeleteSite={confirmDeleteSite}
        handleAddAsset={handleAddAsset as any}
        handleUpdateAsset={handleUpdateAsset as any}
        handleProcessReturn={handleProcessReturn}
        setEmployees={setEmployees as any}
        setVehicles={setVehicles}
        setCompanySettings={setCompanySettings as any}
        setWaybills={setWaybills as any}
        setQuickCheckouts={setQuickCheckouts as any}
        setSites={setSites as any}
        setSiteTransactions={setSiteTransactions as any}
        handleResetAllData={handleResetAllData}
      />

      {/* Asset Inventory Tab Header */}
      {activeTab === "assets" && (
        <AssetInventoryHeader
          assets={assets}
          companySettings={companySettings}
          handleImport={handleImport}
          setEditingAsset={setEditingAsset}
        />
      )}

      {/* Asset Dialogs */}
      <AssetDialogs
        editingAsset={editingAsset}
        setEditingAsset={setEditingAsset}
        deletingAsset={deletingAsset}
        setDeletingAsset={setDeletingAsset}
        handleSaveAsset={handleSaveAsset}
        handleAddAsset={handleAddAsset}
        confirmDeleteAsset={confirmDeleteAsset}
        sites={sites}
      />

      {/* Waybill Dialogs */}
      <WaybillDialogs
        showWaybillDocument={showWaybillDocument}
        setShowWaybillDocument={setShowWaybillDocument}
        showReturnWaybillDocument={showReturnWaybillDocument}
        setShowReturnWaybillDocument={setShowReturnWaybillDocument}
        showReturnForm={showReturnForm}
        setShowReturnForm={setShowReturnForm}
        processingReturnWaybill={processingReturnWaybill}
        setProcessingReturnWaybill={setProcessingReturnWaybill}
        editingWaybill={editingWaybill}
        setEditingWaybill={setEditingWaybill}
        editingReturnWaybill={editingReturnWaybill}
        setEditingReturnWaybill={setEditingReturnWaybill}
        sites={sites}
        companySettings={companySettings}
        assets={assets}
        siteInventory={siteInventory}
        employees={employees}
        vehicles={vehicles}
        handleProcessReturn={handleProcessReturn}
        handleCreateReturnWaybill={handleCreateReturnWaybill}
        handleUpdateReturnWaybill={handleUpdateReturnWaybill}
        handleUpdateWaybill={handleUpdateWaybill}
      />
    </MainLayout>
  );
};

export default Index;
