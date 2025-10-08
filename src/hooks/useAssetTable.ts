import { useState, useMemo } from "react";
import { Item as Asset } from "@/services/api";

type SortField = 'name' | 'total_stock' | 'reserved' | 'available_stock' | 'location' | 'stockStatus';
type SortDirection = 'asc' | 'desc';

export const useAssetTable = (assets: Asset[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<Asset>>({});

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
  }, [assets, searchTerm, filterCategory, filterType, filterStatus, sortField, sortDirection]);

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
      setEditingId(null);
      setEditingData({});
      return updatedAsset;
    }
    return null;
  };

  const getStockBadge = (asset: Asset) => {
    const availableStock = asset.total_stock - asset.reserved;
    const low = asset.low_stock_level ?? 10;
    const critical = asset.critical_stock_level ?? 5;

    if (availableStock <= 0) {
      return { variant: 'destructive' as const, text: 'Out of Stock' };
    } else if (availableStock <= critical) {
      return { variant: 'destructive' as const, text: 'Critical Stock', className: 'bg-red-500 text-white' };
    } else if (availableStock <= low) {
      return { variant: 'secondary' as const, text: 'Low Stock', className: 'bg-gradient-warning text-warning-foreground' };
    } else {
      return { variant: 'secondary' as const, text: 'In Stock', className: 'bg-gradient-success' };
    }
  };

  const getStatusBadge = (status: Asset['status']) => {
    const statusColors = {
      'active': 'bg-gradient-success',
      'damaged': 'bg-gradient-warning text-warning-foreground',
      'missing': 'destructive',
      'maintenance': 'secondary'
    };

    return {
      className: statusColors[status || 'active'],
      text: (status || 'active').toUpperCase()
    };
  };

  return {
    // State
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    sortField,
    sortDirection,
    editingId,
    editingData,
    setEditingData,

    // Computed
    filteredAndSortedAssets,

    // Actions
    handleSort,
    startEditing,
    cancelEditing,
    saveEditing,
    getStockBadge,
    getStatusBadge,
  };
};
