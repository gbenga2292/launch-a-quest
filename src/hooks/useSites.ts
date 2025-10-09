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
        const sitesData = apiSites.map(apiSite => ({
          id: apiSite.id,
          name: apiSite.name,
          location: apiSite.location || '',
          description: apiSite.description,
          clientName: apiSite.client_name,
          contactPerson: apiSite.contact_person,
          phone: apiSite.phone,
          services: [],
          status: apiSite.status as 'active' | 'inactive',
          createdAt: new Date(apiSite.created_at),
          updatedAt: new Date(apiSite.updated_at)
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
      const apiSiteData = {
        name: siteData.name,
        location: siteData.location,
        description: siteData.description,
        client_name: siteData.clientName,
        contact_person: siteData.contactPerson,
        phone: siteData.phone,
        status: siteData.status
      };
      const createdSite = await api.createSite(apiSiteData);
      const newSite = {
        id: createdSite.id,
        name: createdSite.name,
        location: createdSite.location || '',
        description: createdSite.description,
        clientName: createdSite.client_name,
        contactPerson: createdSite.contact_person,
        phone: createdSite.phone,
        services: [],
        status: createdSite.status as 'active' | 'inactive',
        createdAt: new Date(createdSite.created_at),
        updatedAt: new Date(createdSite.updated_at)
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
      const apiSiteData = {
        name: updatedSite.name,
        location: updatedSite.location,
        description: updatedSite.description,
        client_name: updatedSite.clientName,
        contact_person: updatedSite.contactPerson,
        phone: updatedSite.phone,
        status: updatedSite.status
      };
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
