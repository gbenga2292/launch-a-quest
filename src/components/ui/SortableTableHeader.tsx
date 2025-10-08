import { TableHead } from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";

interface SortableTableHeaderProps {
  field: string;
  currentSortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const SortableTableHeader = ({
  field,
  currentSortField,
  sortDirection,
  onSort,
  children,
  className
}: SortableTableHeaderProps) => (
  <TableHead
    className={`cursor-pointer hover:bg-muted/50 transition-colors ${className || ''}`}
    onClick={() => onSort(field)}
  >
    <div className="flex items-center gap-1">
      {children}
      {currentSortField === field && (
        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
      )}
    </div>
  </TableHead>
);
