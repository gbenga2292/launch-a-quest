import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Plus,
  FileText,
  ShoppingCart,
  Settings,
  MapPin,
  LogOut,
  LogIn,
  Activity
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const authenticatedMenuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard
    },
    {
      id: "assets",
      label: "Asset Inventory",
      icon: Package
    },
    {
      id: "waybills",
      label: "Waybills",
      icon: FileText
    },
    {
      id: "returns",
      label: "Returns",
      icon: FileText
    },
    {
      id: "quick-checkout",
      label: "Quick Checkout",
      icon: ShoppingCart
    },
    {
      id: "sites",
      label: "Sites",
      icon: MapPin
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings
    }
  ];

  const menuItems = authenticatedMenuItems;

  return (
    <div className="w-64 bg-card border-r border-border h-full shadow-soft flex flex-col">
      <div className="p-4 md:p-6 border-b border-border">
        <h1 className="text-lg md:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          DCEL Asset Manager
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          Inventory & Logistics
        </p>
      </div>
      
      <nav className="p-3 md:p-4 space-y-1 md:space-y-2 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isEnabled = item.id === "dashboard" || item.id === "waybills" || item.id === "assets" || item.id === "returns" || item.id === "sites" || item.id === "quick-checkout" || isAuthenticated;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-10 md:h-11 text-sm md:text-base",
                activeTab === item.id && "bg-gradient-primary shadow-medium"
              )}
              disabled={!isEnabled}
              onClick={() => onTabChange(item.id)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="p-3 md:p-4 border-t border-border">
        {isAuthenticated ? (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-10 md:h-11 text-sm md:text-base text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        ) : (
          <Button
            variant="default"
            className="w-full justify-start gap-3 h-10 md:h-11 text-sm md:text-base bg-gradient-primary"
            onClick={() => navigate("/login")}
          >
            <LogIn className="h-4 w-4" />
            Login
          </Button>
        )}
      </div>
    </div>
  );
};