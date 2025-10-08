import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api, Vehicle } from '@/services/api';
import { logActivity } from '@/utils/activityLogger';

export const useVehicles = () => {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setLoading(true);
        const dbVehicles = await api.getVehicles();
        setVehicles(dbVehicles.map(v => v.name));
      } catch (error) {
        console.error('Failed to load vehicles:', error);
        toast({
          title: "Error",
          description: "Failed to load vehicles",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    loadVehicles();
  }, [toast]);

  const addVehicle = async (vehicleName: string) => {
    try {
      const newVehicle = await api.createVehicle({ name: vehicleName });
      setVehicles(prev => [...prev, newVehicle.name]);
      logActivity({
        userId: 'current_user',
        userName: 'Admin',
        action: 'create',
        entity: 'vehicle',
        details: `Added vehicle ${newVehicle.name}`
      });
      toast({
        title: "Vehicle Added",
        description: `${newVehicle.name} has been added successfully.`
      });
    } catch (error) {
      console.error('Failed to add vehicle:', error);
      toast({
        title: "Add Failed",
        description: "Failed to add vehicle. Please try again.",
        variant: "destructive"
      });
    }
  };

  const removeVehicle = async (vehicleName: string) => {
    try {
      const allVehicles = await api.getVehicles();
      const vehicle = allVehicles.find(v => v.name === vehicleName);
      if (!vehicle) {
        throw new Error('Vehicle not found');
      }
      await api.deleteVehicle(vehicle.id);
      setVehicles(prev => prev.filter(v => v !== vehicleName));
      toast({
        title: "Vehicle Removed",
        description: `${vehicleName} has been removed successfully.`
      });
    } catch (error) {
      console.error('Failed to remove vehicle:', error);
      toast({
        title: "Remove Failed",
        description: "Failed to remove vehicle. Please try again.",
        variant: "destructive"
      });
    }
  };

  return { vehicles, loading, addVehicle, removeVehicle, setVehicles };
};