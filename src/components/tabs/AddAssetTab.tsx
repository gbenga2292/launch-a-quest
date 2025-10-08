import { AddAssetForm } from "@/components/assets/AddAssetForm";
import { Asset } from "@/types/asset";

interface AddAssetTabProps {
  isAuthenticated: boolean;
  handleAddAsset: (assetData: Omit<Asset, "id" | "createdAt" | "updatedAt">) => void;
  sites: any[];
}

export const AddAssetTab = ({
  isAuthenticated,
  handleAddAsset,
  sites
}: AddAssetTabProps) => {
  return (
    <AddAssetForm
      onAddAsset={handleAddAsset}
      sites={sites}
    />
  );
};
