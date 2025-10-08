import { Dashboard } from "@/components/dashboard/Dashboard";
import { Item as Asset, Waybill, QuickCheckout, Site, SiteTransaction } from "@/services/api";

interface DashboardTabProps {
  assets: Asset[];
  waybills: Waybill[];
  quickCheckouts: QuickCheckout[];
  sites: Site[];
  siteTransactions: SiteTransaction[];
}

export const DashboardTab = ({
  assets,
  waybills,
  quickCheckouts,
  sites,
  siteTransactions
}: DashboardTabProps) => {
  return (
    <Dashboard
      assets={assets}
      waybills={waybills}
      quickCheckouts={quickCheckouts}
      sites={sites}
      siteTransactions={siteTransactions}
    />
  );
};
