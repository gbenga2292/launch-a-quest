import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api, Site as APISite } from '@/services/api';
import { Site } from '@/types/asset';

// Helper functions to convert between API types and local types
const apiSiteToSite = (apiSite: APISite): Site => ({
  id: apiSite.id,
  name: apiSite.name,
  location: apiSite.location || '',
  description: apiSite.description,
  clientName: apiSite.client_name,
  contactPerson: apiSite.contact_person,
  phone: apiSite.phone,
  services: [],
  status: apiSite.status as any,
  createdAt: new Date(apiSite.created_at),
  updatedAt: new Date(apiSite.updated_at)
});

const siteToAPISite = (site: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>): Omit<APISite, 'id' | 'created_at' | 'updated_at'> => ({
  name: site.name,
  location: site.location,
  description: site.description,
  client_name: site.clientName,
  contact_person: site.contactPerson,
  phone: site.phone,
  status: site.status
});

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
        const sitesData = apiSites.map(apiSiteToSite);
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
      const apiSiteData = siteToAPISite(siteData);
      const createdSite = await api.createSite(apiSiteData);
      const newSite = apiSiteToSite(createdSite);
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
      const apiSiteData = siteToAPISite(updatedSite);
      await api.updateSite(updatedSite.id, apiSiteData);
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
