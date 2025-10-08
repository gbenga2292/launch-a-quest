import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Item as Asset, Waybill, QuickCheckout, SiteTransaction, Site } from "@/services/api";
import {
  Search,
  Filter,
  Edit,
  Trash2,
  MoreHorizontal,
  Package,
  ChevronUp,
  ChevronDown,
  Check,
  X,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AssetAnalyticsModal } from "./AssetAnalyticsModal";

interface AssetTableProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  onUpdateAsset: (asset: Asset) => void;
  waybills: Waybill[];
  quickCheckouts: QuickCheckout[];
  siteTransactions: SiteTransaction[];
  sites: Site[];
}

type SortField = 'name' | 'total_stock' | 'reserved' | 'available_stock' | 'location' | 'stockStatus';

type SortDirection = 'asc' | 'desc';

export const AssetTable = ({ assets, onEdit, onDelete, onUpdateAsset, waybills, quickCheckouts, siteTransactions, sites }: AssetTableProps) => {
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<Asset>>({});

  // New state for analytics modal
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);



  const getStockStatus = (asset: Asset): number => {
    const availableStock = asset.total_stock - asset.reserved;
    if (availableStock <= 0) return 0; // Out of Stock
    if (asset.low_stock_level && availableStock < asset.low_stock_level) return 1; // Low Stock
    return 2; // In Stock
  };

  const filteredAndSortedAssets = useMemo(() => {
    let filtered = assets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           asset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           asset.location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || asset.category === filterCategory;
      const matchesType = filterType === 'all' || asset.type === filterType;

      let matchesStatus = filterStatus === 'all';
      if (!matchesStatus) {
        if (['active', 'damaged', 'missing', 'maintenance'].includes(filterStatus)) {
          matchesStatus = (asset.status || 'active') === filterStatus;
        } else {
            const availableStock = asset.total_stock - asset.reserved;
            if (filterStatus === 'out-of-stock') {
                matchesStatus = availableStock <= 0;
            } else if (filterStatus === 'low-stock') {
                matchesStatus = availableStock > 0 && asset.low_stock_level != null && availableStock < asset.low_stock_level;
            } else if (filterStatus === 'in-stock') {
                matchesStatus = asset.low_stock_level != null && availableStock >= asset.low_stock_level;
            }
        }
      }
      
      return matchesSearch && matchesCategory && matchesType && matchesStatus;
    });

    // Sort the filtered assets
    filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortField === 'available_stock') {
            aValue = a.total_stock - a.reserved;
            bValue = b.total_stock - b.reserved;
        } else if (sortField === 'stockStatus') {
            aValue = getStockStatus(a);
            bValue = getStockStatus(b);
        } else {
            aValue = a[sortField as keyof Asset];
            bValue = b[sortField as keyof Asset];
        }

      // Handle undefined/null values
      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';

      // String comparison for text fields
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      // Numeric comparison
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return filtered;
  }, [assets, searchTerm, filterCategory, filterType, filterStatus, sortField, sortDirection, getStockStatus]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const startEditing = (asset: Asset) => {
    setEditingId(asset.id);
    setEditingData({ ...asset });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingData({});
  };

  const saveEditing = () => {
    if (editingId && editingData) {
      const updatedAsset = {
        ...editingData,
        id: editingId,
        updated_at: new Date().toISOString()
      } as Asset;
      onUpdateAsset(updatedAsset);
      setEditingId(null);
      setEditingData({});
    }
  };

  const getStatusBadge = (status: Asset['status']) => {
    const statusColors = {
      'active': 'bg-gradient-success',
      'damaged': 'bg-gradient-warning text-warning-foreground',
      'missing': 'destructive',
      'maintenance': 'secondary'
    };
    
    return (
      <Badge className={statusColors[status || 'active']}>
        {(status || 'active').toUpperCase()}
      </Badge>
    );
  };

  const getStockBadge = (asset: Asset) => {
    const availableStock = asset.total_stock - asset.reserved;
    const low = asset.low_stock_level ?? 10;
    const critical = asset.critical_stock_level ?? 5;

    if (availableStock <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (availableStock <= critical) {
      return <Badge className="bg-red-500 text-white">Critical Stock</Badge>;
    } else if (availableStock <= low) {
      return <Badge className="bg-gradient-warning text-warning-foreground">Low Stock</Badge>;
    } else {
      return <Badge className="bg-gradient-success">In Stock</Badge>;
    }
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
        )}
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Asset Inventory
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your equipment, tools, and consumables
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredAndSortedAssets.length} of {assets.length} assets
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border-0 shadow-soft rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search assets by name, description, location, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-0 bg-muted/50 focus:bg-background transition-all duration-300"
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <Select value={filterCategory} onValueChange={(value: any) => setFilterCategory(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Dewatering">Dewatering</SelectItem>
                <SelectItem value="Waterproofing">Waterproofing</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="tools">Tools</SelectItem>
                <SelectItem value="consumable">Consumable</SelectItem>
                <SelectItem value="non-consumable">Non-Consumable</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="damaged">Damaged</SelectItem>
                <SelectItem value="missing">Missing</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border-0 shadow-soft rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <SortableHeader field="name">Asset Name</SortableHeader>
                {!isMobile && <TableHead>Description</TableHead>}
                <SortableHeader field="total_stock">Total Stock</SortableHeader>
                <SortableHeader field="reserved">Reserved</SortableHeader>
                <SortableHeader field="available_stock">Available</SortableHeader>
                {!isMobile && <TableHead>Category</TableHead>}
                {!isMobile && <TableHead>Type</TableHead>}
                <SortableHeader field="location">Location</SortableHeader>
                <SortableHeader field="stockStatus">Stock Status</SortableHeader>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {filteredAndSortedAssets.map((asset) => (
              <TableRow key={asset.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium">
                  {editingId === asset.id ? (
                    <Input
                      value={editingData.name || ''}
                      onChange={(e) => setEditingData(prev => ({ ...prev, name: e.target.value }))}
                      className="h-8"
                    />
                  ) : (
                    asset.name
                  )}
                 </TableCell>
                 
                 {!isMobile && (
                   <TableCell>
                     {editingId === asset.id ? (
                       <Input
                         value={editingData.description || ''}
                         onChange={(e) => setEditingData(prev => ({ ...prev, description: e.target.value }))}
                         className="h-8"
                         placeholder="Description"
                       />
                     ) : (
                       <span className="text-muted-foreground">{asset.description || '-'}</span>
                     )}
                   </TableCell>
                 )}
                 
                 <TableCell>
                   {editingId === asset.id ? (
                     <Input
                       type="number"
                       value={editingData.total_stock || 0}
                       onChange={(e) => setEditingData(prev => ({ ...prev, total_stock: parseInt(e.target.value) || 0 }))}
                       className="h-8 w-16 md:w-20"
                       min="0"
                     />
                   ) : (
                     <span className="font-semibold text-primary">{asset.total_stock}</span>
                   )}
                 </TableCell>

                <TableCell>
                  <span className="font-semibold">{asset.reserved}</span>
                </TableCell>

                <TableCell>
                  <span className="font-semibold">{asset.total_stock - asset.reserved}</span>
                </TableCell>
                 
                 {!isMobile && (
                   <TableCell>
                     {editingId === asset.id ? (
                       <Select
                         value={editingData.category || asset.category}
                         onValueChange={(value: any) => setEditingData(prev => ({ ...prev, category: value }))}
                       >
                         <SelectTrigger className="h-8 w-32">
                           <SelectValue />
                         </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Dewatering">Dewatering</SelectItem>
                            <SelectItem value="Waterproofing">Waterproofing</SelectItem>
                          </SelectContent>
                       </Select>
                     ) : (
                       <Badge variant="outline">{asset.category}</Badge>
                     )}
                   </TableCell>
                 )}

                 {!isMobile && (
                   <TableCell>
                     {editingId === asset.id ? (
                       <Select
                         value={editingData.type || asset.type}
                         onValueChange={(value: any) => setEditingData(prev => ({ ...prev, type: value }))}
                       >
                         <SelectTrigger className="h-8 w-32">
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="equipment">Equipment</SelectItem>
                           <SelectItem value="tools">Tools</SelectItem>
                           <SelectItem value="consumable">Consumable</SelectItem>
                           <SelectItem value="non-consumable">Non-Consumable</SelectItem>
                         </SelectContent>
                       </Select>
                     ) : (
                       <Badge variant="secondary">{asset.type}</Badge>
                     )}
                   </TableCell>
                 )}

                <TableCell>
                  {editingId === asset.id ? (
                    <Input
                      value={editingData.location || ''}
                      onChange={(e) => setEditingData(prev => ({ ...prev, location: e.target.value }))}
                      className="h-8"
                      placeholder="Location"
                    />
                  ) : (
                    asset.location || '-'
                  )}
                </TableCell>

                <TableCell>{getStockBadge(asset)}</TableCell>
                
                <TableCell>
                  {editingId === asset.id ? (
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={saveEditing} className="h-8 w-8 p-0">
                        <Check className="h-4 w-4 text-success" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEditing} className="h-8 w-8 p-0">
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                    {/* Removed Edit Inline option as per user request */}
                    {/* <DropdownMenuItem onClick={() => {
                      if (!isAuthenticated) {
                        toast({
                          title: "Login Required",
                          description: "Please log in to edit assets.",
                          variant: "destructive",
                        });
                        return;
                      }
                      startEditing(asset);
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Inline
                    </DropdownMenuItem> */}
                        <DropdownMenuItem onClick={() => {
                          if (!isAuthenticated) {
                            toast({
                              title: "Login Required",
                              description: "Please log in to edit assets.",
                              variant: "destructive",
                            });
                            return;
                          }
                          onEdit(asset);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Form
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (!isAuthenticated) {
                              toast({
                                title: "Login Required",
                                description: "Please log in to delete assets.",
                                variant: "destructive",
                              });
                              return;
                            }
                            onDelete(asset);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (!isAuthenticated) {
                              toast({
                                title: "Login Required",
                                description: "Please log in to view analytics.",
                                variant: "destructive",
                              });
                              return;
                            }
                            setSelectedAsset(asset);
                            setAnalyticsOpen(true);
                          }}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Analytics
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
         </Table>
        </div>

        {/* Empty State */}
        {filteredAndSortedAssets.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No assets found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterCategory !== 'all' || filterType !== 'all' || filterStatus !== 'all'
                ? "Try adjusting your search or filters"
                : "Start by adding your first asset"}
            </p>
          </div>
        )}
      </div>

      {/* Analytics Modal */}
      <AssetAnalyticsModal
        asset={selectedAsset}
        waybills={waybills}
        quickCheckouts={quickCheckouts}
        siteTransactions={siteTransactions}
        sites={sites}
        open={analyticsOpen}
        onOpenChange={setAnalyticsOpen}
      />
    </div>
  );
};