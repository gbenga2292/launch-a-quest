import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WaybillDocument } from "@/components/waybills/WaybillDocument";
import { ReturnForm } from "@/components/waybills/ReturnForm";
import { ReturnWaybillDocument } from "@/components/waybills/ReturnWaybillDocument";
import { ReturnProcessingDialog } from "@/components/waybills/ReturnProcessingDialog";
import { ReturnWaybillForm } from "@/components/waybills/ReturnWaybillForm";
import { EditWaybillForm } from "@/components/waybills/EditWaybillForm";
import { Waybill } from "@/types/asset";

interface WaybillDialogsProps {
  showWaybillDocument: any;
  setShowWaybillDocument: (waybill: any) => void;
  showReturnWaybillDocument: any;
  setShowReturnWaybillDocument: (waybill: any) => void;
  showReturnForm: any;
  setShowReturnForm: (waybill: any) => void;
  processingReturnWaybill: any;
  setProcessingReturnWaybill: (waybill: any) => void;
  editingWaybill: any;
  setEditingWaybill: (waybill: any) => void;
  editingReturnWaybill: any;
  setEditingReturnWaybill: (waybill: any) => void;
  sites: any[];
  companySettings: any;
  assets: any[];
  siteInventory: any[];
  employees: any[];
  vehicles: any[];
  handleProcessReturn: (returnData: any) => Promise<void>;
  handleCreateReturnWaybill: (waybillData: any) => Promise<Waybill | undefined>;
  handleUpdateReturnWaybill: (waybillData: any) => Promise<void>;
  handleUpdateWaybill: (waybillData: any) => Promise<void>;
}

export const WaybillDialogs = ({
  showWaybillDocument,
  setShowWaybillDocument,
  showReturnWaybillDocument,
  setShowReturnWaybillDocument,
  showReturnForm,
  setShowReturnForm,
  processingReturnWaybill,
  setProcessingReturnWaybill,
  editingWaybill,
  setEditingWaybill,
  editingReturnWaybill,
  setEditingReturnWaybill,
  sites,
  companySettings,
  assets,
  siteInventory,
  employees,
  vehicles,
  handleProcessReturn,
  handleCreateReturnWaybill,
  handleUpdateReturnWaybill,
  handleUpdateWaybill,
}: WaybillDialogsProps) => {
  return (
    <>
      {/* Processing Return Waybill Dialog */}
      {processingReturnWaybill && (
        <ReturnProcessingDialog
          waybill={processingReturnWaybill}
          onClose={() => setProcessingReturnWaybill(null)}
          onSubmit={(returnData) => {
            setProcessingReturnWaybill(null);
            handleProcessReturn(returnData);
          }}
        />
      )}

      {/* Waybill Document Modal */}
      {showWaybillDocument && (
        <WaybillDocument
          waybill={showWaybillDocument}
          sites={sites}
          companySettings={companySettings}
          onClose={() => setShowWaybillDocument(null)}
        />
      )}

      {/* Return Form Modal */}
      {showReturnForm && (
        <ReturnForm
          waybill={showReturnForm}
          onSubmit={handleProcessReturn}
          onClose={() => setShowReturnForm(null)}
        />
      )}

      {/* Return Waybill Document Modal */}
      {showReturnWaybillDocument && (
        <ReturnWaybillDocument
          waybill={showReturnWaybillDocument}
          sites={sites}
          companySettings={companySettings}
          onClose={() => setShowReturnWaybillDocument(null)}
        />
      )}

      {/* Edit Return Waybill Dialog */}
      <Dialog open={!!editingReturnWaybill} onOpenChange={open => !open && setEditingReturnWaybill(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Return Waybill</DialogTitle>
          </DialogHeader>
          {editingReturnWaybill && (
            <ReturnWaybillForm
              site={sites.find(s => s.id === editingReturnWaybill.siteId) || { id: editingReturnWaybill.siteId, name: 'Unknown Site', location: '', description: '', contactPerson: '', phone: '', status: 'active', createdAt: new Date(), updatedAt: new Date() }}
              sites={sites}
              assets={assets}
              siteInventory={siteInventory}
              employees={employees}
              vehicles={vehicles}
              initialWaybill={editingReturnWaybill}
              isEditMode={true}
              onCreateReturnWaybill={handleCreateReturnWaybill}
              onUpdateReturnWaybill={handleUpdateReturnWaybill}
              onCancel={() => setEditingReturnWaybill(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Waybill Dialog */}
      <Dialog open={!!editingWaybill} onOpenChange={open => !open && setEditingWaybill(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Waybill</DialogTitle>
          </DialogHeader>
          {editingWaybill && (
            <EditWaybillForm
              waybill={editingWaybill}
              assets={assets}
              sites={sites}
              employees={employees}
              vehicles={vehicles}
              onUpdate={handleUpdateWaybill}
              onCancel={() => setEditingWaybill(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
