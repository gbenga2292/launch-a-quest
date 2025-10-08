import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Site, Asset, Waybill, WaybillItem, Employee, CompanySettings, SiteTransaction, ReturnItem } from "@/types/asset";
import { MapPin, Plus, Edit, Trash2, MoreVertical, FileText, Package, Activity, Eye, RefreshCw } from "lucide-react";
import { WaybillDocument } from "../waybills/WaybillDocument";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import SiteForm from "./SiteForm";
import { ReturnWaybillForm } from "../waybills/ReturnWaybillForm";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SiteInventoryItem } from "@/hooks/useSiteInventory";

interface SitesPageProps {
  sites: Site[];
  assets: Asset[];
  waybills: Waybill[];
  employees: Employee[];
  vehicles: string[];
  transactions: SiteTransaction[];
  siteInventory: SiteInventoryItem[];
  getSiteInventory: (siteId: string) => SiteInventoryItem[];
  companySettings?: CompanySettings;
  onAddSite: (site: Site) => void;
  onUpdateSite: (site: Site) => void;
  onDeleteSite: (siteId: string) => void;
  onAddAsset: (assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateAsset: (asset: Asset) => void;
  onCreateWaybill: (waybillData: { siteId: string; items: WaybillItem[]; driverName: string; vehicle: string; purpose: string; expectedReturnDate?: Date; }) => void;
  onCreateReturnWaybill: (waybillData: {
    siteId: string;
    returnToSiteId?: string;
    items: WaybillItem[];
    driverName: string;
    vehicle: string;
    purpose: string;
    expectedReturnDate?: Date;
  }) => void;
  onProcessReturn: (returnData: { waybillId: string; items: ReturnItem[] }) => void;
}

export const SitesPage = ({ sites, assets, waybills, employees, vehicles, transactions, siteInventory, getSiteInventory, companySettings, onAddSite, onUpdateSite, onDeleteSite, onAddAsset, onUpdateAsset, onCreateWaybill, onCreateReturnWaybill, onProcessReturn }: SitesPageProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [showReturnWaybillForm, setShowReturnWaybillForm] = useState(false);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [previewAssets, setPreviewAssets] = useState<Asset[]>([]);
  const [showReportTypeDialog, setShowReportTypeDialog] = useState(false);
  const [selectedSiteForReport, setSelectedSiteForReport] = useState<Site | null>(null);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [transactionsView, setTransactionsView] = useState<'table' | 'tree' | 'flow'>('table');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<Site | null>(null);
  const [showDeleteAssetDialog, setShowDeleteAssetDialog] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [selectedWaybill, setSelectedWaybill] = useState<Waybill | null>(null);
  const [showWaybillView, setShowWaybillView] = useState(false);
  const { canEditSites, isGuest } = useAuth();
  const { toast } = useToast();

  const handleAdd = () => {
    if (!canEditSites) {
      toast({
        title: "Login Required",
        description: "Please log in to add a site.",
        variant: "destructive",
      });
      return;
    }
    setEditingSite(null);
    setShowForm(true);
  };

  const handleEdit = (site: Site) => {
    if (!canEditSites) {
      toast({
        title: "Login Required",
        description: "Please log in to edit site.",
        variant: "destructive",
      });
      return;
    }
    setEditingSite(site);
    setShowForm(true);
  };

  const handleDelete = (site: Site) => {
    if (!canEditSites) {
      toast({
        title: "Login Required",
        description: "Please log in to delete site.",
        variant: "destructive",
      });
      return;
    }
    setSiteToDelete(site);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (siteToDelete) {
      onDeleteSite(siteToDelete.id);
      setShowDeleteDialog(false);
      setSiteToDelete(null);
    }
  };

  const handleSave = (site: Site) => {
    if (editingSite) {
      onUpdateSite(site);
    } else {
      onAddSite(site);
    }
    setShowForm(false);
  };

  const handleDeleteAsset = (asset: Asset) => {
    if (!selectedSite) return;

    // Check if there's any outstanding waybill for this site that includes this asset
    const hasOutstandingWaybill = waybills.some(waybill =>
      waybill.siteId === selectedSite.id &&
      waybill.status !== 'return_completed' &&
      waybill.items.some(item => item.assetName === asset.name)
    );

    if (hasOutstandingWaybill) {
      toast({
        title: "Cannot Remove Asset",
        description: "This asset is part of an outstanding waybill. Use the return process to remove it.",
        variant: "destructive",
      });
      return;
    }

    // Show confirmation dialog
    setAssetToDelete(asset);
    setShowDeleteAssetDialog(true);
  };

  const confirmDeleteAsset = () => {
    if (assetToDelete) {
      const updatedAsset = { ...assetToDelete, siteId: undefined, quantity: 0, updatedAt: new Date() };
      onUpdateAsset(updatedAsset);
      setShowDeleteAssetDialog(false);
      setAssetToDelete(null);
      toast({
        title: "Asset Removed",
        description: `${assetToDelete.name} has been removed from ${selectedSite?.name}.`,
      });
    }
  };

  const handleShowItems = (site: Site) => {
    setSelectedSite(site);
    setShowItemsModal(true);
  };

  const handleCreateReturnWaybill = (site: Site) => {
    setSelectedSite(site);
    setShowReturnWaybillForm(true);
  };

  const handleGenerateReport = (site: Site) => {
    setSelectedSiteForReport(site);
    setShowReportTypeDialog(true);
  };

  const handleGenerateMaterialsReport = () => {
    if (selectedSiteForReport) {
      const siteAssets = assets.filter(asset => asset.siteId === selectedSiteForReport.id);
      setPreviewAssets(siteAssets);
      setShowReportPreview(true);
      setShowReportTypeDialog(false);
    }
  };

  const handleGenerateTransactionsReport = () => {
    if (selectedSiteForReport) {
      // Generate PDF directly for transactions
      const siteTransactions = transactions
        .filter(t => t.siteId === selectedSiteForReport.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Site Transactions Report", 20, 20);
      doc.setFontSize(14);
      doc.text(`${selectedSiteForReport.name} - Transaction History`, 20, 30);

      const tableData = siteTransactions.map(transaction => [
        new Date(transaction.createdAt).toLocaleString(),
        transaction.type.toUpperCase(),
        transaction.assetName,
        transaction.quantity.toString(),
        transaction.referenceId,
        transaction.notes || ''
      ]);

      autoTable(doc, {
        startY: 40,
        head: [['Date', 'Type', 'Asset', 'Quantity', 'Reference', 'Notes']],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [22, 160, 133] }
      });

      doc.save(`${selectedSiteForReport.name}_transactions_report.pdf`);
      setShowReportTypeDialog(false);
    }
  };

  const handleShowTransactions = (site: Site) => {
    setSelectedSite(site);
    setShowTransactionsModal(true);
  };

  const handleViewWaybill = (waybill: Waybill) => {
    setSelectedWaybill(waybill);
    setShowWaybillView(true);
  };

  const generateReport = (assetsToReport: Asset[], title: string) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Site Materials Report", 20, 20);
    doc.setFontSize(14);
    doc.text(title, 20, 30);

    const tableData = assetsToReport.map(asset => [
      asset.name,
      asset.quantity.toString()
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Name', 'Quantity']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] }
    });

    doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
  };

  const generateWaybillPDF = (waybill: Waybill) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`${waybill.type === 'return' ? 'Return Waybill' : 'Waybill'} - ${waybill.id}`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Driver: ${waybill.driverName}`, 20, 30);
    doc.text(`Vehicle: ${waybill.vehicle}`, 20, 35);
    doc.text(`Site: ${sites.find(s => s.id === waybill.siteId)?.name || 'Unknown Site'}`, 20, 40);
    doc.text(`Issue Date: ${waybill.issueDate.toLocaleDateString()}`, 20, 45);
    doc.text(`Status: ${waybill.status.replace('_', ' ').toUpperCase()}`, 20, 50);
    if (waybill.purpose) {
      doc.text(`Purpose: ${waybill.purpose}`, 20, 55);
    }
    if (waybill.expectedReturnDate) {
      doc.text(`Expected Return: ${waybill.expectedReturnDate.toLocaleDateString()}`, 20, 60);
    }

    const tableData = waybill.items.map(item => [
      item.assetName,
      item.quantity.toString()
    ]);

    autoTable(doc, {
      startY: 70,
      head: [['Asset Name', 'Quantity']],
      body: tableData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] }
    });

    doc.save(`${waybill.type === 'return' ? 'return_' : ''}waybill_${waybill.id}.pdf`);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Site Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage project sites and locations
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  onClick={handleAdd}
                  className={`${!canEditSites ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!canEditSites}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Site
                </Button>
              </div>
            </TooltipTrigger>
            {!canEditSites && (
              <TooltipContent>
                <p>Login required to add sites</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Render modal dialogs conditionally */}
        {showItemsModal && selectedSite && (
          <Dialog open={showItemsModal} onOpenChange={setShowItemsModal}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {selectedSite.name} - Materials and Waybills
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Materials List */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">Materials at Site</h3>
                  </div>
                  {getSiteInventory(selectedSite.id).length === 0 ? (
                    <p className="text-muted-foreground">No materials at this site.</p>
                  ) : (
                    <div className="space-y-2">
                      {getSiteInventory(selectedSite.id).map((item) => {
                        return (
                          <div key={item.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                            <div>
                              <p className="font-medium">{item.itemName}</p>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity} {item.unit || ''}
                                {item.category && ` • ${item.category}`}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Last updated: {new Date(item.lastUpdated).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">At Site</Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Waybills List */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Waybills for Site</h3>
                  {waybills.filter(waybill => waybill.siteId === selectedSite.id).length === 0 ? (
                    <p className="text-muted-foreground">No waybills for this site.</p>
                  ) : (
                    <div className="space-y-2">
                      {waybills.filter(waybill => waybill.siteId === selectedSite.id).map((waybill) => {
                        let badgeVariant: "default" | "secondary" | "outline" = 'outline';
                        if (waybill.status === 'outstanding') {
                          badgeVariant = 'default';
                        } else if (waybill.status === 'sent_to_site' || waybill.status === 'partial_returned') {
                          badgeVariant = 'secondary';
                        } else if (waybill.status === 'return_completed') {
                          badgeVariant = 'default';
                        }
                        return (
                          <div key={waybill.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                            <div>
                              <p className="font-medium">{waybill.id}</p>
                              <p className="text-sm text-muted-foreground">
                                {waybill.driverName} • {waybill.items.length} items • {waybill.status}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={badgeVariant}>
                                {waybill.status.replace('_', ' ')}
                              </Badge>
                              <Button
                                onClick={() => handleViewWaybill(waybill)}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button onClick={() => handleCreateReturnWaybill(selectedSite)} className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Create Return Waybill
                  </Button>
                  <Button
                    onClick={() => handleShowTransactions(selectedSite)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    View Transactions
                  </Button>
                  <Button
                    onClick={() => handleGenerateReport(selectedSite)}
                    variant="outline"
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Return Waybill Form */}
        {showReturnWaybillForm && selectedSite && (
          <Dialog open={showReturnWaybillForm} onOpenChange={setShowReturnWaybillForm}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <ReturnWaybillForm
                site={selectedSite}
                sites={sites}
                assets={assets}
                siteInventory={siteInventory}
                employees={employees}
                vehicles={vehicles}
                onCreateReturnWaybill={(waybillData) => {
                  onCreateReturnWaybill(waybillData);
                  setShowReturnWaybillForm(false);
                }}
                onCancel={() => setShowReturnWaybillForm(false)}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Report Type Selection Dialog */}
        {showReportTypeDialog && selectedSiteForReport && (
          <Dialog open={showReportTypeDialog} onOpenChange={setShowReportTypeDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Report for {selectedSiteForReport.name}</DialogTitle>
                <DialogDescription>
                  Choose the type of report to generate.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3 pt-4">
                <Button onClick={handleGenerateMaterialsReport} className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Materials on Site
                </Button>
                <Button onClick={handleGenerateTransactionsReport} variant="outline" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Site Transactions
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Report Preview Dialog */}
        {showReportPreview && selectedSiteForReport && (
          <Dialog open={showReportPreview} onOpenChange={setShowReportPreview}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedSiteForReport.name} - Materials Preview</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewAssets.map((asset, index) => (
                      <TableRow key={index}>
                        <TableCell>{asset.name}</TableCell>
                        <TableCell>{asset.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-end">
                  <Button onClick={() => generateReport(previewAssets, `${selectedSiteForReport.name} Materials Report`)}>
                    Download PDF
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Transactions Modal */}
        {showTransactionsModal && selectedSite && (
          <Dialog open={showTransactionsModal} onOpenChange={setShowTransactionsModal}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  <DialogTitle>{selectedSite.name} - Transaction History</DialogTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={transactionsView} onValueChange={(value) => setTransactionsView(value as 'table' | 'tree' | 'flow')}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="View" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="table">Table View</SelectItem>
                      <SelectItem value="tree">Tree View</SelectItem>
                      <SelectItem value="flow">Flow View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </DialogHeader>
              <div className="space-y-4">
                {transactionsView === 'tree' ? (
                  // Tree View - Group by referenceId (waybill) or date
                  <div className="space-y-4">
                    {(() => {
                      const siteTransactions = transactions
                        .filter((t) => t.siteId === selectedSite.id)
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                      // Group by referenceId (waybill ID)
                      const grouped = siteTransactions.reduce((acc, t) => {
                        const key = t.referenceId || 'Unassigned';
                        if (!acc[key]) acc[key] = [];
                        acc[key].push(t);
                        return acc;
                      }, {} as Record<string, SiteTransaction[]>);

                      return Object.entries(grouped).map(([ref, txns]) => (
                        <div key={ref} className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {ref === 'Unassigned' ? 'Miscellaneous Transactions' : `Waybill/Ref: ${ref}`}
                            <Badge variant="outline" className="ml-auto">
                              {txns.length} items
                            </Badge>
                          </h4>
                          <div className="space-y-2 ml-4">
                            {txns.map((transaction) => (
                              <div key={transaction.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{transaction.assetName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(transaction.createdAt).toLocaleDateString()} • {transaction.type.toUpperCase()}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="font-semibold">{transaction.quantity}</span>
                                  <span className="text-xs text-muted-foreground block">{transaction.notes || 'No notes'}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                    {transactions.filter((t) => t.siteId === selectedSite.id).length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No transactions for this site yet.</p>
                    )}
                  </div>
                ) : transactionsView === 'flow' ? (
                  // Flow View - Group by inflows (in) and outflows (out)
                  <div className="space-y-6">
                    {(() => {
                      const siteTransactions = transactions
                        .filter((t) => t.siteId === selectedSite.id)
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                      const inflows = siteTransactions.filter(t => t.type === 'in');
                      const outflows = siteTransactions.filter(t => t.type === 'out');

                      return (
                        <>
                          <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                              <Activity className="h-4 w-4 text-green-500" />
                              Inflows (From Office/Other Sites)
                            </h3>
                            {inflows.length === 0 ? (
                              <p className="text-muted-foreground">No inflows recorded.</p>
                            ) : (
                              <div className="space-y-2">
                                {inflows.map((transaction) => (
                                  <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg">
                                    <div className="flex flex-col">
                                      <span className="font-medium">{transaction.assetName}</span>
                                      <span className="text-sm text-muted-foreground">
                                        From: {transaction.referenceId || 'Office/Direct'} • {transaction.type.toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-semibold text-green-600">+{transaction.quantity}</span>
                                      <span className="text-xs text-muted-foreground block">
                                        {new Date(transaction.createdAt).toLocaleString()}
                                      </span>
                                      {transaction.notes && <span className="text-xs block">{transaction.notes}</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                              <Activity className="h-4 w-4 text-red-500" />
                              Outflows (To Sites/Office)
                            </h3>
                            {outflows.length === 0 ? (
                              <p className="text-muted-foreground">No outflows recorded.</p>
                            ) : (
                              <div className="space-y-2">
                                {outflows.map((transaction) => (
                                  <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg">
                                    <div className="flex flex-col">
                                      <span className="font-medium">{transaction.assetName}</span>
                                      <span className="text-sm text-muted-foreground">
                                        To: {transaction.referenceId || 'Site/Office'} • {transaction.type.toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-semibold text-red-600">-{transaction.quantity}</span>
                                      <span className="text-xs text-muted-foreground block">
                                        {new Date(transaction.createdAt).toLocaleString()}
                                      </span>
                                      {transaction.notes && <span className="text-xs block">{transaction.notes}</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                    {transactions.filter((t) => t.siteId === selectedSite.id).length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No transactions for this site yet.</p>
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Asset</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions
                        .filter((t) => t.siteId === selectedSite.id)
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>{new Date(transaction.createdAt).toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge
                                variant={transaction.type === "in" ? "default" : "secondary"}
                              >
                                {transaction.type.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{transaction.assetName}</TableCell>
                            <TableCell>{transaction.quantity}</TableCell>
                            <TableCell>{transaction.referenceId}</TableCell>
                            <TableCell className="text-sm">{transaction.notes}</TableCell>
                          </TableRow>
                        ))}
                      {transactions.filter((t) => t.siteId === selectedSite.id).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                            No transactions for this site yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => {
            const siteAssets = assets.filter(asset => asset.siteId === site.id);
            const siteWaybills = waybills.filter(waybill => waybill.siteId === site.id);

            return (
              <Card key={site.id} className="border-0 shadow-soft">
                <CardHeader className="pb-3 flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <CardTitle className="text-lg">{site.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={site.status === "active" ? "default" : "secondary"}>
                      {site.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-1">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(site)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(site)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShowItems(site)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Show Items
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <strong>Location:</strong> {site.location}
                  </p>
                  {site.description && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Description:</strong> {site.description}
                    </p>
                  )}
                  {site.contactPerson && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Contact:</strong> {site.contactPerson}
                    </p>
                  )}
                  {site.phone && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Phone:</strong> {site.phone}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {sites.length === 0 && (
          <Card className="border-0 shadow-soft">
            <CardContent className="text-center py-8">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No sites added yet. Click "Add Site" to get started.</p>
            </CardContent>
          </Card>
        )}

        <SiteForm
          site={editingSite}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
          open={showForm}
        />

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Site</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{siteToDelete?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showDeleteAssetDialog} onOpenChange={setShowDeleteAssetDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Asset from Site</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove "{assetToDelete?.name}" from "{selectedSite?.name}"? This will set the asset quantity to 0 and remove it from this site.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteAsset}>Remove</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Waybill View Modal */}
        {showWaybillView && selectedWaybill && (
          <WaybillDocument
            waybill={selectedWaybill}
            sites={sites}
            companySettings={companySettings}
            onClose={() => setShowWaybillView(false)}
          />
        )}
      </div>
    </TooltipProvider>
  );
};
