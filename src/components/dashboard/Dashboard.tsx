import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip, Area, AreaChart } from 'recharts';
import { Asset, Waybill, QuickCheckout, Site, SiteTransaction } from "@/types/asset";
import { Package, FileText, ShoppingCart, AlertTriangle, TrendingDown, CheckCircle, BarChart3, Clock, TrendingUp, Wrench, Zap, Target, Calendar } from "lucide-react";
import { getCategoryData, getStatusData, getChartData, COLORS } from '@/utils/analytics';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface DashboardProps {
  assets: Asset[];
  waybills: Waybill[];
  quickCheckouts: QuickCheckout[];
  sites: Site[];
  siteTransactions: SiteTransaction[];
}

export const Dashboard = ({ assets, waybills, quickCheckouts, sites, siteTransactions }: DashboardProps) => {
  const totalAssets = assets.length;
  const totalQuantity = assets.reduce((sum, asset) => sum + asset.quantity, 0);
  const outOfStockCount = assets.filter(asset => asset.quantity === 0).length;
  const lowStockCount = assets.filter(asset => asset.quantity > 0 && asset.quantity < 10).length;

  const outstandingWaybills = waybills.filter(w => w.status === 'outstanding').length;
  const outstandingCheckouts = quickCheckouts.filter(c => c.status === 'outstanding').length;

  const categoryData = getChartData(getCategoryData(assets));
  const statusData = getChartData(getStatusData(assets));

  // Waybill analytics
  const completedWaybills = waybills.filter(w => w.status === 'return_completed').length;
  const sentToSiteWaybills = waybills.filter(w => w.status === 'sent_to_site').length;
  const regularWaybills = waybills.filter(w => w.type === 'waybill').length;
  const returnWaybills = waybills.filter(w => w.type === 'return').length;

  // QuickCheckout analytics
  const overdueCheckouts = quickCheckouts.filter(c =>
    c.status === 'outstanding' && c.checkoutDate &&
    new Date(c.checkoutDate).getTime() + (c.expectedReturnDays * 24 * 60 * 60 * 1000) < new Date().getTime()
  ).length;

  const completedCheckouts = quickCheckouts.filter(c => c.status === 'return_completed').length;
  const averageCheckoutDuration = completedCheckouts > 0
    ? Math.round(quickCheckouts
        .filter(c => c.status === 'return_completed')
        .reduce((sum, c) => sum + c.expectedReturnDays, 0) / completedCheckouts)
    : 0;

  // Site transactions analytics
  const siteTransactionCounts = sites.map(site => ({
    name: site.name,
    transactions: siteTransactions.filter(t => t.siteId === site.id).length,
    volume: siteTransactions.filter(t => t.siteId === site.id).reduce((sum, t) => sum + t.quantity, 0)
  }));

  // Asset condition analytics
  const poorConditionAssets = assets.filter(a => a.condition === 'poor').length;
  const fairConditionAssets = assets.filter(a => a.condition === 'fair').length;

  // Trends over time (last 6 months)
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  const monthlyAssets = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const monthName = date.toLocaleString('default', { month: 'short' });
    const assetsAdded = assets.filter(a =>
      a.createdAt && new Date(a.createdAt) >= date && new Date(a.createdAt) < new Date(date.getFullYear(), date.getMonth() + 1, 1)
    ).length;
    return { month: monthName, assets: assetsAdded };
  });

  const monthlyWaybills = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const monthName = date.toLocaleString('default', { month: 'short' });
    const waybillsCreated = waybills.filter(w =>
      w.issueDate && new Date(w.issueDate) >= date && new Date(w.issueDate) < new Date(date.getFullYear(), date.getMonth() + 1, 1)
    ).length;
    return { month: monthName, waybills: waybillsCreated };
  });

  const monthlyCheckouts = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const monthName = date.toLocaleString('default', { month: 'short' });
    const checkoutsMade = quickCheckouts.filter(c =>
      c.checkoutDate && new Date(c.checkoutDate) >= date && new Date(c.checkoutDate) < new Date(date.getFullYear(), date.getMonth() + 1, 1)
    ).length;
    return { month: monthName, checkouts: checkoutsMade };
  });

  // Alerts for assets with frequent damages or missing reports
  const frequentDamageAssets = assets.filter(a =>
    a.condition === 'poor' &&
    waybills.filter(w => w.items.some(item => item.assetId === a.id && item.status === 'damaged')).length > 2
  ).length;

  // Average return time for assets checked out or issued
  const returnedWaybills = waybills.filter(w => w.status === 'return_completed' && w.type === 'return');
  const totalReturnTime = returnedWaybills.reduce((sum, w) => {
    if (w.issueDate && w.expectedReturnDate) {
      const issueDate = new Date(w.issueDate);
      const returnDate = new Date(w.expectedReturnDate);
      return sum + (returnDate.getTime() - issueDate.getTime());
    }
    return sum;
  }, 0);

  const averageReturnTime = returnedWaybills.length > 0
    ? Math.round(totalReturnTime / returnedWaybills.length / (1000 * 60 * 60 * 24)) // days
    : 0;

  // Utilization rate calculation (assets that are checked out or issued)
  const issuedAssets = waybills
    .filter(w => w.status === 'outstanding')
    .reduce((sum, w) => sum + w.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

  const checkedOutAssets = quickCheckouts
    .filter(c => c.status === 'outstanding')
    .reduce((sum, c) => sum + c.quantity, 0);

  const utilizationRate = totalQuantity > 0
    ? Math.round(((issuedAssets + checkedOutAssets) / totalQuantity) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of your inventory and operations
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssets}</div>
            <p className="text-xs text-muted-foreground">
              {totalQuantity} total quantity
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{outOfStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Assets needing restock
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Waybills</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outstandingWaybills}</div>
            <p className="text-xs text-muted-foreground">
              Pending deliveries
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Checkouts</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outstandingCheckouts}</div>
            <p className="text-xs text-muted-foreground">
              Items checked out
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Waybills</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedWaybills}</div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Checkouts</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{overdueCheckouts}</div>
            <p className="text-xs text-muted-foreground">
              Past expected return date
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Poor Condition Assets</CardTitle>
            <Wrench className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{poorConditionAssets}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Asset Categories</CardTitle>
            <CardDescription>Distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Count",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    legendType="circle"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-0 shadow-soft overflow-hidden">
          <CardHeader>
            <CardTitle>Asset Status</CardTitle>
            <CardDescription>Current status overview</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <ChartContainer
              config={{
                value: {
                  label: "Count",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card className="border-0 shadow-soft overflow-hidden">
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Assets added and waybills created over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <ChartContainer
              config={{
                assets: {
                  label: "Assets Added",
                  color: "#8884d8",
                },
                waybills: {
                  label: "Waybills Created",
                  color: "#82ca9d",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyAssets.map((item, index) => ({
                  ...item,
                  waybills: monthlyWaybills[index].waybills
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="assets" stackId="1" stroke="#8884d8" fill="#8884d8" label />
                  <Area type="monotone" dataKey="waybills" stackId="2" stroke="#82ca9d" fill="#82ca9d" label />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Site Transaction Volume */}
        <Card className="border-0 shadow-soft overflow-hidden">
          <CardHeader>
            <CardTitle>Site Transaction Volume</CardTitle>
            <CardDescription>Transaction count and volume by site</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <ChartContainer
              config={{
                transactions: {
                  label: "Transactions",
                  color: "#ffc658",
                },
                volume: {
                  label: "Volume",
                  color: "#ff7300",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={siteTransactionCounts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="transactions" fill="#ffc658" />
                  <Bar dataKey="volume" fill="#ff7300" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity or Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Assets below threshold
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <Progress value={78} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Average across all assets
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Assets needing maintenance
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
