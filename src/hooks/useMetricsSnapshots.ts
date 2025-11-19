import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface MetricsSnapshot {
  snapshot_date: string;
  total_assets: number;
  total_quantity: number;
  outstanding_waybills: number;
  outstanding_checkouts: number;
  out_of_stock: number;
  low_stock: number;
}

interface CurrentMetrics {
  totalAssets: number;
  totalQuantity: number;
  outstandingWaybills: number;
  outstandingCheckouts: number;
  outOfStockCount: number;
  lowStockCount: number;
}

export const useMetricsSnapshots = (currentMetrics: CurrentMetrics) => {
  useEffect(() => {
    const createTodaySnapshot = async () => {
      try {
        const today = format(new Date(), "yyyy-MM-dd");
        
        // Check if today's snapshot already exists
        const { data: existing } = await supabase
          .from("metrics_snapshots")
          .select("id")
          .eq("snapshot_date", today)
          .maybeSingle();

        // If no snapshot exists for today, create one
        if (!existing) {
          await supabase.from("metrics_snapshots").insert({
            snapshot_date: today,
            total_assets: currentMetrics.totalAssets,
            total_quantity: currentMetrics.totalQuantity,
            outstanding_waybills: currentMetrics.outstandingWaybills,
            outstanding_checkouts: currentMetrics.outstandingCheckouts,
            out_of_stock: currentMetrics.outOfStockCount,
            low_stock: currentMetrics.lowStockCount,
          });
        }
      } catch (error) {
        console.error("Error creating metrics snapshot:", error);
      }
    };

    createTodaySnapshot();
  }, [currentMetrics]);
};

export const getMetricsHistory = async (days: number = 7): Promise<MetricsSnapshot[]> => {
  try {
    const { data, error } = await supabase
      .from("metrics_snapshots")
      .select("*")
      .order("snapshot_date", { ascending: true })
      .limit(days);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching metrics history:", error);
    return [];
  }
};
