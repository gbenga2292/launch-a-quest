import { Badge } from "@/components/ui/badge";

interface StockBadgeProps {
  totalStock: number;
  reserved: number;
  lowStockLevel?: number;
  criticalStockLevel?: number;
  className?: string;
}

export const StockBadge = ({ totalStock, reserved, lowStockLevel, criticalStockLevel, className }: StockBadgeProps) => {
  const availableStock = totalStock - reserved;
  const low = lowStockLevel ?? 10;
  const critical = criticalStockLevel ?? 5;

  if (availableStock <= 0) {
    return <Badge variant="destructive" className={className}>Out of Stock</Badge>;
  } else if (availableStock <= critical) {
    return <Badge className={`bg-red-500 text-white ${className || ''}`}>Critical Stock</Badge>;
  } else if (availableStock <= low) {
    return <Badge className={`bg-gradient-warning text-warning-foreground ${className || ''}`}>Low Stock</Badge>;
  } else {
    return <Badge className={`bg-gradient-success ${className || ''}`}>In Stock</Badge>;
  }
};
