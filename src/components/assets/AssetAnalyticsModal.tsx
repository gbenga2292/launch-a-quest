import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Asset, Waybill, QuickCheckout, SiteTransaction, Site } from "@/types/asset";
import { calculateAssetAnalytics, AssetAnalytics } from "@/utils/analytics";
import { BarChart, TrendingUp, Package, Wrench, DollarSign, AlertTriangle, Clock } from "lucide-react";

interface AssetAnalyticsModalProps {
  asset: Asset | null;
  waybills: Waybill[];
  quickCheckouts: QuickCheckout[];
  siteTransactions: SiteTransaction[];
  sites: Site[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AssetAnalyticsModal = ({
  asset,
  waybills,
  quickCheckouts,
  siteTransactions,
  sites,
  open,
  onOpenChange
}: AssetAnalyticsModalProps) => {
  const analytics = useMemo(() => {
    if (!asset) return null;
    return calculateAssetAnalytics(asset, waybills, quickCheckouts, siteTransactions, sites);
  }, [asset, waybills, quickCheckouts, siteTransactions, sites]);

  if (!asset || !analytics) return null;

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatDate = (date: Date | null) => date ? date.toLocaleDateString() : 'Never';
  const formatNumber = (num: number) => num.toFixed(1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Analytics for {asset.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Usage Frequency */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Usage Frequency
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{analytics.usageFrequency.totalCheckouts}</div>
              <div className="text-xs text-muted-foreground">Total Checkouts</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Waybills: {analytics.usageFrequency.waybillCheckouts}</div>
                <div>Quick: {analytics.usageFrequency.quickCheckouts}</div>
              </div>
              <div className="text-xs">
                Avg Duration: {formatNumber(analytics.usageFrequency.averageCheckoutDuration)} days
              </div>
              <div className="text-xs">
                Last Used: {formatDate(analytics.usageFrequency.lastUsed)}
              </div>
              <div className="text-xs mt-2 font-semibold">Top Borrowers:</div>
              <div className="text-xs text-muted-foreground">No borrow records</div>
            </CardContent>
          </Card>

          {/* Stock Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Stock Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{analytics.stockDistribution.totalQuantity}</div>
              <div className="text-xs text-muted-foreground">Total Quantity</div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Available:</span>
                  <span>{analytics.stockDistribution.availableQuantity}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Checked Out:</span>
                  <span>{analytics.stockDistribution.checkedOutQuantity}</span>
                </div>
              </div>
              <div className="text-xs font-medium mt-2">By Site:</div>
              {Object.entries(analytics.stockDistribution.quantityBySite).length > 0 ? (
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {Object.entries(analytics.stockDistribution.quantityBySite).map(([site, qty]) => (
                    <div key={site} className="flex justify-between text-xs">
                      <span className="truncate">{site}:</span>
                      <span>{qty}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">No site distribution</div>
              )}
            </CardContent>
          </Card>

          {/* Maintenance History */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{analytics.maintenanceHistory.maintenanceCount}</div>
              <div className="text-xs text-muted-foreground">Maintenance Events</div>
              <div className="text-xs">
                Last: {formatDate(analytics.maintenanceHistory.lastMaintenance)}
              </div>
              <div className="text-xs">
                Avg Interval: {formatNumber(analytics.maintenanceHistory.averageMaintenanceInterval)} days
              </div>
            </CardContent>
          </Card>

          {/* Cost Analysis */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Cost Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{formatCurrency(analytics.costAnalysis.totalValue)}</div>
              <div className="text-xs text-muted-foreground">Total Value</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Acquisition:</span>
                  <span>{formatCurrency(analytics.costAnalysis.acquisitionCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Maintenance:</span>
                  <span>{formatCurrency(analytics.costAnalysis.maintenanceCosts)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost/Use:</span>
                  <span>{formatCurrency(analytics.costAnalysis.costPerUse)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Utilization Rate */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Utilization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{formatNumber(analytics.utilizationRate)}%</div>
              <Progress value={analytics.utilizationRate} className="h-2" />
              <div className="text-xs text-muted-foreground">Annual utilization rate</div>
            </CardContent>
          </Card>

          {/* Failure Rate & Damaged/Missing Tracking */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Damaged & Missing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="font-medium text-orange-600">{analytics.failureRate.damagedCount}</div>
                  <div className="text-muted-foreground">Damaged Items</div>
                  <div className="text-[10px] text-muted-foreground">{formatNumber(analytics.failureRate.damageRate)}% rate</div>
                </div>
                <div>
                  <div className="font-medium text-red-600">{analytics.failureRate.missingItemsCount}</div>
                  <div className="text-muted-foreground">Missing Items</div>
                  <div className="text-[10px] text-muted-foreground">{formatNumber(analytics.failureRate.missingRate)}% rate</div>
                </div>
              </div>
              <div className="text-xs pt-2 border-t">
                Return Rate: {formatNumber(analytics.failureRate.returnRate)}%
              </div>
            </CardContent>
          </Card>

          {/* Downtime */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Downtime & Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-lg font-bold">{analytics.downtime.totalDowntimeDays}</div>
                  <div className="text-xs text-muted-foreground">Total Downtime (days)</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{formatNumber(analytics.downtime.averageRepairTime)}</div>
                  <div className="text-xs text-muted-foreground">Avg Repair Time (days)</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{asset.status}</div>
                  <div className="text-xs text-muted-foreground">Current Status</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{asset.condition}</div>
                  <div className="text-xs text-muted-foreground">Condition</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Operation Manager Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {analytics.utilizationRate < 20 && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <span>Low utilization rate. Consider redeployment or disposal.</span>
              </div>
            )}
            {analytics.stockDistribution.availableQuantity < (asset.lowStockLevel || 10) && (
              <div className="flex items-start gap-2">
                <Package className="h-4 w-4 text-orange-500 mt-0.5" />
                <span>Low stock levels. Consider reordering to maintain optimal inventory.</span>
              </div>
            )}
            {analytics.usageFrequency.totalCheckouts === 0 && (
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-gray-500 mt-0.5" />
                <span>No usage recorded. Assess if this asset is still needed.</span>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
