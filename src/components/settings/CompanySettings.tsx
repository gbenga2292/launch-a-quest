import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CompanySettings as CompanySettingsType, Activity } from "@/types/asset";
import { Upload, Save, Building, Phone, Globe, Download, Trash2, Activity as ActivityIcon, Settings, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import { Switch } from "@/components/ui/switch";
import { logActivity, exportActivitiesToTxt, getActivities } from "@/utils/activityLogger";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useEmployees } from "@/hooks/useEmployees";
import { useVehicles } from "@/hooks/useVehicles";
import { useBackupRestore } from "@/hooks/useBackupRestore";

export const CompanySettings = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { companySettings, loading: loadingSettings, handleSaveCompanySettings, setSettings: setCompanySettings } = useCompanySettings();
  const { employees, loading: loadingEmployees, addEmployee, removeEmployee, setEmployees } = useEmployees();
  const { vehicles, loading: loadingVehicles, addVehicle, removeVehicle, setVehicles } = useVehicles();
  const { isLoading, error, backupProgress, backupOptions, selectedBackupItems, setSelectedBackupItems, handleBackup, handleRestore } = useBackupRestore(companySettings);

  const [formData, setFormData] = useState<CompanySettingsType>(companySettings);
  const [logoPreview, setLogoPreview] = useState<string | null>(companySettings.logo || null);
  const [employeeName, setEmployeeName] = useState("");
  const [employeeRole, setEmployeeRole] = useState("driver");
  const [vehicleName, setVehicleName] = useState("");
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);

  const [showActivityLog, setShowActivityLog] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    setFormData(companySettings);
    setLogoPreview(companySettings.logo || null);
  }, [companySettings]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const fetchedActivities = await getActivities();
        setActivities(fetchedActivities);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      }
    };
    fetchActivities();
  }, []);

  const handleClearActivities = () => {
    localStorage.removeItem('activities');
    setActivities([]);
    setShowActivityLog(false);
    toast({
      title: "Activity Log Cleared",
      description: "All activity logs have been deleted.",
      variant: "destructive"
    });
    logActivity({
      userId: 'current_user',
      userName: 'Admin',
      action: 'clear',
      entity: 'activities',
      details: 'Cleared all activity logs'
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        setFormData(prev => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddEmployee = () => {
    if (!employeeName.trim()) return;
    addEmployee({ name: employeeName.trim(), role: employeeRole, status: 'active' });
    setEmployeeName("");
    setEmployeeRole("driver");
  };

  const handleAddVehicle = () => {
    if (!vehicleName.trim()) return;
    addVehicle(vehicleName.trim());
    setVehicleName("");
  };

  const handleSave = () => {
    handleSaveCompanySettings(formData);
  };

  const [isLoadingReset, setIsLoadingReset] = useState(false);
  
  const handleReset = async () => {
    setIsLoadingReset(true);
    try {
      const { api } = await import('@/services/api');
      await api.resetDatabase();

      setEmployees([]);
      setVehicles([]);
      const defaultSettings: CompanySettingsType = {
        companyName: "Dewatering Construction Ltd",
        logo: undefined,
        address: "",
        phone: "",
        email: "",
        website: "",
        currency: "USD",
        dateFormat: "dd/MM/yyyy" as "MM/dd/yyyy" | "dd/MM/yyyy" | "yyyy-MM-dd",
        theme: "light" as "light" | "dark" | "system",
        notifications: { email: true, push: true }
      };
      setCompanySettings(defaultSettings);

      localStorage.removeItem('assets');
      localStorage.removeItem('waybills');
      localStorage.removeItem('quickCheckouts');
      localStorage.removeItem('sites');
      localStorage.removeItem('siteTransactions');
      localStorage.removeItem('employees');
      localStorage.removeItem('vehicles');
      localStorage.removeItem('companySettings');

      toast({
        title: "Data Reset",
        description: "All data has been cleared successfully."
      });
    } catch (err) {
      toast({
        title: "Reset Failed",
        description: "An error occurred while resetting data.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingReset(false);
      setIsResetOpen(false);
    }
  };

  const handleRestoreConfirm = () => {
    if (restoreFile) {
      handleRestore(restoreFile, (backupData) => {
        if (backupData.employees) {
          setEmployees(backupData.employees.map((emp: any) => ({
            id: emp.id.toString(),
            name: emp.name,
            role: emp.role,
            phone: emp.phone || '',
            email: emp.email || '',
            status: emp.status === 'active' ? 'active' : 'inactive',
            createdAt: new Date(emp.createdAt),
            updatedAt: new Date(emp.updatedAt)
          })));
        }
        if (backupData.vehicles) {
          setVehicles(backupData.vehicles || []);
        }
        if (backupData.company_settings && backupData.company_settings.length > 0) {
          const settings = backupData.company_settings[0];
          const restoredSettings = { ...companySettings, ...settings };
          setCompanySettings(restoredSettings);
        }
      });
    }
    setIsRestoreOpen(false);
    setRestoreFile(null);
  };

  const handleBackupConfirm = () => {
    handleBackup(selectedBackupItems);
    setIsBackupDialogOpen(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.json')) {
      setRestoreFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid JSON backup file.",
        variant: "destructive"
      });
    }
  };

  const currentUser = localStorage.getItem('currentUser') || 'Admin';
  const isAdmin = currentUser === 'Admin';

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Company Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure your company information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Enter company name"
                className="border-0 bg-muted/50 focus:bg-background transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter company address"
                className="border-0 bg-muted/50 focus:bg-background transition-all duration-300"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  className="border-0 bg-muted/50 focus:bg-background transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Website
                </Label>
                <Input
                  id="website"
                  value={formData.website || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://www.company.com"
                  className="border-0 bg-muted/50 focus:bg-background transition-all duration-300"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Logo */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Company Logo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              {logoPreview ? (
                <div className="w-32 h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg overflow-hidden">
                  <img
                    src={logoPreview}
                    alt="Company Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {logoPreview ? 'Change Logo' : 'Upload Logo'}
                </Button>
                {logoPreview && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setLogoPreview(null);
                      setFormData(prev => ({ ...prev, logo: undefined }));
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>

              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Employee Management */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Employees
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Employee Name"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="flex-1"
              />
              <Select
                value={employeeRole}
                onValueChange={(value) => setEmployeeRole(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="driver">Driver</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddEmployee}>Add</Button>
            </div>
            <div>
              {loadingEmployees ? (
                <p>Loading employees...</p>
              ) : employees.length === 0 ? (
                <p className="text-muted-foreground">No employees added yet.</p>
              ) : (
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {employees.map(emp => (
                    <li key={emp.id} className="flex justify-between items-center border p-2 rounded">
                      <span>{emp.name} ({emp.role})</span>
                      <Button size="sm" variant="destructive" onClick={() => removeEmployee(emp.id)}>Remove</Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Management */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Vehicle Name/Plate"
                value={vehicleName}
                onChange={(e) => setVehicleName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddVehicle}>Add</Button>
            </div>
            <div>
              {loadingVehicles ? (
                <p>Loading vehicles...</p>
              ) : vehicles.length === 0 ? (
                <p className="text-muted-foreground">No vehicles added yet.</p>
              ) : (
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {vehicles.map((vehicle, index) => (
                    <li key={index} className="flex justify-between items-center border p-2 rounded">
                      <span>{vehicle}</span>
                      <Button size="sm" variant="destructive" onClick={() => removeVehicle(vehicle)}>Remove</Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Theme Settings */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Theme Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Toggle between light and dark themes</p>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Backup Data</Label>
              <p className="text-sm text-muted-foreground">Backup all your data to a JSON file.</p>
            </div>
            <Button onClick={() => setIsBackupDialogOpen(true)}>Backup</Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Restore Data</Label>
              <p className="text-sm text-muted-foreground">Restore your data from a JSON file.</p>
            </div>
            <Button onClick={() => setIsRestoreOpen(true)}>Restore</Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Reset Data</Label>
              <p className="text-sm text-muted-foreground">Clear all data and reset the application.</p>
            </div>
            <AlertDialog open={isResetOpen} onOpenChange={setIsResetOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Reset</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Dialog open={showActivityLog} onOpenChange={setShowActivityLog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <ActivityIcon className="h-4 w-4" />
              View Activity Log
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Activity Log</DialogTitle>
              <DialogDescription>
                View all system activities and user actions. {activities.length} total activities.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <Button variant="outline" onClick={() => {}} size="sm">
                  <Download className="h-3 w-3 mr-1" />
                  Export TXT
                </Button>
                <AlertDialog open={isClearConfirmOpen} onOpenChange={setIsClearConfirmOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={!isAdmin}>
                      <Trash2 className="h-3 w-3 mr-1" />
                      Clear Log
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear Activity Log</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all activity logs. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearActivities} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Clear Log
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              {activities.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  No activities recorded yet.
                </div>
              ) : (
                <div className="overflow-auto max-h-[calc(80vh-200px)]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Entity</TableHead>
                        <TableHead>Entity ID</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...activities].reverse().map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell className="font-mono text-xs">
                            {new Date(activity.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>{activity.userName}</TableCell>
                          <TableCell className="capitalize">{activity.action}</TableCell>
                          <TableCell className="capitalize">{activity.entity}</TableCell>
                          <TableCell>{activity.entityId || '-'}</TableCell>
                          <TableCell className="max-w-xs truncate">{activity.details}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        <Button
          onClick={handleSave}
          className="bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-medium"
          disabled={isLoading || loadingSettings || loadingEmployees || loadingVehicles}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};