import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssetTable } from "@/components/assets/AssetTable";
import { AddAssetForm } from "@/components/assets/AddAssetForm";
import { WaybillList } from "@/components/waybills/WaybillList";
import { WaybillForm } from "@/components/waybills/WaybillForm";
import { EditWaybillForm } from "@/components/waybills/EditWaybillForm";
import { WaybillDocument } from "@/components/waybills/WaybillDocument";
import { ReturnForm } from "@/components/waybills/ReturnForm";
import { SiteWaybills } from "@/components/waybills/SiteWaybills";
import { ReturnWaybillForm } from "@/components/waybills/ReturnWaybillForm";
import { ReturnWaybillDocument } from "@/components/waybills/ReturnWaybillDocument";
import { ReturnProcessingDialog } from "@/components/waybills/ReturnProcessingDialog";
import { QuickCheckoutForm } from "@/components/checkout/QuickCheckoutForm";
import { transformAssetFromDB, transformWaybillFromDB } from "@/utils/dataTransform";

import { CompanySettings } from "@/components/settings/CompanySettings";
import { Asset, Waybill, WaybillItem, QuickCheckout, ReturnBill, Site, CompanySettings as CompanySettingsType, Employee, ReturnItem, SiteTransaction, Vehicle } from "@/types/asset";
import { EquipmentLog } from "@/types/equipment";
import { ConsumableUsageLog } from "@/types/consumable";
import { AssetAnalyticsDialog } from "@/components/assets/AssetAnalyticsDialog";
import { ReturnsList } from "@/components/waybills/ReturnsList";
import { useToast } from "@/hooks/use-toast";
import { BulkImportAssets } from "@/components/assets/BulkImportAssets";
import { InventoryReport } from "@/components/assets/InventoryReport";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SitesPage } from "@/components/sites/SitesPage";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteInventory } from "@/hooks/useSiteInventory";
import { SiteInventoryItem } from "@/types/inventory";

const Index = () => {
  const { toast } = useToast();
  const { isAuthenticated, hasPermission, currentUser } = useAuth();
  const isMobile = useIsMobile();
  const params = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showWaybillDocument, setShowWaybillDocument] = useState<Waybill | null>(null);
  const [showReturnWaybillDocument, setShowReturnWaybillDocument] = useState<Waybill | null>(null);
  const [showReturnForm, setShowReturnForm] = useState<Waybill | null>(null);
  const [processingReturnWaybill, setProcessingReturnWaybill] = useState<Waybill | null>(null);
  const [editingWaybill, setEditingWaybill] = useState<Waybill | null>(null);
  const [editingReturnWaybill, setEditingReturnWaybill] = useState<Waybill | null>(null);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
  const [selectedAssetForAnalytics, setSelectedAssetForAnalytics] = useState<Asset | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);

  // Load assets from database
  useEffect(() => {
    (async () => {
      if (window.db) {
        try {
          const loadedAssets = await window.db.getAssets();
          const processedAssets = loadedAssets.map((item: any) => {
            const asset = {
              ...item,
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt),
              siteQuantities: item.site_quantities ? JSON.parse(item.site_quantities) : {}
            };
            // Recalculate availableQuantity on load
            if (!asset.siteId) {
              const reservedQuantity = asset.reservedQuantity || 0;
              const damagedCount = asset.damagedCount || 0;
              const missingCount = asset.missingCount || 0;
              const totalQuantity = asset.quantity;
              asset.availableQuantity = totalQuantity - reservedQuantity - damagedCount - missingCount;
            }
            return asset;
          });
          console.log('Loaded assets with availableQuantity:', processedAssets);
          setAssets(processedAssets);
        } catch (error) {
          logger.error('Failed to load assets from database', error);
        }
      }
    })();
  }, []);

  const [waybills, setWaybills] = useState<Waybill[]>([]);

  // Load waybills from database
  useEffect(() => {
    (async () => {
      if (window.db) {
        try {
          const loadedWaybills = await window.db.getWaybills();
          console.log("Loaded waybills from DB:", loadedWaybills);
          setWaybills(loadedWaybills.map((item: any) => ({
            ...item,
            issueDate: new Date(item.issueDate),
            expectedReturnDate: item.expectedReturnDate ? new Date(item.expectedReturnDate) : undefined,
            sentToSiteDate: item.sentToSiteDate ? new Date(item.sentToSiteDate) : undefined,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt)
          })));
        } catch (error) {
          logger.error('Failed to load waybills from database', error);
        }
      }
    })();
  }, []);

  const [quickCheckouts, setQuickCheckouts] = useState<QuickCheckout[]>([]);

  // Load quick checkouts from database
  useEffect(() => {
    (async () => {
      if (window.db) {
        try {
          const loadedCheckouts = await window.db.getQuickCheckouts();
          setQuickCheckouts(loadedCheckouts.map((item: any) => ({
            ...item,
            checkoutDate: new Date(item.checkoutDate)
          })));
        } catch (error) {
          logger.error('Failed to load quick checkouts from database', error);
        }
      }
    })();
  }, []);


  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Load employees from database
  useEffect(() => {
    (async () => {
      if (window.db) {
        try {
          const loadedEmployees = await window.db.getEmployees();
          setEmployees(loadedEmployees.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt)
          })));
        } catch (error) {
          logger.error('Failed to load employees from database', error);
        }
      }
    })();
  }, []);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Load vehicles from database
  useEffect(() => {
    (async () => {
      if (window.db) {
        try {
          const loadedVehicles = await window.db.getVehicles();
          setVehicles(loadedVehicles.map((item: any) => ({
            ...item,
            createdAt: new Date(item.created_at || item.createdAt),
            updatedAt: new Date(item.updated_at || item.updatedAt)
          })));
        } catch (error) {
          logger.error('Failed to load vehicles from database', error);
        }
      }
    })();
  }, []);

  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [sites, setSites] = useState<Site[]>([]);

  // Load sites from database
  useEffect(() => {
    (async () => {
      if (window.db) {
        try {
          const loadedSites = await window.db.getSites();
          setSites(loadedSites.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt)
          })));
        } catch (error) {
          logger.error('Failed to load sites from database', error);
        }
      }
    })();
  }, []);

  const [companySettings, setCompanySettings] = useState<CompanySettingsType>({} as CompanySettingsType);

  // Load company settings from database
  useEffect(() => {
    (async () => {
      if (window.db) {
        try {
          const loadedSettings = await window.db.getCompanySettings();
          setCompanySettings(loadedSettings || {});
        } catch (error) {
          logger.error('Failed to load company settings from database', error);
        }
      }
    })();
  }, []);

const [siteTransactions, setSiteTransactions] = useState<SiteTransaction[]>([]);

  // Load site transactions from database
  useEffect(() => {
    (async () => {
      if (window.db) {
        try {
          const loadedTransactions = await window.db.getSiteTransactions();
          setSiteTransactions(loadedTransactions.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt)
          })));
        } catch (error) {
          logger.error('Failed to load site transactions from database', error);
        }
      }
    })();
  }, []);

const [equipmentLogs, setEquipmentLogs] = useState<EquipmentLog[]>([]);

  // Load equipment logs from database
  useEffect(() => {
    (async () => {
      if (window.db) {
        try {
          const logs = await window.db.getEquipmentLogs();
          setEquipmentLogs(logs.map((item: any) => ({
            id: item.id,
            equipmentId: item.equipment_id ? item.equipment_id.toString() : item.equipment_id,
            equipmentName: item.equipment_name,
            siteId: item.site_id ? item.site_id.toString() : item.site_id,
            date: new Date(item.date),
            active: item.active,
            downtimeEntries: typeof item.downtime_entries === 'string' ? JSON.parse(item.downtime_entries) : item.downtime_entries || [],
            maintenanceDetails: item.maintenance_details,
            dieselEntered: item.diesel_entered,
            supervisorOnSite: item.supervisor_on_site,
            clientFeedback: item.client_feedback,
            issuesOnSite: item.issues_on_site,
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at)
          })));
        } catch (error) {
          logger.error('Failed to load equipment logs from database', error);
        }
      }
    })();
  }, []);

const [consumableLogs, setConsumableLogs] = useState<ConsumableUsageLog[]>([]);

  // Load consumable logs from database
  useEffect(() => {
    (async () => {
      if (window.db) {
        try {
          const logs = await window.db.getConsumableLogs();
          setConsumableLogs(logs);
        } catch (error) {
          logger.error('Failed to load consumable logs from database', error);
        }
      }
    })();
  }, []);

  // Update handleImport to map imported data to Asset type and save to database
  const handleImport = async (importedAssets: any[]) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to import assets",
        variant: "destructive"
      });
      return;
    }

    // Check if database is available
    if (!window.db) {
      toast({
        title: "Database Not Available",
        description: "This app needs to run in Electron mode to access the database. Please run the desktop application.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Map imported data to Asset format
      const mapped: Asset[] = importedAssets.map((item, idx) => {
        const quantity = Number(item.quantity || item.Quantity || 0);
        const reservedQuantity = 0; // Default to 0 for imports
        const siteQuantities = {}; // Empty for imports
        const availableQuantity = quantity - reservedQuantity; // Calculate as quantity - reservedQuantity

        return {
          id: Date.now().toString() + idx,
          name: (item.name || item.Name || "").trim(),
          description: item.description || item.Description || "",
          quantity,
          reservedQuantity,
          availableQuantity,
          siteQuantities,
          unitOfMeasurement: item.unitOfMeasurement || item['unit of measurement'] || item.unit || item.uom || "pcs",
          category: (item.category || item.Category || "dewatering") as 'dewatering' | 'waterproofing',
          type: (item.type || item.Type || "equipment") as 'consumable' | 'non-consumable' | 'tools' | 'equipment',
          location: item.location || item.Location || "",
          status: (item.status || 'active') as 'active' | 'damaged' | 'missing' | 'maintenance',
          condition: (item.condition || 'good') as 'excellent' | 'good' | 'fair' | 'poor',
          lowStockLevel: Number(item.lowStockLevel || 5),
          criticalStockLevel: Number(item.criticalStockLevel || 2),
          cost: Number(item.cost || item.price || 0),
          createdAt: new Date(),
          updatedAt: new Date(),
          missingCount: 0, // Default
          damagedCount: 0, // Default
        };
      });

      // Check for duplicate names within imported data
      const importedNames = mapped.map(a => a.name.toLowerCase());
      const duplicatesInImport = importedNames.filter((name, index) => 
        name && importedNames.indexOf(name) !== index
      );
      
      if (duplicatesInImport.length > 0) {
        const uniqueDuplicates = [...new Set(duplicatesInImport)];
        toast({
          title: "Duplicate Names in Import",
          description: `The following asset names appear multiple times in your import file: ${uniqueDuplicates.join(', ')}. Each asset must have a unique name.`,
          variant: "destructive"
        });
        return;
      }

      // Check for duplicates against existing assets
      const existingNames = assets.map(a => a.name.toLowerCase());
      const duplicatesWithExisting = mapped.filter(asset => 
        asset.name && existingNames.includes(asset.name.toLowerCase())
      );

      if (duplicatesWithExisting.length > 0) {
        const duplicateNames = duplicatesWithExisting.map(a => a.name).join(', ');
        toast({
          title: "Duplicate Asset Names",
          description: `The following asset names already exist in your inventory: ${duplicateNames}. Cannot import duplicate asset names.`,
          variant: "destructive"
        });
        return;
      }

      // Validate that all assets have names
      const assetsWithoutNames = mapped.filter(a => !a.name || a.name.trim() === '');
      if (assetsWithoutNames.length > 0) {
        toast({
          title: "Missing Asset Names",
          description: `${assetsWithoutNames.length} asset(s) in your import file are missing names. All assets must have a name.`,
          variant: "destructive"
        });
        return;
      }

      // Save each asset to the database
      const savedAssets: Asset[] = [];
      const failedAssets: string[] = [];
      for (const asset of mapped) {
        try {
          const savedAsset = await window.db.createAsset(asset);
          savedAssets.push(savedAsset[0]); // createAsset returns an array
        } catch (error) {
          logger.error('Failed to save asset to database', error, { context: 'BulkImport', data: { assetName: asset.name } });
          failedAssets.push(asset.name);
          // Continue with other assets even if one fails
        }
      }

      // Update local state with successfully saved assets
      setAssets(prev => [...prev, ...savedAssets]);

      if (failedAssets.length > 0) {
        toast({
          title: "Partial Import Success",
          description: `Successfully imported ${savedAssets.length} out of ${mapped.length} assets. Failed: ${failedAssets.join(', ')}`,
          variant: "default"
        });
      } else {
        toast({
          title: "Bulk Import Completed",
          description: `Successfully imported ${savedAssets.length} asset(s) with unique names`
        });
      }
    } catch (error) {
      logger.error('Bulk import error', error);
      toast({
        title: "Import Failed",
        description: `Failed to import assets: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const handleResetAllData = () => {
    // Clear all states
    setAssets([]);
    setWaybills([]);
    setQuickCheckouts([]);
    setSites([]);
    setSiteTransactions([]);
    setEmployees([]);
    setVehicles([]);
    setCompanySettings({} as CompanySettingsType);
  };

  // Use site inventory hook
  const { siteInventory, getSiteInventory } = useSiteInventory(waybills, assets);

  const handleSaveAsset = async (updatedAsset: Asset) => {
    try {
      if (window.db) {
        await window.db.updateAsset(updatedAsset.id, {
          ...updatedAsset,
          site_quantities: JSON.stringify(updatedAsset.siteQuantities || {}),
          updated_at: new Date().toISOString()
        });
      }
      setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
      setEditingAsset(null);
      toast({
        title: "Asset Updated",
        description: `${updatedAsset.name} has been updated successfully`
      });
    } catch (error) {
      logger.error('Failed to update asset', error);
      toast({
        title: "Error",
        description: "Failed to update asset",
        variant: "destructive"
      });
    }
  };

  const confirmDeleteAsset = async () => {
    if (!deletingAsset) return;
    try {
      if (window.db) {
        await window.db.deleteAsset(deletingAsset.id);
      }
      setAssets(prev => prev.filter(a => a.id !== deletingAsset.id));
      toast({
        title: "Asset Deleted",
        description: `${deletingAsset.name} has been deleted successfully`
      });
      setDeletingAsset(null);
    } catch (error) {
      logger.error('Failed to delete asset', error);
      toast({
        title: "Error",
        description: "Failed to delete asset",
        variant: "destructive"
      });
    }
  };

  const handleProcessReturn = async (returnData: any) => {
    if (!window.db) {
      toast({
        title: "Database Not Available",
        description: "This app needs to run in Electron mode",
        variant: "destructive"
      });
      return;
    }

    try {
      await window.db.processReturnWithTransaction(returnData);
      
      // Reload assets and waybills
      const loadedAssets = await window.db.getAssets();
      const processedAssets = loadedAssets.map((item: any) => {
        const asset = {
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          siteQuantities: item.site_quantities ? JSON.parse(item.site_quantities) : {}
        };
        if (!asset.siteId) {
          const reservedQuantity = asset.reservedQuantity || 0;
          const damagedCount = asset.damagedCount || 0;
          const missingCount = asset.missingCount || 0;
          const totalQuantity = asset.quantity;
          asset.availableQuantity = totalQuantity - reservedQuantity - damagedCount - missingCount;
        }
        return asset;
      });
      setAssets(processedAssets);

      const loadedWaybills = await window.db.getWaybills();
      setWaybills(loadedWaybills.map((item: any) => ({
        ...item,
        issueDate: new Date(item.issueDate),
        expectedReturnDate: item.expectedReturnDate ? new Date(item.expectedReturnDate) : undefined,
        sentToSiteDate: item.sentToSiteDate ? new Date(item.sentToSiteDate) : undefined,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      })));

      setShowReturnForm(null);
      toast({
        title: "Return Processed",
        description: "Return has been processed successfully"
      });
    } catch (error) {
      logger.error('Failed to process return', error);
      toast({
        title: "Error",
        description: `Failed to process return: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const handleCreateReturnWaybill = async (waybillData: Omit<Waybill, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!window.db) {
      toast({
        title: "Database Not Available",
        description: "This app needs to run in Electron mode",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await window.db.createWaybill(waybillData);
      const newWaybill = {
        ...result.waybill,
        issueDate: new Date(result.waybill.issueDate),
        expectedReturnDate: result.waybill.expectedReturnDate ? new Date(result.waybill.expectedReturnDate) : undefined,
        sentToSiteDate: result.waybill.sentToSiteDate ? new Date(result.waybill.sentToSiteDate) : undefined,
        createdAt: new Date(result.waybill.createdAt),
        updatedAt: new Date(result.waybill.updatedAt)
      };
      
      setWaybills(prev => [...prev, newWaybill]);
      
      // Reload assets to reflect updated quantities
      const loadedAssets = await window.db.getAssets();
      const processedAssets = loadedAssets.map((item: any) => {
        const asset = {
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          siteQuantities: item.site_quantities ? JSON.parse(item.site_quantities) : {}
        };
        if (!asset.siteId) {
          const reservedQuantity = asset.reservedQuantity || 0;
          const damagedCount = asset.damagedCount || 0;
          const missingCount = asset.missingCount || 0;
          const totalQuantity = asset.quantity;
          asset.availableQuantity = totalQuantity - reservedQuantity - damagedCount - missingCount;
        }
        return asset;
      });
      setAssets(processedAssets);
      
      toast({
        title: "Return Waybill Created",
        description: `Return waybill ${newWaybill.id} created successfully`
      });
    } catch (error) {
      logger.error('Failed to create return waybill', error);
      toast({
        title: "Error",
        description: `Failed to create return waybill: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const handleUpdateReturnWaybill = async (updatedWaybill: Waybill) => {
    if (!window.db) {
      toast({
        title: "Database Not Available",
        description: "This app needs to run in Electron mode",
        variant: "destructive"
      });
      return;
    }

    try {
      await window.db.updateWaybill(updatedWaybill.id, {
        ...updatedWaybill,
        issue_date: updatedWaybill.issueDate.toISOString(),
        expected_return_date: updatedWaybill.expectedReturnDate?.toISOString(),
        sent_to_site_date: updatedWaybill.sentToSiteDate?.toISOString(),
        updated_at: new Date().toISOString()
      });
      
      setWaybills(prev => prev.map(w => w.id === updatedWaybill.id ? updatedWaybill : w));
      
      // Reload assets
      const loadedAssets = await window.db.getAssets();
      const processedAssets = loadedAssets.map((item: any) => {
        const asset = {
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          siteQuantities: item.site_quantities ? JSON.parse(item.site_quantities) : {}
        };
        if (!asset.siteId) {
          const reservedQuantity = asset.reservedQuantity || 0;
          const damagedCount = asset.damagedCount || 0;
          const missingCount = asset.missingCount || 0;
          const totalQuantity = asset.quantity;
          asset.availableQuantity = totalQuantity - reservedQuantity - damagedCount - missingCount;
        }
        return asset;
      });
      setAssets(processedAssets);
      
      setEditingReturnWaybill(null);
      toast({
        title: "Return Waybill Updated",
        description: `Return waybill ${updatedWaybill.id} updated successfully`
      });
    } catch (error) {
      logger.error('Failed to update return waybill', error);
      toast({
        title: "Error",
        description: `Failed to update return waybill: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const handleAddSite = async (site: Site) => {
    if (!window.db) {
      toast({
        title: "Database Not Available",
        description: "This app needs to run in Electron mode",
        variant: "destructive"
      });
      return;
    }

    try {
      await window.db.createSite(site);
      setSites(prev => [...prev, site]);
      toast({
        title: "Site Added",
        description: `${site.name} has been added successfully`
      });
    } catch (error) {
      logger.error('Failed to add site', error);
      toast({
        title: "Error",
        description: "Failed to add site",
        variant: "destructive"
      });
    }
  };

  const handleUpdateSite = async (site: Site) => {
    if (!window.db) {
      toast({
        title: "Database Not Available",
        description: "This app needs to run in Electron mode",
        variant: "destructive"
      });
      return;
    }

    try {
      await window.db.updateSite(site.id, {
        ...site,
        updated_at: new Date().toISOString()
      });
      setSites(prev => prev.map(s => s.id === site.id ? site : s));
      toast({
        title: "Site Updated",
        description: `${site.name} has been updated successfully`
      });
    } catch (error) {
      logger.error('Failed to update site', error);
      toast({
        title: "Error",
        description: "Failed to update site",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSite = async (siteId: string) => {
    if (!window.db) {
      toast({
        title: "Database Not Available",
        description: "This app needs to run in Electron mode",
        variant: "destructive"
      });
      return;
    }

    try {
      await window.db.deleteSite(siteId);
      setSites(prev => prev.filter(s => s.id !== siteId));
      toast({
        title: "Site Deleted",
        description: "Site has been deleted successfully"
      });
    } catch (error) {
      logger.error('Failed to delete site', error);
      toast({
        title: "Error",
        description: "Failed to delete site",
        variant: "destructive"
      });
    }
  };

  const handleCreateWaybill = async (waybillData: { siteId: string; items: WaybillItem[]; driverName: string; vehicle: string; purpose: string; expectedReturnDate?: Date; }) => {
    if (!window.db) {
      toast({
        title: "Database Not Available",
        description: "This app needs to run in Electron mode",
        variant: "destructive"
      });
      return;
    }

    try {
      const newWaybill: Omit<Waybill, 'id' | 'createdAt' | 'updatedAt'> = {
        type: 'waybill',
        siteId: waybillData.siteId,
        items: waybillData.items,
        driverName: waybillData.driverName,
        vehicle: waybillData.vehicle,
        purpose: waybillData.purpose,
        service: 'general',
        issueDate: new Date(),
        expectedReturnDate: waybillData.expectedReturnDate,
        status: 'outstanding'
      };

      const result = await window.db.createWaybill(newWaybill);
      const createdWaybill = {
        ...result.waybill,
        issueDate: new Date(result.waybill.issueDate),
        expectedReturnDate: result.waybill.expectedReturnDate ? new Date(result.waybill.expectedReturnDate) : undefined,
        sentToSiteDate: result.waybill.sentToSiteDate ? new Date(result.waybill.sentToSiteDate) : undefined,
        createdAt: new Date(result.waybill.createdAt),
        updatedAt: new Date(result.waybill.updatedAt)
      };
      
      setWaybills(prev => [...prev, createdWaybill]);
      
      // Reload assets to reflect updated quantities
      const loadedAssets = await window.db.getAssets();
      const processedAssets = loadedAssets.map((item: any) => {
        const asset = {
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          siteQuantities: item.site_quantities ? JSON.parse(item.site_quantities) : {}
        };
        if (!asset.siteId) {
          const reservedQuantity = asset.reservedQuantity || 0;
          const damagedCount = asset.damagedCount || 0;
          const missingCount = asset.missingCount || 0;
          const totalQuantity = asset.quantity;
          asset.availableQuantity = totalQuantity - reservedQuantity - damagedCount - missingCount;
        }
        return asset;
      });
      setAssets(processedAssets);
      
      toast({
        title: "Waybill Created",
        description: `Waybill ${createdWaybill.id} created successfully`
      });
    } catch (error) {
      logger.error('Failed to create waybill', error);
      toast({
        title: "Error",
        description: `Failed to create waybill: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard assets={assets} waybills={waybills} quickCheckouts={quickCheckouts} sites={sites} equipmentLogs={equipmentLogs} />;
      case "assets":
        return (
          <AssetTable
            assets={assets}
            onEdit={(asset) => setEditingAsset(asset)}
            onDelete={(asset) => setDeletingAsset(asset)}
            onUpdateAsset={handleSaveAsset}
            onViewAnalytics={(asset) => {
              setSelectedAssetForAnalytics(asset);
              setShowAnalyticsDialog(true);
            }}
          />
        );
      case "add-asset":
        return (
          <AddAssetForm
            onSave={handleSaveAsset}
            onCancel={() => setActiveTab("assets")}
            sites={sites}
            existingAssets={assets}
          />
        );
      case "waybills":
        return (
          <WaybillList
            waybills={waybills.filter(w => w.type === 'waybill')}
            sites={sites}
            onViewWaybill={(waybill) => setShowWaybillDocument(waybill)}
            onEditWaybill={(waybill) => setEditingWaybill(waybill)}
            onProcessReturn={(waybill) => setShowReturnForm(waybill)}
          />
        );
      case "returns":
        return (
          <ReturnsList
            waybills={waybills}
            sites={sites}
            onViewWaybill={(waybill) => setShowReturnWaybillDocument(waybill)}
            onEditWaybill={(waybill) => setEditingReturnWaybill(waybill)}
          />
        );
      case "sites":
        return (
          <SitesPage
            sites={sites}
            assets={assets}
            waybills={waybills}
            transactions={siteTransactions}
            employees={employees}
            vehicles={vehicles}
            equipmentLogs={equipmentLogs}
            consumableLogs={consumableLogs}
            siteInventory={siteInventory}
            getSiteInventory={getSiteInventory}
            companySettings={companySettings}
            onAddSite={handleAddSite}
            onUpdateSite={handleUpdateSite}
            onDeleteSite={handleDeleteSite}
            onUpdateAsset={handleSaveAsset}
            onCreateWaybill={handleCreateWaybill}
            onCreateReturnWaybill={handleCreateReturnWaybill}
            onProcessReturn={handleProcessReturn}
            onAddEquipmentLog={async (log: EquipmentLog) => {
              if (!isAuthenticated) {
                toast({
                  title: "Authentication Required",
                  description: "Please login to create equipment logs",
                  variant: "destructive"
                });
                return;
              }
              
              if (window.db) {
                try {
                  const logData = {
                    ...log,
                    equipment_id: log.equipmentId,
                    equipment_name: log.equipmentName,
                    site_id: log.siteId,
                    date: log.date.toISOString(),
                    downtime_entries: JSON.stringify(log.downtimeEntries),
                    maintenance_details: log.maintenanceDetails,
                    diesel_entered: log.dieselEntered,
                    supervisor_on_site: log.supervisorOnSite,
                    client_feedback: log.clientFeedback,
                    issues_on_site: log.issuesOnSite
                  };
                  await window.db.createEquipmentLog(logData);
                  const logs = await window.db.getEquipmentLogs();
                  setEquipmentLogs(logs.map((item: any) => ({
                    id: item.id,
                    equipmentId: item.equipment_id ? item.equipment_id.toString() : item.equipment_id,
                    equipmentName: item.equipment_name,
                    siteId: item.site_id ? item.site_id.toString() : item.site_id,
                    date: new Date(item.date),
                    active: item.active,
                    downtimeEntries: typeof item.downtime_entries === 'string' ? JSON.parse(item.downtime_entries) : item.downtime_entries || [],
                    maintenanceDetails: item.maintenance_details,
                    dieselEntered: item.diesel_entered,
                    supervisorOnSite: item.supervisor_on_site,
                    clientFeedback: item.client_feedback,
                    issuesOnSite: item.issues_on_site,
                    createdAt: new Date(item.created_at),
                    updatedAt: new Date(item.updated_at)
                  })));
                  toast({
                    title: "Success",
                    description: "Equipment log saved successfully",
                  });
                } catch (error) {
                  console.error('Failed to save equipment log:', error);
                  toast({
                    title: "Error",
                    description: "Failed to save equipment log to database.",
                    variant: "destructive"
                  });
                }
              } else {
                setEquipmentLogs(prev => [...prev, { ...log, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() }]);
              }
            }}
            onUpdateEquipmentLog={async (log: EquipmentLog) => {
              if (!isAuthenticated) {
                toast({
                  title: "Authentication Required",
                  description: "Please login to update equipment logs",
                  variant: "destructive"
                });
                return;
              }
              
              if (window.db) {
                try {
                  const logData = {
                    ...log,
                    equipment_id: log.equipmentId,
                    equipment_name: log.equipmentName,
                    site_id: log.siteId,
                    date: log.date.toISOString(),
                    downtime_entries: JSON.stringify(log.downtimeEntries),
                    maintenance_details: log.maintenanceDetails,
                    diesel_entered: log.dieselEntered,
                    supervisor_on_site: log.supervisorOnSite,
                    client_feedback: log.clientFeedback,
                    issues_on_site: log.issuesOnSite
                  };
                  await window.db.updateEquipmentLog(log.id, logData);
                  const logs = await window.db.getEquipmentLogs();
                  setEquipmentLogs(logs.map((item: any) => ({
                    id: item.id,
                    equipmentId: item.equipment_id ? item.equipment_id.toString() : item.equipment_id,
                    equipmentName: item.equipment_name,
                    siteId: item.site_id ? item.site_id.toString() : item.site_id,
                    date: new Date(item.date),
                    active: item.active,
                    downtimeEntries: typeof item.downtime_entries === 'string' ? JSON.parse(item.downtime_entries) : item.downtime_entries || [],
                    maintenanceDetails: item.maintenance_details,
                    dieselEntered: item.diesel_entered,
                    supervisorOnSite: item.supervisor_on_site,
                    clientFeedback: item.client_feedback,
                    issuesOnSite: item.issues_on_site,
                    createdAt: new Date(item.created_at),
                    updatedAt: new Date(item.updated_at)
                  })));
                  toast({
                    title: "Success",
                    description: "Equipment log updated successfully",
                  });
                } catch (error) {
                  console.error('Failed to update equipment log:', error);
                  toast({
                    title: "Error",
                    description: "Failed to update equipment log in database.",
                    variant: "destructive"
                  });
                }
              } else {
                setEquipmentLogs(prev => prev.map(l => l.id === log.id ? log : l));
              }
            }}
            onAddConsumableLog={async (log: Omit<ConsumableUsageLog, 'id' | 'createdAt' | 'updatedAt'>) => {
              if (!isAuthenticated) {
                toast({
                  title: "Authentication Required",
                  description: "Please login to create consumable logs",
                  variant: "destructive"
                });
                return;
              }
              
              if (window.db) {
                try {
                  const logData = {
                    ...log,
                    consumable_id: log.consumableId,
                    consumable_name: log.consumableName,
                    site_id: log.siteId,
                    date: log.date.toISOString(),
                    quantity_used: log.quantityUsed,
                    quantity_remaining: log.quantityRemaining,
                    unit: log.unit,
                    used_for: log.usedFor,
                    used_by: log.usedBy,
                    notes: log.notes
                  };
                  await window.db.createConsumableLog(logData);
                  const logs = await window.db.getConsumableLogs();
                  setConsumableLogs(logs);
                  
                  // Update asset siteQuantities to reflect consumption
                  const asset = assets.find(a => a.id === log.consumableId);
                  if (asset && asset.siteQuantities) {
                    const updatedSiteQuantities = {
                      ...asset.siteQuantities,
                      [log.siteId]: log.quantityRemaining
                    };
                    const updatedAsset = {
                      ...asset,
                      siteQuantities: updatedSiteQuantities,
                      updatedAt: new Date()
                    };
                    await window.db.updateAsset(asset.id, {
                      site_quantities: JSON.stringify(updatedSiteQuantities),
                      updated_at: new Date().toISOString()
                    });
                    setAssets(prev => prev.map(a => a.id === asset.id ? updatedAsset : a));
                  }
                } catch (error) {
                  console.error('Failed to save consumable log:', error);
                  toast({
                    title: "Error",
                    description: "Failed to save consumable log to database.",
                    variant: "destructive"
                  });
                }
              } else {
                setConsumableLogs(prev => [...prev, { ...log, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() }]);
              }
            }}
            onUpdateConsumableLog={async (log: ConsumableUsageLog) => {
              if (!isAuthenticated) {
                toast({
                  title: "Authentication Required",
                  description: "Please login to update consumable logs",
                  variant: "destructive"
                });
                return;
              }
              
              if (window.db) {
                try {
                  const logData = {
                    ...log,
                    consumable_id: log.consumableId,
                    consumable_name: log.consumableName,
                    site_id: log.siteId,
                    date: log.date.toISOString(),
                    quantity_used: log.quantityUsed,
                    quantity_remaining: log.quantityRemaining,
                    unit: log.unit,
                    used_for: log.usedFor,
                    used_by: log.usedBy,
                    notes: log.notes
                  };
                  await window.db.updateConsumableLog(log.id, logData);
                  const logs = await window.db.getConsumableLogs();
                  setConsumableLogs(logs);
                } catch (error) {
                  console.error('Failed to update consumable log:', error);
                  toast({
                    title: "Error",
                    description: "Failed to update consumable log in database.",
                    variant: "destructive"
                  });
                }
              } else {
                setConsumableLogs(prev => prev.map(l => l.id === log.id ? log : l));
              }
            }}
          />
        );
      case "settings":
        return (
          <CompanySettings 
            settings={companySettings} 
            onSave={setCompanySettings}
            employees={employees}
            onEmployeesChange={setEmployees}
            vehicles={vehicles}
            onVehiclesChange={setVehicles}
            assets={assets}
            onAssetsChange={setAssets}
            waybills={waybills}
            onWaybillsChange={setWaybills}
            quickCheckouts={quickCheckouts}
            onQuickCheckoutsChange={setQuickCheckouts}
            sites={sites}
            onSitesChange={setSites}
            siteTransactions={siteTransactions}
            onSiteTransactionsChange={setSiteTransactions}
            onResetAllData={handleResetAllData}
          />
        );
      default:
        return <Dashboard assets={assets} waybills={waybills} quickCheckouts={quickCheckouts} sites={sites} equipmentLogs={equipmentLogs} />;
    }
  };

  const isAssetInventoryTab = activeTab === "assets";

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      )}
      
      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border p-4 flex items-center justify-between">
          <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
            DCEL Asset Manager
          </h1>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar 
                activeTab={activeTab} 
                onTabChange={(tab) => {
                  setActiveTab(tab);
                  setMobileMenuOpen(false);
                }} 
              />
            </SheetContent>
          </Sheet>
        </div>
      )}
      
      <main className={cn(
        "flex-1 overflow-y-auto p-4 md:p-6",
        isMobile && "pt-20"
      )}>
        {isAssetInventoryTab && (
          <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:justify-between md:items-center mb-6">
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              {isAuthenticated && hasPermission('write_assets') && (
                <Button
                  variant="default"
                  onClick={() => setActiveTab("add-asset")}
                  className="w-full sm:w-auto bg-gradient-primary"
                  size={isMobile ? "lg" : "default"}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Asset
                </Button>
              )}
              {isAuthenticated && hasPermission('write_assets') && <BulkImportAssets onImport={handleImport} />}
      <InventoryReport assets={assets} companySettings={companySettings} />
      
            </div>

          </div>
        )}
        {processingReturnWaybill && (
          <ReturnProcessingDialog
            waybill={processingReturnWaybill}
            onClose={() => setProcessingReturnWaybill(null)}
            onSubmit={(returnData) => {
              setProcessingReturnWaybill(null);
              handleProcessReturn(returnData);
            }}
          />
        )}

        {renderContent()}

        {/* Edit Dialog */}
        <Dialog open={!!editingAsset} onOpenChange={open => !open && setEditingAsset(null)}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>Edit Asset</DialogHeader>
            {editingAsset && (
              <AddAssetForm
                asset={editingAsset}
                onSave={handleSaveAsset}
                onCancel={() => setEditingAsset(null)}
                sites={sites}
                existingAssets={assets}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deletingAsset} onOpenChange={open => !open && setDeletingAsset(null)}>
          <DialogContent>
            <DialogHeader>
              Are you sure you want to delete this asset?
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingAsset(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteAsset}
              >
                Yes, Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>



        {/* Waybill Document Modal */}
      {showWaybillDocument && (
        <WaybillDocument 
          waybill={showWaybillDocument} 
          sites={sites}
          companySettings={companySettings}
          onClose={() => setShowWaybillDocument(null)} 
        />
      )}

        {/* Return Form Modal */}
        {showReturnForm && (
          <ReturnForm 
            waybill={showReturnForm} 
            onSubmit={handleProcessReturn}
            onClose={() => setShowReturnForm(null)} 
          />
        )}

        {/* Return Waybill Document Modal */}
      {showReturnWaybillDocument && (
        <ReturnWaybillDocument 
          waybill={showReturnWaybillDocument} 
          sites={sites}
          companySettings={companySettings}
          onClose={() => setShowReturnWaybillDocument(null)} 
        />
      )}

        {/* Edit Waybill Dialog */}
        <Dialog open={!!editingWaybill} onOpenChange={open => !open && setEditingWaybill(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Waybill {editingWaybill?.id}</DialogTitle>
            </DialogHeader>
            {editingWaybill && (
              <EditWaybillForm
                waybill={editingWaybill}
                assets={assets}
                sites={sites}
                employees={employees}
                vehicles={vehicles}
                onUpdate={async (updatedWaybill) => {
                  if (!window.db) return;
                  
                  try {
                    const result = await window.db.updateWaybillWithTransaction(
                      updatedWaybill.id as string,
                      updatedWaybill
                    );
                    
                    if (!result.success) {
                      throw new Error(result.error || 'Failed to update waybill');
                    }
                    
                    // Reload assets to reflect reserved quantity changes
                    const loadedAssets = await window.db.getAssets();
                    const processedAssets = loadedAssets.map((item: any) => {
                      const asset = {
                        ...item,
                        siteQuantities: typeof item.siteQuantities === 'string' ? JSON.parse(item.siteQuantities || '{}') : (item.siteQuantities || {}),
                        purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : undefined,
                        createdAt: new Date(item.createdAt),
                        updatedAt: new Date(item.updatedAt)
                      };
                      return asset;
                    });
                    setAssets(processedAssets);

                    // Reload waybills to reflect changes
                    const loadedWaybills = await window.db.getWaybills();
                    setWaybills(loadedWaybills.map((item: any) => ({
                      ...item,
                      issueDate: new Date(item.issueDate),
                      expectedReturnDate: item.expectedReturnDate ? new Date(item.expectedReturnDate) : undefined,
                      sentToSiteDate: item.sentToSiteDate ? new Date(item.sentToSiteDate) : undefined,
                      createdAt: new Date(item.createdAt),
                      updatedAt: new Date(item.updatedAt)
                    })));
                    
                    setEditingWaybill(null);
                    toast({
                      title: "Waybill Updated",
                      description: `Waybill ${updatedWaybill.id} updated successfully. Reserved quantities adjusted.`
                    });
                  } catch (error) {
                    console.error('Failed to update waybill:', error);
                    toast({
                      title: "Error",
                      description: `Failed to update waybill: ${error instanceof Error ? error.message : 'Unknown error'}`,
                      variant: "destructive"
                    });
                  }
                }}
                onCancel={() => setEditingWaybill(null)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Return Waybill Dialog */}
        <Dialog open={!!editingReturnWaybill} onOpenChange={open => !open && setEditingReturnWaybill(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Return Waybill</DialogTitle>
            </DialogHeader>
            {editingReturnWaybill ? (
              <ReturnWaybillForm
                site={sites.find(s => s.id === editingReturnWaybill.siteId) || { id: editingReturnWaybill.siteId, name: 'Unknown Site', location: '', description: '', contactPerson: '', phone: '', status: 'active', createdAt: new Date(), updatedAt: new Date() } as Site}
                sites={sites}
                assets={assets}
                employees={employees}
                vehicles={vehicles}
                siteInventory={getSiteInventory(editingReturnWaybill.siteId)}
                initialWaybill={editingReturnWaybill}
                isEditMode={true}
                onCreateReturnWaybill={handleCreateReturnWaybill}
                onUpdateReturnWaybill={handleUpdateReturnWaybill}
                onCancel={() => setEditingReturnWaybill(null)}
              />
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Asset Analytics Dialog */}
        <AssetAnalyticsDialog
          asset={selectedAssetForAnalytics}
          open={showAnalyticsDialog}
          onOpenChange={setShowAnalyticsDialog}
        />
      </main>
    </div>
  );
};

export default Index;
