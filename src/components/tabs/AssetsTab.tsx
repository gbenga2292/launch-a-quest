import { AssetTable } from "@/components/assets/AssetTable";
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
  sites
}: AssetsTabProps) => {
  const handleUpdateAsset = (asset: Asset) => {
    setAssets(prev => prev.map(a => a.id === asset.id ? asset : a));
  };

  return (
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
  );
};
