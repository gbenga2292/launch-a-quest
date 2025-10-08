import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface DataTableFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters: Array<{
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    options: FilterOption[];
    width?: string;
  }>;
}

export const DataTableFilters = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters
}: DataTableFiltersProps) => (
  <div className="bg-card border-0 shadow-soft rounded-lg p-4">
    <div className="flex flex-col md:flex-row gap-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 border-0 bg-muted/50 focus:bg-background transition-all duration-300"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map((filter, index) => (
          <Select key={index} value={filter.value} onValueChange={filter.onChange}>
            <SelectTrigger className={filter.width || "w-40"}>
              <SelectValue placeholder={filter.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>
    </div>
  </div>
);
