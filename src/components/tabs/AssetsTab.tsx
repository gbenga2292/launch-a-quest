import { AssetTable } from "@/components/assets/AssetTable";
import { AssetInventoryHeader } from "@/components/assets/AssetInventoryHeader";
import { Asset, Waybill, QuickCheckout, SiteTransaction, Site } from "@/types/asset";

interface AssetsTabProps {
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  isAuthenticated: boolean;
  toast: any;
  handleEditAsset: (asset: Asset) => void;
  handleDeleteAsset: (asset: Asset) => void;
  waybills: Waybill[];
  quickCheckouts: QuickCheckout[];
  siteTransactions: SiteTransaction[];
  sites: Site[];
  companySettings?: any;
  handleImport?: (assets: any[]) => Promise<void>;
  setEditingAsset?: (asset: any) => void;
}

export const AssetsTab = ({
  assets,
  setAssets,
  isAuthenticated,
  toast,
  handleEditAsset,
  handleDeleteAsset,
  waybills,
  quickCheckouts,
  siteTransactions,
  sites,
  companySettings = {},
  handleImport = async () => {},
  setEditingAsset = () => {}
}: AssetsTabProps) => {
  const handleUpdateAsset = (asset: Asset) => {
    setAssets(prev => prev.map(a => a.id === asset.id ? asset : a));
  };

  return (
    <div className="space-y-6">
      <AssetInventoryHeader
        assets={assets}
        companySettings={companySettings}
        handleImport={handleImport}
        setEditingAsset={setEditingAsset}
      />
      <AssetTable
        assets={assets}
        onEdit={handleEditAsset}
        onDelete={handleDeleteAsset}
        onUpdateAsset={handleUpdateAsset}
        waybills={waybills}
        quickCheckouts={quickCheckouts}
        siteTransactions={siteTransactions}
        sites={sites}
      />
    </div>
  );
};
