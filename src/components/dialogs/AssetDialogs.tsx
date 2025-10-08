import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AddAssetForm } from "@/components/assets/AddAssetForm";
import { Item as Asset, Site } from "@/services/api";

interface AssetDialogsProps {
  editingAsset: Asset | null;
  setEditingAsset: (asset: Asset | null) => void;
  deletingAsset: Asset | null;
  setDeletingAsset: (asset: Asset | null) => void;
  handleSaveAsset: (assetData: Asset) => void;
  handleAddAsset: (assetData: Omit<Asset, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  confirmDeleteAsset: (assetId: string) => Promise<void>;
  sites: Site[];
}

export const AssetDialogs = ({
  editingAsset,
  setEditingAsset,
  deletingAsset,
  setDeletingAsset,
  handleSaveAsset,
  handleAddAsset,
  confirmDeleteAsset,
  sites,
}: AssetDialogsProps) => {
  return (
    <>
      {/* Edit Asset Dialog */}
      <Dialog open={!!editingAsset} onOpenChange={open => !open && setEditingAsset(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>{editingAsset ? 'Edit Asset' : 'Add Asset'}</DialogHeader>
          {editingAsset !== null && (
            <AddAssetForm
              asset={editingAsset || undefined}
              onSave={editingAsset && editingAsset.id ? handleSaveAsset : undefined}
              onAddAsset={!editingAsset || !editingAsset.id ? handleAddAsset : undefined}
              onCancel={() => setEditingAsset(null)}
              onSuccess={() => setEditingAsset(null)}
              sites={sites}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Asset Confirmation Dialog */}
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
              onClick={() => confirmDeleteAsset(deletingAsset!.id)}
            >
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
