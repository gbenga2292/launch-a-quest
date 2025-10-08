import { useState } from "react";
import { WaybillList } from "@/components/waybills/WaybillList";
import { Waybill, Site, Asset, Employee } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateWaybillTab } from "./CreateWaybillTab";

interface WaybillsTabProps {
  waybills: Waybill[];
  sites: Site[];
  assets: Asset[];
  employees: Employee[];
  vehicles: string[];
  handleCreateWaybill: (waybillData: Partial<Waybill>) => Promise<Waybill>;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  handleViewWaybill: (waybill: Waybill) => void;
  handleEditWaybill: (waybill: Waybill) => void;
  handleInitiateReturn: (waybill: Waybill) => void;
  handleDeleteWaybill: (waybill: Waybill) => void;
  handleSentToSite: (waybill: Waybill) => void;
}

export const WaybillsTab = ({
  waybills,
  sites,
  assets,
  employees,
  vehicles,
  handleCreateWaybill,
  setActiveTab,
  handleViewWaybill,
  handleEditWaybill,
  handleInitiateReturn,
  handleDeleteWaybill,
  handleSentToSite
}: WaybillsTabProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const openCreateDialog = () => setIsCreateDialogOpen(true);
  const closeCreateDialog = () => setIsCreateDialogOpen(false);

  const handleCreate = async (waybillData: Partial<Waybill>) => {
    const result = await handleCreateWaybill(waybillData);
    closeCreateDialog();
    return result;
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Waybills</h2>
        <Button onClick={openCreateDialog} variant="default" size="sm">
          Create Waybill
        </Button>
      </div>
      <WaybillList
        waybills={waybills.filter(wb => wb.type === 'waybill')}
        sites={sites}
        onViewWaybill={handleViewWaybill}
        onEditWaybill={handleEditWaybill}
        onInitiateReturn={handleInitiateReturn}
        onDeleteWaybill={handleDeleteWaybill}
        onSentToSite={handleSentToSite}
        disableDelete={false}
      />
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Waybill</DialogTitle>
          </DialogHeader>
          <CreateWaybillTab
            assets={assets}
            sites={sites}
            employees={employees}
            vehicles={vehicles}
            handleCreateWaybill={handleCreate}
            setActiveTab={setActiveTab}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
