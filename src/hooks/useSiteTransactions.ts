import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { SiteTransaction } from '@/types/asset';

export const useSiteTransactions = () => {
  const { toast } = useToast();
  const [siteTransactions, setSiteTransactions] = useState<SiteTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Load site transactions from API on mount
  useEffect(() => {
    const loadSiteTransactions = async () => {
      try {
        setLoading(true);
        const apiTransactions = await api.getSiteTransactions();
        const transactionsData = apiTransactions.map(t => ({
          id: t.id,
          siteId: t.siteId,
          assetId: t.assetId,
          assetName: t.assetName,
          quantity: t.quantity || 0,
          type: t.type as any,
          transactionType: t.transactionType as any,
          referenceId: t.referenceId,
          referenceType: t.referenceType as any,
          condition: t.condition as any,
          notes: t.notes,
          createdAt: t.createdAt,
          createdBy: t.createdBy,
        }));
        setSiteTransactions(transactionsData);
      } catch (error) {
        console.error('Failed to load site transactions:', error);
        toast({
          title: "Error",
          description: "Failed to load site transactions from server",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    loadSiteTransactions();
  }, [toast]);

  const handleAddSiteTransaction = async (transactionData: Omit<SiteTransaction, 'id' | 'createdAt'>) => {
    try {
      const createdTransaction = await api.createSiteTransaction({
        siteId: transactionData.siteId,
        assetId: transactionData.assetId,
        assetName: transactionData.assetName,
        quantity: transactionData.quantity,
        type: transactionData.type,
        transactionType: transactionData.transactionType,
        referenceId: transactionData.referenceId,
        referenceType: transactionData.referenceType,
        condition: transactionData.condition,
        notes: transactionData.notes,
        createdBy: transactionData.createdBy
      });
      const newTransaction = {
        id: createdTransaction.id,
        siteId: createdTransaction.siteId,
        assetId: createdTransaction.assetId,
        assetName: createdTransaction.assetName,
        quantity: createdTransaction.quantity || 0,
        type: createdTransaction.type as any,
        transactionType: createdTransaction.transactionType as any,
        referenceId: createdTransaction.referenceId,
        referenceType: createdTransaction.referenceType as any,
        condition: createdTransaction.condition as any,
        notes: createdTransaction.notes,
        createdAt: createdTransaction.createdAt,
        createdBy: createdTransaction.createdBy,
      };
      setSiteTransactions(prev => [...prev, newTransaction]);
    } catch (error) {
      console.error('Failed to add site transaction:', error);
      toast({
        title: "Error",
        description: "Failed to add site transaction",
        variant: "destructive"
      });
    }
  };

  return {
    siteTransactions,
    loading,
    handleAddSiteTransaction,
    setSiteTransactions
  };
};
