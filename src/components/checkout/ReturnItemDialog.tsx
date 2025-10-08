import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuickCheckout } from "@/types/asset";

interface ReturnItemDialogProps {
  checkout: QuickCheckout;
  onClose: () => void;
  onReturn: (checkoutId: string, quantity: number) => void;
}

export const ReturnItemDialog = ({ checkout, onClose, onReturn }: ReturnItemDialogProps) => {
  const [quantity, setQuantity] = useState(checkout.quantity);

  const handleReturn = () => {
    onReturn(checkout.id, quantity);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Return Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p><strong>Asset:</strong> {checkout.assetName}</p>
            <p><strong>Checked Out:</strong> {checkout.quantity}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity to Return</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={checkout.quantity}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleReturn}>Return</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
