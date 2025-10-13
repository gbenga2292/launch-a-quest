import { useState } from "react";
import { ExcelImportDialog } from "@/components/assets/ExcelImportDialog";
import { InventoryReport } from "@/components/assets/InventoryReport";
import { Button } from "@/components/ui/button";
import { ExcelAssetData } from "@/utils/excelParser";
import { useAuth } from "@/contexts/AuthContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AssetInventoryHeaderProps {
  assets: any[];
  companySettings: any;
  handleImport: (assets: ExcelAssetData[]) => Promise<void>;
  setEditingAsset: (asset: any) => void;
}

export const AssetInventoryHeader = ({
  assets,
  companySettings,
  handleImport,
  setEditingAsset,
}: AssetInventoryHeaderProps) => {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const { canImportAssets, canEditAssets, isGuest } = useAuth();

  const handleImportClick = () => {
    if (!canImportAssets) return;
    setImportDialogOpen(true);
  };

  const handleImportClose = () => {
    setImportDialogOpen(false);
  };

  const handleImportConfirm = async (excelAssets: ExcelAssetData[]) => {
    await handleImport(excelAssets);
    setImportDialogOpen(false);
  };

  const handleAddAsset = () => {
    if (!canEditAssets) return;
    setEditingAsset({});
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:justify-between md:items-center mb-6">
        <div className="flex gap-3 md:gap-4 w-full">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex-1">
                <Button
                  variant="outline"
                  className={`gap-2 w-full ${!canImportAssets ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleImportClick}
                  disabled={!canImportAssets}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Import from Excel
                </Button>
              </div>
            </TooltipTrigger>
            {!canImportAssets && (
              <TooltipContent>
                <p>Login required to import assets</p>
              </TooltipContent>
            )}
          </Tooltip>
          <div className="flex-1">
            <InventoryReport assets={assets} companySettings={companySettings} />
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex-1">
                <Button
                  onClick={handleAddAsset}
                  className={`bg-gradient-primary text-white hover:bg-gradient-primary/90 w-full ${!canEditAssets ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!canEditAssets}
                >
                  Add Asset
                </Button>
              </div>
            </TooltipTrigger>
            {!canEditAssets && (
              <TooltipContent>
                <p>Login required to add assets</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>

      <ExcelImportDialog
        open={importDialogOpen}
        onClose={handleImportClose}
        onImport={handleImportConfirm}
      />
    </TooltipProvider>
  );
};
