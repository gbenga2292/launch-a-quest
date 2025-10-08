import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api, SiteTransaction as APISiteTransaction } from '@/services/api';
import { SiteTransaction } from '@/types/asset';

// Helper functions to convert between API types and local types
const apiSiteTransactionToSiteTransaction = (apiTransaction: APISiteTransaction): SiteTransaction => ({
  id: apiTransaction.id,
  siteId: apiTransaction.site_id,
  assetId: apiTransaction.asset_id,
  assetName: apiTransaction.asset_name,
  quantity: apiTransaction.quantity,
  type: apiTransaction.type as any,
  transactionType: apiTransaction.transaction_type as any,
  referenceId: apiTransaction.reference_id,
  referenceType: apiTransaction.reference_type as any,
  condition: apiTransaction.condition as any,
  notes: apiTransaction.notes,
  createdAt: new Date(apiTransaction.created_at),
  createdBy: apiTransaction.created_by
});

const siteTransactionToAPISiteTransaction = (transaction: Omit<SiteTransaction, 'id' | 'createdAt'>): Omit<APISiteTransaction, 'id' | 'created_at'> => ({
  site_id: transaction.siteId,
  asset_id: transaction.assetId,
  asset_name: transaction.assetName,
  quantity: transaction.quantity,
  type: transaction.type,
  transaction_type: transaction.transactionType,
  reference_id: transaction.referenceId,
  reference_type: transaction.referenceType,
  condition: transaction.condition,
  notes: transaction.notes,
  created_by: transaction.createdBy
});

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
        const transactionsData = apiTransactions.map(apiSiteTransactionToSiteTransaction);
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
      const apiTransactionData = siteTransactionToAPISiteTransaction(transactionData);
      const createdTransaction = await api.createSiteTransaction(apiTransactionData);
      const newTransaction = apiSiteTransactionToSiteTransaction(createdTransaction);
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
