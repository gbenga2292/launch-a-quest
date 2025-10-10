import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Site } from '@/types/asset';

export const useSites = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  // Load sites from API on mount
  useEffect(() => {
    const loadSites = async () => {
      try {
        setLoading(true);
        const apiSites = await api.getSites();
        const sitesData = apiSites.map(site => ({
          id: site.id,
          name: site.name,
          location: site.location || '',
          description: site.description,
          clientName: site.clientName,
          contactPerson: site.contactPerson,
          phone: site.phone,
          services: site.services || [],
          status: site.status as any,
          createdAt: site.createdAt,
          updatedAt: site.updatedAt,
        }));
        setSites(sitesData);
      } catch (error) {
        console.error('Failed to load sites:', error);
        toast({
          title: "Error",
          description: "Failed to load sites from server",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    loadSites();
  }, [toast]);

  const handleAddSite = async (siteData: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to add sites",
        variant: "destructive"
      });
      return;
    }
    try {
      const createdSite = await api.createSite({
        name: siteData.name,
        location: siteData.location,
        description: siteData.description,
        clientName: siteData.clientName,
        contactPerson: siteData.contactPerson,
        phone: siteData.phone,
        status: siteData.status
      });
      const newSite = {
        id: createdSite.id,
        name: createdSite.name,
        location: createdSite.location || '',
        description: createdSite.description,
        clientName: createdSite.clientName,
        contactPerson: createdSite.contactPerson,
        phone: createdSite.phone,
        services: createdSite.services || [],
        status: createdSite.status as any,
        createdAt: createdSite.createdAt,
        updatedAt: createdSite.updatedAt,
      };
      setSites(prev => [...prev, newSite]);
      toast({
        title: "Success",
        description: "Site added successfully",
      });
    } catch (error) {
      console.error('Failed to add site:', error);
      toast({
        title: "Error",
        description: "Failed to add site",
        variant: "destructive"
      });
    }
  };

  const handleSaveSite = async (updatedSite: Site) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to edit sites",
        variant: "destructive"
      });
      return;
    }
    try {
      await api.updateSite(updatedSite.id, {
        name: updatedSite.name,
        location: updatedSite.location,
        description: updatedSite.description,
        clientName: updatedSite.clientName,
        contactPerson: updatedSite.contactPerson,
        phone: updatedSite.phone,
        status: updatedSite.status
      });
      const siteWithUpdatedDate = {
        ...updatedSite,
        updatedAt: new Date()
      };
      setSites(prev =>
        prev.map(site => (site.id === updatedSite.id ? siteWithUpdatedDate : site))
      );
      toast({
        title: "Success",
        description: "Site updated successfully",
      });
    } catch (error) {
      console.error('Failed to update site:', error);
      toast({
        title: "Error",
        description: "Failed to update site",
        variant: "destructive"
      });
    }
  };

  const confirmDeleteSite = async (siteId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to delete sites",
        variant: "destructive"
      });
      return;
    }
    try {
      await api.deleteSite(siteId);
      setSites(prev => prev.filter(site => site.id !== siteId));
      toast({
        title: "Success",
        description: "Site deleted successfully",
      });
    } catch (error) {
      console.error('Failed to delete site:', error);
      toast({
        title: "Error",
        description: "Failed to delete site",
        variant: "destructive"
      });
    }
  };

  return {
    sites,
    loading,
    handleAddSite,
    handleSaveSite,
    confirmDeleteSite,
    setSites
  };
};
