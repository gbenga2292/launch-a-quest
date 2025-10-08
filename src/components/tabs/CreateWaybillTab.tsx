import { useState } from "react";
import { WaybillForm } from "@/components/waybills/WaybillForm";
import { Asset, Waybill, Employee, Site } from "@/types/asset";

interface CreateWaybillTabProps {
  assets: Asset[];
  sites: Site[];
  employees: Employee[];
  vehicles: string[];
  handleCreateWaybill: (waybillData: Partial<Waybill>) => Promise<Waybill>;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

export const CreateWaybillTab = ({
  assets,
  sites,
  employees,
  vehicles,
  handleCreateWaybill,
  setActiveTab
}: CreateWaybillTabProps) => {
  const [loading, setLoading] = useState(false);

  const handleCreate = async (waybillData: Omit<Waybill, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    try {
      await handleCreateWaybill(waybillData);
      setActiveTab('waybills');
    } finally {
      setLoading(false);
    }
  };

  return (
    <WaybillForm
      assets={assets}
      sites={sites}
      employees={employees}
      vehicles={vehicles}
      onCreateWaybill={handleCreate}
      onCancel={() => setActiveTab('waybills')}
      loading={loading}
    />
  );
};
