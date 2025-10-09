import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api, Employee } from '@/services/api';
import { logActivity } from '@/utils/activityLogger';

export const useEmployees = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        const dbEmployees = await api.getEmployees();
        setEmployees(dbEmployees.map(emp => ({
          ...emp,
          id: emp.id.toString(),
          status: emp.status as 'active' | 'inactive',
          createdAt: new Date(),
          updatedAt: new Date()
        })));
      } catch (error) {
        console.error('Failed to load employees:', error);
        toast({
          title: "Error",
          description: "Failed to load employees",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    loadEmployees();
  }, [toast]);

  const addEmployee = async (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newEmployee = await api.createEmployee({
        name: employee.name,
        role: employee.role,
        phone: employee.phone,
        email: employee.email,
        status: employee.status
      });
      setEmployees(prev => [...prev, { ...newEmployee, id: newEmployee.id.toString(), status: newEmployee.status as 'active' | 'inactive', createdAt: new Date(), updatedAt: new Date() }]);
      logActivity({
        userId: 'current_user',
        userName: 'Admin',
        action: 'add_employee',
        entity: 'employee',
        entityId: newEmployee.id,
        details: `Added employee ${newEmployee.name} as ${newEmployee.role}`
      });
      toast({
        title: "Employee Added",
        description: `${newEmployee.name} has been added successfully.`
      });
    } catch (error) {
      console.error('Failed to add employee:', error);
      toast({
        title: "Add Failed",
        description: "Failed to add employee. Please try again.",
        variant: "destructive"
      });
    }
  };

  const saveEmployee = async (employee: Employee) => {
    try {
      await api.updateEmployee(employee.id, {
        name: employee.name,
        role: employee.role,
        phone: employee.phone,
        email: employee.email,
        status: employee.status
      });
      setEmployees(prev => prev.map(emp =>
        emp.id === employee.id
          ? { ...employee, updatedAt: new Date() }
          : emp
      ));
      toast({
        title: "Employee Updated",
        description: `${employee.name} has been updated successfully.`
      });
    } catch (error) {
      console.error('Failed to update employee:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update employee. Please try again.",
        variant: "destructive"
      });
    }
  };

  const removeEmployee = async (id: string) => {
    try {
      await api.deleteEmployee(id);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      toast({
        title: "Employee Removed",
        description: "Employee has been removed successfully."
      });
    } catch (error) {
      console.error('Failed to remove employee:', error);
      toast({
        title: "Remove Failed",
        description: "Failed to remove employee. Please try again.",
        variant: "destructive"
      });
    }
  };

  return { employees, loading, addEmployee, saveEmployee, removeEmployee, setEmployees };
};