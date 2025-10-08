import { QuickCheckoutForm } from "@/components/checkout/QuickCheckoutForm";
import { Asset, Employee, QuickCheckout, Site } from "@/types/asset";

interface QuickCheckoutTabProps {
  assets: Asset[];
  employees: Employee[];
  sites: Site[];
  quickCheckouts: QuickCheckout[];
  handleQuickCheckout: (checkoutData: Omit<QuickCheckout, 'id'>) => void;
  handleReturnItem: (checkoutId: string, quantity: number) => void;
  handleDeleteQuickCheckout: (checkoutId: string) => void;
  isAuthenticated: boolean;
  setQuickCheckouts: (checkouts: QuickCheckout[]) => void;
  toast: any;
}

export const QuickCheckoutTab = ({
  assets,
  employees,
  sites,
  quickCheckouts,
  handleQuickCheckout,
  handleReturnItem,
  handleDeleteQuickCheckout,
  isAuthenticated,
  setQuickCheckouts,
  toast
}: QuickCheckoutTabProps) => {
  const handleFormQuickCheckout = (checkout: Omit<QuickCheckout, 'id'>) => {
    // Pass the checkout data directly as it matches the expected format
    handleQuickCheckout(checkout);
  };

  const handleFormReturnItem = (checkoutId: string) => {
    // Get the checkout to find the quantity
    const checkout = quickCheckouts.find(c => c.id === checkoutId);
    if (checkout) {
      handleReturnItem(checkoutId, checkout.quantity);
    }
  };

  return (
    <QuickCheckoutForm
      assets={assets}
      employees={employees}
      sites={sites}
      quickCheckouts={quickCheckouts}
      onQuickCheckout={handleFormQuickCheckout}
      onReturnItem={handleFormReturnItem}
      onDeleteCheckout={handleDeleteQuickCheckout}
    />
  );
};
