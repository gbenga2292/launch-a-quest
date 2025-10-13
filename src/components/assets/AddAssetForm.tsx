import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Item as Asset, Site } from "@/services/api";
import { Package, Save, X } from "lucide-react";

interface AddAssetFormProps {
  onAddAsset?: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'created_at' | 'updated_at' | 'reserved'>) => void;
  asset?: Asset;
  onSave?: (asset: Asset) => void;
  onCancel?: () => void;
  onSuccess?: () => void;
  sites?: Site[];
}

export const AddAssetForm = ({ onAddAsset, asset, onSave, onCancel, onSuccess, sites }: AddAssetFormProps) => {
  const fixedLocations = ["Store", "OfficeStorage", "Warehouse"];

  const [formData, setFormData] = useState({
    name: asset?.name || '',
    description: asset?.description || '',
    total_stock: asset?.total_stock || asset?.quantity || 0,
    unit: asset?.unit || asset?.unitOfMeasurement || '',
    category: (asset?.category || 'Dewatering') as 'Dewatering' | 'Waterproofing',
    type: (asset?.type || 'equipment') as 'consumable' | 'non-consumable' | 'tools' | 'equipment',
    location: asset?.location || '',
    lowStockLevel: asset?.lowStockLevel || asset?.low_stock_level || 0,
    criticalStockLevel: asset?.criticalStockLevel || asset?.critical_stock_level || 0
  });

  const [customLocation, setCustomLocation] = useState(asset?.location && !fixedLocations.includes(asset.location) ? asset.location : '');
  const [selectValue, setSelectValue] = useState(
    asset?.location === '' ? undefined :
    fixedLocations.includes(asset?.location || '') ? asset?.location : "custom"
  );
  const [validationErrors, setValidationErrors] = useState<{ lowStockLevel?: string; criticalStockLevel?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.unit) {
      return;
    }

    // Validation: Low Stock Level must be lower than Critical Stock Level
    if (formData.lowStockLevel >= formData.criticalStockLevel) {
      alert('Low Stock Level must be lower than Critical Stock Level');
      return;
    }

    if (asset && onSave) {
      onSave({
        ...asset,
        ...formData,
        updated_at: new Date().toISOString()
      } as Asset);
    } else if (onAddAsset) {
      await (onAddAsset as any)({
        ...formData,
        service: '',
        status: 'active',
        condition: 'good'
      });
      setFormData({
        name: '',
        description: '',
        total_stock: 0,
        unit: '',
        category: 'Dewatering',
        type: 'equipment',
        location: '',
        lowStockLevel: 0,
        criticalStockLevel: 0
      });
      setSelectValue(undefined);
      setCustomLocation('');
      onSuccess?.();
    }
  };

  const isEditing = !!asset;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
          <Package className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          {isEditing ? 'Edit Asset' : 'Add New Asset'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isEditing ? 'Update asset information' : 'Add a new item to your inventory'}
        </p>
      </div>

      <Card className="border-0 shadow-medium max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Asset Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Asset Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter asset name"
                  className="border-0 bg-muted/50 focus:bg-background transition-all duration-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit of Measurement *</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  placeholder="e.g. pcs, kg, meters"
                  className="border-0 bg-muted/50 focus:bg-background transition-all duration-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter asset description"
                className="border-0 bg-muted/50 focus:bg-background transition-all duration-300"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="total_stock">Total Stock</Label>
                <Input
                  id="total_stock"
                  type="number"
                  min="0"
                  value={formData.total_stock}
                  onChange={(e) => setFormData({...formData, total_stock: parseInt(e.target.value) || 0})}
                  className="border-0 bg-muted/50 focus:bg-background transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lowStockLevel">Low Stock Level</Label>
                <Input
                  id="lowStockLevel"
                  type="number"
                  min="0"
                  value={formData.lowStockLevel}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setFormData({...formData, lowStockLevel: value});
                    if (value >= formData.criticalStockLevel) {
                      setValidationErrors(prev => ({ ...prev, lowStockLevel: 'Low Stock Level must be lower than Critical Stock Level' }));
                    } else {
                      setValidationErrors(prev => ({ ...prev, lowStockLevel: undefined }));
                    }
                  }}
                  className="border-0 bg-muted/50 focus:bg-background transition-all duration-300"
                />
                {validationErrors.lowStockLevel && (
                  <p className="text-sm text-red-500">{validationErrors.lowStockLevel}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="criticalStockLevel">Critical Stock Level</Label>
                <Input
                  id="criticalStockLevel"
                  type="number"
                  min="0"
                  value={formData.criticalStockLevel}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setFormData({...formData, criticalStockLevel: value});
                    if (value <= formData.lowStockLevel) {
                      setValidationErrors(prev => ({ ...prev, criticalStockLevel: 'Critical Stock Level must be higher than Low Stock Level' }));
                    } else {
                      setValidationErrors(prev => ({ ...prev, criticalStockLevel: undefined }));
                    }
                  }}
                  className="border-0 bg-muted/50 focus:bg-background transition-all duration-300"
                />
                {validationErrors.criticalStockLevel && (
                  <p className="text-sm text-red-500">{validationErrors.criticalStockLevel}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value: 'Dewatering' | 'Waterproofing') => 
                    setFormData({...formData, category: value})
                  }
                >
                  <SelectTrigger className="border-0 bg-muted/50 focus:bg-background transition-all duration-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dewatering">Dewatering</SelectItem>
                    <SelectItem value="Waterproofing">Waterproofing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: 'consumable' | 'non-consumable' | 'tools' | 'equipment') => 
                    setFormData({...formData, type: value})
                  }
                >
                  <SelectTrigger className="border-0 bg-muted/50 focus:bg-background transition-all duration-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                    <SelectItem value="consumable">Consumable</SelectItem>
                    <SelectItem value="non-consumable">Non-Consumable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select
                value={selectValue}
                onValueChange={(value) => {
                  setSelectValue(value);
                  if (value === "custom") {
                    setFormData({...formData, location: customLocation});
                  } else {
                    setFormData({...formData, location: value});
                  }
                }}
              >
                <SelectTrigger className="border-0 bg-muted/50 focus:bg-background transition-all duration-300">
                  <SelectValue placeholder="Select a location or enter custom location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Store">Store</SelectItem>
                  <SelectItem value="OfficeStorage">OfficeStorage</SelectItem>
                  <SelectItem value="Warehouse">Warehouse</SelectItem>
                  <SelectItem value="custom">Custom Location</SelectItem>
                </SelectContent>
              </Select>
              {selectValue === "custom" && (
                <Input
                  id="custom-location"
                  value={customLocation}
                  onChange={(e) => {
                    setCustomLocation(e.target.value);
                    setFormData({...formData, location: e.target.value});
                  }}
                  placeholder="Enter custom location"
                  className="border-0 bg-muted/50 focus:bg-background transition-all duration-300 mt-2"
                />
              )}
            </div>

            <div className="flex gap-3 pt-4">
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel} 
                  className="flex-1 hover:bg-muted transition-all duration-300"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-medium"
              >
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Asset' : 'Add Asset'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};