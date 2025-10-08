import { ReturnsList } from "@/components/waybills/ReturnsList";
import { Waybill, Site } from "@/types/asset";

interface ReturnsTabProps {
  waybills: Waybill[];
  sites: Site[];
  handleViewWaybill: (waybill: Waybill) => void;
  handleEditWaybill: (waybill: Waybill) => void;
  handleDeleteWaybill: (waybill: Waybill) => void;
  handleOpenReturnDialog: (returnData: { waybillId: string; items: any[] }) => void;
}

export const ReturnsTab = ({
  waybills,
  sites,
  handleViewWaybill,
  handleEditWaybill,
  handleDeleteWaybill,
  handleOpenReturnDialog
}: ReturnsTabProps) => {
  return (
    <ReturnsList
      waybills={waybills.filter(wb => wb.type === 'return')}
      sites={sites}
      onViewWaybill={handleViewWaybill}
      onEditWaybill={handleEditWaybill}
      onDeleteWaybill={handleDeleteWaybill}
      onProcessReturn={handleOpenReturnDialog}
    />
  );
};
