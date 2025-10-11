import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { useAssets } from "@/hooks/useAssets";
import { useWaybills } from "@/hooks/useWaybills";
import { useSites } from "@/hooks/useSites";
import { useEmployees } from "@/hooks/useEmployees";
import { useVehicles } from "@/hooks/useVehicles";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useSiteTransactions } from "@/hooks/useSiteTransactions";
import { useSiteInventory } from "@/hooks/useSiteInventory";
import { Item as ApiAsset, Waybill as ApiWaybill, WaybillItem as ApiWaybillItem, QuickCheckout as ApiQuickCheckout, ReturnBill, Site as ApiSite, CompanySettings, Employee as ApiEmployee, ReturnBillItem, SiteTransaction as ApiSiteTransaction } from "@/services/api";
import { Asset, Waybill, WaybillItem, QuickCheckout, Site, Employee, SiteTransaction, CompanySettings as CompanySettingsType } from "@/types/asset";

// Transformation functions to convert API types to local types
const transformApiAsset = (apiAsset: ApiAsset): Asset => ({
  id: apiAsset.id,
  name: apiAsset.name,
  description: apiAsset.description,
  quantity: apiAsset.quantity,
  total_stock: apiAsset.total_stock,
  reserved: apiAsset.reserved,
  unit: apiAsset.unit || '',
  unitOfMeasurement: apiAsset.unit || '',
  category: apiAsset.category as 'Dewatering' | 'Waterproofing',
  type: apiAsset.type as 'consumable' | 'non-consumable' | 'tools' | 'equipment',
  location: apiAsset.location,
  siteId: apiAsset.site_id,
  site_id: apiAsset.site_id,
  checkoutType: apiAsset.checkout_type as 'waybill' | 'quick_checkout' | 'reconciled',
  checkout_type: apiAsset.checkout_type,
  service: '', // Not available in API
  status: apiAsset.status as 'active' | 'damaged' | 'missing' | 'maintenance',
  condition: apiAsset.condition as 'excellent' | 'good' | 'fair' | 'poor',
  lowStockLevel: apiAsset.low_stock_level,
  low_stock_level: apiAsset.low_stock_level,
  criticalStockLevel: apiAsset.critical_stock_level,
  critical_stock_level: apiAsset.critical_stock_level,
  purchaseDate: undefined, // Not available in API
  cost: 0, // Not available in API
  createdAt: new Date(apiAsset.created_at),
  created_at: apiAsset.created_at,
  updatedAt: new Date(apiAsset.updated_at),
  updated_at: apiAsset.updated_at,
});

const transformApiWaybill = (apiWaybill: ApiWaybill): Waybill => ({
  id: apiWaybill.id,
  items: apiWaybill.items.map(item => ({
    assetId: item.assetId,
    assetName: item.assetName,
    quantity: item.quantity,
    returnedQuantity: item.returnedQuantity || 0,
    status: item.status || 'outstanding' as const
  })),
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
  createdAt: apiWaybill.createdAt,
  updatedAt: apiWaybill.updatedAt,
});

const transformApiSite = (apiSite: ApiSite): Site => ({
  id: apiSite.id,
  name: apiSite.name,
  location: apiSite.location,
  description: apiSite.description,
  clientName: apiSite.clientName,
  contactPerson: apiSite.contactPerson,
  phone: apiSite.phone,
  services: apiSite.services || [],
  status: apiSite.status as any,
  createdAt: apiSite.createdAt,
  updatedAt: apiSite.updatedAt,
});

const transformApiEmployee = (apiEmployee: ApiEmployee): Employee => ({
  id: apiEmployee.id,
  name: apiEmployee.name,
  role: apiEmployee.role,
  phone: apiEmployee.phone,
  email: apiEmployee.email,
  status: apiEmployee.status as any,
  createdAt: apiEmployee.createdAt,
  updatedAt: apiEmployee.updatedAt,
});

const transformApiSiteTransaction = (apiTransaction: ApiSiteTransaction): SiteTransaction => ({
  id: apiTransaction.id,
  siteId: apiTransaction.siteId,
  assetId: apiTransaction.assetId,
  assetName: apiTransaction.assetName,
  quantity: apiTransaction.quantity,
  type: apiTransaction.type as any,
  transactionType: apiTransaction.transactionType as any,
  referenceId: apiTransaction.referenceId,
  referenceType: apiTransaction.referenceType as any,
  condition: apiTransaction.condition as any,
  notes: apiTransaction.notes,
  createdAt: apiTransaction.createdAt,
  createdBy: apiTransaction.createdBy,
});

export const useDashboardState = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const params = useParams();
  const navigate = useNavigate();

  // Use hooks for state management
  const { assets, setAssets, loading: assetsLoading, handleAddAsset, handleSaveAsset: handleUpdateAsset, handleUpdateAssets, confirmDeleteAsset, handleImport } = useAssets();
  const { sites, setSites, loading: sitesLoading, handleAddSite, handleSaveSite, confirmDeleteSite } = useSites();
  const { employees, setEmployees, loading: employeesLoading, addEmployee: handleAddEmployee, saveEmployee: handleSaveEmployee, removeEmployee: confirmDeleteEmployee } = useEmployees();
  const { vehicles, setVehicles, loading: vehiclesLoading, addVehicle: handleAddVehicle, removeVehicle: confirmDeleteVehicle } = useVehicles();
  const { companySettings, setSettings: setCompanySettings, loading: companySettingsLoading, handleSaveCompanySettings } = useCompanySettings();
  const { siteTransactions, setSiteTransactions, loading: siteTransactionsLoading, handleAddSiteTransaction } = useSiteTransactions();
  const { siteInventory, getSiteInventory, refreshSiteInventory, reconcileSiteMaterials } = useSiteInventory();

  const {
    waybills,
    setWaybills,
    quickCheckouts,
    setQuickCheckouts,
    loading: waybillsLoading,
    handleCreateWaybill,
    handleDeleteWaybill,
    handleSentToSite,
    handleProcessReturn,
    handleQuickCheckout,
    handleReturnItem,
  } = useWaybills(assets, sites, setAssets, siteTransactions, setSiteTransactions, handleAddSiteTransaction, handleUpdateAssets, handleAddAsset, refreshSiteInventory);

  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem("activeTab");
    const urlTab = params.tab;
    const validTabs = ["dashboard", "assets", "waybills", "returns", "site-waybills", "prepare-return-waybill", "quick-checkout", "settings", "sites"];
    const tabFromUrl = urlTab && validTabs.includes(urlTab) ? urlTab : null;
    return tabFromUrl || saved || "dashboard";
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showWaybillDocument, setShowWaybillDocument] = useState<Waybill | null>(null);
  const [showReturnWaybillDocument, setShowReturnWaybillDocument] = useState<Waybill | null>(null);
  const [showReturnForm, setShowReturnForm] = useState<Waybill | null>(null);
  const [processingReturnWaybill, setProcessingReturnWaybill] = useState<Waybill | null>(null);
  const [editingWaybill, setEditingWaybill] = useState<Waybill | null>(null);
  const [editingReturnWaybill, setEditingReturnWaybill] = useState<Waybill | null>(null);

  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const handleEditAsset = (asset: Asset) => setEditingAsset(asset);
  const handleDeleteAsset = (asset: Asset) => setDeletingAsset(asset);

  const handleCreateReturnWaybill = async (waybillData: {
    siteId: string;
    returnToSiteId?: string;
    items: WaybillItem[];
    driverName: string;
    vehicle: string;
    purpose: string;
    service: string;
    expectedReturnDate?: Date;
  }) => {
    // Check for existing pending returns or zero stock warnings
    const warnings: string[] = [];
    const errors: string[] = [];
    waybillData.items.forEach(item => {
      // Check for pending returns
      const pendingReturns = waybills.filter(wb =>
        wb.type === 'return' &&
        wb.status === 'outstanding' &&
        wb.siteId === waybillData.siteId &&
        wb.items.some(wbItem => wbItem.assetId === item.assetId)
      );
      const pendingQty = pendingReturns.reduce((sum, wb) => {
        const wbItem = wb.items.find(i => i.assetId === item.assetId);
        return sum + (wbItem?.quantity || 0);
      }, 0);

      // Check effective site stock using site_inventory table
      const siteInventoryItem = siteInventory.find(si => 
        si.itemId === item.assetId && si.siteId === waybillData.siteId
      );
      const currentSiteQty = siteInventoryItem ? siteInventoryItem.quantity : 0;
      const effectiveAvailable = currentSiteQty - pendingQty;

      if (pendingQty > 0) {
        warnings.push(`${item.assetName} (${pendingQty} quantity) already has pending return(s) at this site.`);
      }

      if (effectiveAvailable < item.quantity) {
        errors.push(`Quantity exceeds what is on site for ${item.assetName}: Only ${effectiveAvailable} effectively available (requested: ${item.quantity}).`);
      }
    });

    if (errors.length > 0) {
      toast({
        title: "Return Error",
        description: errors.join(' '),
        variant: "destructive"
      });
      return; // Block creation
    }

    if (warnings.length > 0) {
      toast({
        title: "Return Warning",
        description: warnings.join(' '),
        variant: "default"
      });
    }

    // Create the return waybill using the existing waybill creation logic
    return await handleCreateWaybill({
      siteId: waybillData.siteId,
      returnToSiteId: waybillData.returnToSiteId,
      items: waybillData.items,
      driverName: waybillData.driverName,
      vehicle: waybillData.vehicle,
      purpose: waybillData.purpose,
      service: waybillData.service,
      expectedReturnDate: waybillData.expectedReturnDate,
      status: 'outstanding',
      type: 'return',
      issueDate: new Date()
    });
  };

  const handleUpdateReturnWaybill = async (updatedData: {
    id?: string;
    siteId: string;
    returnToSiteId?: string;
    items: WaybillItem[];
    driverName: string;
    vehicle: string;
    purpose: string;
    service: string;
    expectedReturnDate?: Date;
  }) => {
    if (!updatedData.id) {
      toast({
        title: "Error",
        description: "Waybill ID is required for update.",
        variant: "destructive"
      });
      return;
    }

    const existingWaybill = waybills.find(wb => wb.id === updatedData.id);
    if (!existingWaybill) {
      toast({
        title: "Error",
        description: "Waybill not found.",
        variant: "destructive"
      });
      return;
    }

    try {
      const updatedWaybill = {
        ...existingWaybill,
        ...updatedData,
        updated_at: new Date().toISOString()
      } as any;

      await api.updateWaybill(updatedData.id, updatedWaybill);

      setWaybills(prev => prev.map(wb =>
        wb.id === updatedData.id ? updatedWaybill as any : wb
      ));

      setEditingReturnWaybill(null as any);

      toast({
        title: "Return Waybill Updated",
        description: `Return waybill ${updatedData.id} updated successfully.`
      });
    } catch (error) {
      console.error('Failed to update return waybill:', error);
      toast({
        title: "Error",
        description: "Failed to update return waybill",
        variant: "destructive"
      });
    }
  };

  const handleUpdateWaybill = async (updatedData: Partial<Waybill>) => {
    if (!updatedData.id) {
      toast({
        title: "Error",
        description: "Waybill ID is required for update.",
        variant: "destructive"
      });
      return;
    }

    const existingWaybill = waybills.find(wb => wb.id === updatedData.id);
    if (!existingWaybill) {
      toast({
        title: "Error",
        description: "Waybill not found.",
        variant: "destructive"
      });
      return;
    }

    try {
      const updatedWaybill = {
        ...existingWaybill,
        ...updatedData,
        updated_at: new Date().toISOString()
      } as any;

      await api.updateWaybill(updatedData.id, updatedWaybill);

      setWaybills(prev => prev.map(wb =>
        wb.id === updatedData.id ? updatedWaybill as any : wb
      ));

      setEditingWaybill(null as any);

      toast({
        title: "Waybill Updated",
        description: `Waybill ${updatedData.id} updated successfully.`
      });
    } catch (error) {
      console.error('Failed to update waybill:', error);
      toast({
        title: "Error",
        description: "Failed to update waybill",
        variant: "destructive"
      });
    }
  };

  const handleViewWaybill = (waybill: Waybill) => {
    console.log('handleViewWaybill called with waybill:', waybill.id, waybill.type);
    if (waybill.type === 'return') {
      console.log('Setting showReturnWaybillDocument for return waybill');
      setShowReturnWaybillDocument(waybill as any);
    } else {
      console.log('Setting showWaybillDocument for regular waybill');
      setShowWaybillDocument(waybill as any);
    }
  };

  const handleEditWaybill = (waybill: Waybill) => {
    console.log('handleEditWaybill called with:', waybill.id, waybill.type, waybill.status);
    if (waybill.type === 'return' && waybill.status === 'outstanding') {
      console.log('Setting editingReturnWaybill for return waybill');
      setEditingReturnWaybill(waybill as any);
    } else {
      console.log('Setting editingWaybill for regular waybill');
      setEditingWaybill(waybill as any);
    }
  };

  const handleInitiateReturn = (waybill: Waybill) => {
    setShowReturnForm(waybill as any);
  };

  const handleOpenReturnDialog = (returnData: { waybillId: string; items: any[] }) => {
    const waybill = waybills.find(wb => wb.id === returnData.waybillId);
    if (waybill) {
      setProcessingReturnWaybill(waybill as any);
    }
  };

  const handleResetAllData = async (): Promise<void> => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to reset data",
        variant: "destructive"
      });
      return;
    }

    try {
      await api.resetDatabase();
      
      // Clear all local state
      setAssets([]);
      setSites([]);
      setEmployees([]);
      setVehicles([]);
      setWaybills([]);
      setQuickCheckouts([]);
      setSiteTransactions([]);

      toast({
        title: "Data Reset",
        description: "All data has been reset successfully.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset data",
        variant: "destructive"
      });
    }
  };

  const handleReconcileSiteMaterials = async (siteId: string) => {
    const site = sites.find(s => s.id === siteId);
    if (!site) {
      toast({
        title: "Error",
        description: "Site not found",
        variant: "destructive"
      });
      return;
    }

    try {
      await reconcileSiteMaterials(siteId);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleSaveAsset = (assetData: Asset) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to save assets",
        variant: "destructive"
      });
      return;
    }

    handleUpdateAsset(assetData);
    setEditingAsset(null);

    toast({
      title: "Asset Updated",
      description: "Asset updated successfully"
    });
  };



  const handleDeleteQuickCheckout = async (checkoutId: string): Promise<void> => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to delete checkouts",
        variant: "destructive"
      });
      return;
    }

    try {
      await api.deleteQuickCheckout(checkoutId);
      setQuickCheckouts(prev => prev.filter(checkout => checkout.id !== checkoutId));

      toast({
        title: "Checkout Deleted",
        description: "The checkout has been successfully deleted."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete checkout",
        variant: "destructive"
      });
    }
  };


  return {
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

    // Setters
    setAssets,
    setSites,
    setEmployees,
    setVehicles,
    setCompanySettings,
    setWaybills,
    setQuickCheckouts,
    setSiteTransactions,

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
  };
};
