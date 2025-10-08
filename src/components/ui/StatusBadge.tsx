import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: 'active' | 'damaged' | 'missing' | 'maintenance';
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const statusColors = {
    'active': 'bg-gradient-success',
    'damaged': 'bg-gradient-warning text-warning-foreground',
    'missing': 'destructive',
    'maintenance': 'secondary'
  };

  return (
    <Badge className={`${statusColors[status || 'active']} ${className || ''}`}>
      {(status || 'active').toUpperCase()}
    </Badge>
  );
};
