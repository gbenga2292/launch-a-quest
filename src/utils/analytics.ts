import { Asset, Waybill, QuickCheckout, SiteTransaction, Site } from '@/types/asset';

export interface ChartData {
  name: string;
  value: number;
}

export const getCategoryData = (assets: Asset[]): Record<string, number> => {
  return assets.reduce((acc, asset) => {
    acc[asset.category] = (acc[asset.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

export const getStatusData = (assets: Asset[]): Record<string, number> => {
  return assets.reduce((acc, asset) => {
    acc[asset.status] = (acc[asset.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

export const getChartData = (data: Record<string, number>): ChartData[] => {
  return Object.entries(data).map(([name, value]) => ({ name, value }));
};

export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'] as const;

// Individual Asset Analytics
export interface AssetAnalytics {
  usageFrequency: {
    totalCheckouts: number;
    waybillCheckouts: number;
    quickCheckouts: number;
    averageCheckoutDuration: number; // in days
    lastUsed: Date | null;
  };
  stockDistribution: {
    totalQuantity: number;
    availableQuantity: number;
    checkedOutQuantity: number;
    quantityBySite: Record<string, number>; // siteId -> quantity
  };
  maintenanceHistory: {
    lastMaintenance: Date | null;
    maintenanceCount: number;
    averageMaintenanceInterval: number; // in days
  };
  costAnalysis: {
    acquisitionCost: number;
    maintenanceCosts: number;
    costPerUse: number;
    totalValue: number;
  };
  utilizationRate: number; // percentage
  failureRate: {
    damageRate: number; // percentage
    missingRate: number; // percentage
    returnRate: number; // percentage of successful returns
  };
  downtime: {
    totalDowntimeDays: number;
    averageRepairTime: number; // in days
  };
}

export const calculateAssetAnalytics = (
  asset: Asset,
  waybills: Waybill[],
  quickCheckouts: QuickCheckout[],
  siteTransactions: SiteTransaction[],
  sites: Site[]
): AssetAnalytics => {
  // Usage Frequency
  const waybillUsages = waybills.flatMap(wb =>
    wb.items.filter(item => item.assetId === asset.id)
  );
  const quickUsages = quickCheckouts.filter(qc => qc.assetId === asset.id);

  const totalCheckouts = waybillUsages.length + quickUsages.length;
  const waybillCheckouts = waybillUsages.length;
  const quickCheckoutsCount = quickUsages.length;

  // Calculate average checkout duration (simplified - using expected return days)
  const durations = [
    ...waybillUsages.map(() => 7), // assume 7 days for waybills
    ...quickUsages.map(qc => qc.expectedReturnDays)
  ];
  const averageCheckoutDuration = durations.length > 0
    ? durations.reduce((a, b) => a + b, 0) / durations.length
    : 0;

  const lastUsed = [
    ...waybillUsages.map(() => new Date()), // simplified
    ...quickUsages.map(qc => qc.checkoutDate)
  ].sort((a, b) => b.getTime() - a.getTime())[0] || null;

  // Stock Distribution
  const totalQuantity = asset.quantity;
  const checkedOutQuantity = waybillUsages.reduce((sum, item) => sum + item.quantity, 0) +
                            quickUsages.filter(qc => qc.status === 'outstanding').reduce((sum, qc) => sum + qc.quantity, 0);
  const availableQuantity = Math.max(0, totalQuantity - checkedOutQuantity);

  const quantityBySite: Record<string, number> = {};
  siteTransactions
    .filter(st => st.assetId === asset.id)
    .forEach(st => {
      const siteName = sites.find(s => s.id === st.siteId)?.name || st.siteId;
      quantityBySite[siteName] = (quantityBySite[siteName] || 0) + (st.type === 'in' ? st.quantity : -st.quantity);
    });

  // Maintenance History (simplified - assuming status changes to maintenance)
  const maintenanceTransactions = siteTransactions.filter(st =>
    st.assetId === asset.id && st.notes?.includes('maintenance')
  );
  const lastMaintenance = maintenanceTransactions.length > 0
    ? maintenanceTransactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
    : null;
  const maintenanceCount = maintenanceTransactions.length;
  const averageMaintenanceInterval = maintenanceCount > 1
    ? (Date.now() - maintenanceTransactions[0].createdAt.getTime()) / (maintenanceCount - 1) / (1000 * 60 * 60 * 24)
    : 0;

  // Cost Analysis
  const acquisitionCost = asset.cost || 0;
  const maintenanceCosts = maintenanceCount * 100; // assume $100 per maintenance
  const costPerUse = totalCheckouts > 0 ? (acquisitionCost + maintenanceCosts) / totalCheckouts : 0;
  const totalValue = acquisitionCost;

  // Utilization Rate (simplified)
  const totalPossibleDays = 365; // assume annual
  const usedDays = totalCheckouts * averageCheckoutDuration;
  const utilizationRate = totalPossibleDays > 0 ? (usedDays / totalPossibleDays) * 100 : 0;

  // Failure Rate
  const returns = siteTransactions.filter(st =>
    st.assetId === asset.id && st.transactionType === 'return'
  );
  const damagedReturns = returns.filter(st => st.condition === 'damaged');
  const missingReturns = returns.filter(st => st.condition === 'missing');
  const totalReturns = returns.length;
  const damageRate = totalReturns > 0 ? (damagedReturns.length / totalReturns) * 100 : 0;
  const missingRate = totalReturns > 0 ? (missingReturns.length / totalReturns) * 100 : 0;
  const returnRate = totalCheckouts > 0 ? (totalReturns / totalCheckouts) * 100 : 0;

  // Downtime
  const downtimeDays = maintenanceCount * 2; // assume 2 days per maintenance
  const averageRepairTime = maintenanceCount > 0 ? downtimeDays / maintenanceCount : 0;

  return {
    usageFrequency: {
      totalCheckouts,
      waybillCheckouts,
      quickCheckouts: quickCheckoutsCount,
      averageCheckoutDuration,
      lastUsed
    },
    stockDistribution: {
      totalQuantity,
      availableQuantity,
      checkedOutQuantity,
      quantityBySite
    },
    maintenanceHistory: {
      lastMaintenance,
      maintenanceCount,
      averageMaintenanceInterval
    },
    costAnalysis: {
      acquisitionCost,
      maintenanceCosts,
      costPerUse,
      totalValue
    },
    utilizationRate,
    failureRate: {
      damageRate,
      missingRate,
      returnRate
    },
    downtime: {
      totalDowntimeDays: downtimeDays,
      averageRepairTime
    }
  };
};
