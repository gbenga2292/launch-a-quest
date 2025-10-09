import { useState } from "react";
import { CompanySettings } from "@/components/settings/CompanySettings";
import { BackupSettings } from "@/components/settings/BackupSettings";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Building, Download } from "lucide-react";
import {
  Asset,
  Employee,
  QuickCheckout,
  Site,
  SiteTransaction,
  Waybill,
} from "@/types/asset";

interface SettingsTabProps {
  companySettings: any;
  setCompanySettings: (settings: any) => void;
  isAuthenticated: boolean;
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
  vehicles: string[];
  setVehicles: (vehicles: string[]) => void;
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;
  waybills: Waybill[];
  setWaybills: (waybills: Waybill[]) => void;
  quickCheckouts: QuickCheckout[];
  setQuickCheckouts: (checkouts: QuickCheckout[]) => void;
  sites: Site[];
  setSites: (sites: Site[]) => void;
  siteTransactions: SiteTransaction[];
  setSiteTransactions: (transactions: SiteTransaction[]) => void;
  handleResetAllData?: () => void;
  toast: any;
}

export const SettingsTab = ({
  companySettings,
  setCompanySettings,
  isAuthenticated,
  employees,
  setEmployees,
  vehicles,
  setVehicles,
  assets,
  setAssets,
  waybills,
  setWaybills,
  quickCheckouts,
  setQuickCheckouts,
  sites,
  setSites,
  siteTransactions,
  setSiteTransactions,
  handleResetAllData,
  toast
}: SettingsTabProps) => {
  const [activeTab, setActiveTab] = useState("company");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="company" className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          Company Settings
        </TabsTrigger>
        <TabsTrigger value="backup" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Backup Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="company" className="mt-6">
        <CompanySettings />
      </TabsContent>

      <TabsContent value="backup" className="mt-6">
        <BackupSettings
          assets={assets}
          onAssetsChange={setAssets}
          waybills={waybills}
          onWaybillsChange={setWaybills}
          quickCheckouts={quickCheckouts}
          onQuickCheckoutsChange={setQuickCheckouts}
          sites={sites}
          onSitesChange={setSites}
          siteTransactions={siteTransactions}
          onSiteTransactionsChange={setSiteTransactions}
          employees={employees}
          onEmployeesChange={setEmployees}
          vehicles={vehicles}
          onVehiclesChange={setVehicles}
          onResetAllData={handleResetAllData}
        />
      </TabsContent>
    </Tabs>
  );
};
