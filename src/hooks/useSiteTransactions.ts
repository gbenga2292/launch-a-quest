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
        const transactionsData = apiTransactions.map(apiTrans => ({
          id: apiTrans.id,
          siteId: apiTrans.site_id,
          assetId: apiTrans.asset_id,
          assetName: apiTrans.asset_name,
          quantity: apiTrans.quantity,
          type: apiTrans.type as 'in' | 'out',
          transactionType: apiTrans.transaction_type as 'waybill' | 'return',
          referenceId: apiTrans.reference_id,
          referenceType: apiTrans.reference_type as 'waybill' | 'return_waybill' | 'quick_checkout',
          condition: apiTrans.condition as 'good' | 'damaged' | 'missing',
          notes: apiTrans.notes,
          createdAt: new Date(apiTrans.created_at),
          createdBy: apiTrans.created_by
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
      const apiTransactionData = {
        site_id: transactionData.siteId,
        asset_id: transactionData.assetId,
        asset_name: transactionData.assetName,
        quantity: transactionData.quantity,
        type: transactionData.type,
        transaction_type: transactionData.transactionType,
        reference_id: transactionData.referenceId,
        reference_type: transactionData.referenceType,
        condition: transactionData.condition,
        notes: transactionData.notes,
        created_by: transactionData.createdBy
      };
      const createdTransaction = await api.createSiteTransaction(apiTransactionData);
      const newTransaction = {
        id: createdTransaction.id,
        siteId: createdTransaction.site_id,
        assetId: createdTransaction.asset_id,
        assetName: createdTransaction.asset_name,
        quantity: createdTransaction.quantity,
        type: createdTransaction.type as 'in' | 'out',
        transactionType: createdTransaction.transaction_type as 'waybill' | 'return',
        referenceId: createdTransaction.reference_id,
        referenceType: createdTransaction.reference_type as 'waybill' | 'return_waybill' | 'quick_checkout',
        condition: createdTransaction.condition as 'good' | 'damaged' | 'missing',
        notes: createdTransaction.notes,
        createdAt: new Date(createdTransaction.created_at),
        createdBy: createdTransaction.created_by
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
