import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api, CompanySettings as APICompanySettings } from '@/services/api';
import { CompanySettings } from '@/types/asset';

// Helper functions to convert between API types and local types
const apiCompanySettingsToCompanySettings = (apiSettings: APICompanySettings): CompanySettings => ({
  companyName: apiSettings.company_name || '',
  logo: apiSettings.logo,
  address: apiSettings.address || '',
  phone: apiSettings.phone || '',
  email: apiSettings.email || '',
  website: apiSettings.website,
  currency: apiSettings.currency || 'USD',
  dateFormat: (apiSettings.date_format as 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd') || 'MM/dd/yyyy',
  theme: (apiSettings.theme as 'light' | 'dark' | 'system') || 'light',
  notifications: {
    email: apiSettings.notifications_email || true,
    push: apiSettings.notifications_push || true
  }
});

const companySettingsToAPICompanySettings = (settings: CompanySettings): Partial<Omit<APICompanySettings, 'id' | 'created_at' | 'updated_at'>> => ({
  company_name: settings.companyName,
  logo: settings.logo,
  address: settings.address,
  phone: settings.phone,
  email: settings.email,
  website: settings.website,
  currency: settings.currency,
  date_format: settings.dateFormat,
  theme: settings.theme,
  notifications_email: settings.notifications.email,
  notifications_push: settings.notifications.push
});

export const useCompanySettings = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyName: '',
    logo: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    currency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    theme: 'light',
    notifications: {
      email: true,
      push: true
    }
  });
  const [loading, setLoading] = useState(true);

  // Load company settings from API on mount
  useEffect(() => {
    const loadCompanySettings = async () => {
      try {
        setLoading(true);
        const apiSettings = await api.getCompanySettings();
        const settingsData = apiCompanySettingsToCompanySettings(apiSettings);
        setCompanySettings(settingsData);
      } catch (error) {
        console.error('Failed to load company settings:', error);
        // Don't show error toast for company settings as they might not exist yet
        // The default values will be used instead
      } finally {
        setLoading(false);
      }
    };
    loadCompanySettings();
  }, [toast]);

  const handleSaveCompanySettings = async (updatedSettings: CompanySettings) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to update company settings",
        variant: "destructive"
      });
      return;
    }
    try {
      const apiSettingsData = companySettingsToAPICompanySettings(updatedSettings);
      await api.updateCompanySettings(apiSettingsData);
      setCompanySettings(updatedSettings);
      toast({
        title: "Success",
        description: "Company settings updated successfully",
      });
    } catch (error) {
      console.error('Failed to update company settings:', error);
      toast({
        title: "Error",
        description: "Failed to update company settings",
        variant: "destructive"
      });
    }
  };

  const setSettings = (settings: CompanySettings) => {
    setCompanySettings(settings);
  };

  return {
    companySettings,
    loading,
    handleSaveCompanySettings,
    setSettings
  };
};
