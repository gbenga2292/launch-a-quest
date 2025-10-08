import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  children: ReactNode;
}

export const MainLayout = ({
  activeTab,
  onTabChange,
  mobileMenuOpen,
  setMobileMenuOpen,
  children
}: MainLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
      )}

      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border p-4 flex items-center justify-between">
          <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
            DCEL Asset Manager
          </h1>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar
                activeTab={activeTab}
                onTabChange={(tab) => {
                  onTabChange(tab);
                  setMobileMenuOpen(false);
                }}
              />
            </SheetContent>
          </Sheet>
        </div>
      )}

      <main className={`flex-1 overflow-y-auto p-4 md:p-6 ${isMobile ? "pt-20" : ""}`}>
        {children}
      </main>
    </div>
  );
};
