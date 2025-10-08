import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SortableTableHeader } from "./SortableTableHeader";

interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    description: string;
  };
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  sortField,
  sortDirection,
  onSort,
  emptyState,
  className
}: DataTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return (
      <div className="text-center py-12">
        {emptyState.icon}
        <h3 className="text-lg font-semibold mb-2">{emptyState.title}</h3>
        <p className="text-muted-foreground">{emptyState.description}</p>
      </div>
    );
  }

  return (
    <div className={`bg-card border-0 shadow-soft rounded-lg overflow-hidden ${className || ''}`}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map((column) => (
                column.sortable ? (
                  <SortableTableHeader
                    key={String(column.key)}
                    field={String(column.key)}
                    currentSortField={sortField}
                    sortDirection={sortDirection}
                    onSort={onSort}
                  >
                    {column.header}
                  </SortableTableHeader>
                ) : (
                  <TableHead key={String(column.key)} className={column.className}>
                    {column.header}
                  </TableHead>
                )
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                {columns.map((column) => (
                  <TableCell key={String(column.key)} className={column.className}>
                    {column.render ? column.render(item) : String(item[column.key] || '-')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
