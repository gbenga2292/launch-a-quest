import React, { useState, useEffect } from "react";
import { Site } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { logActivity } from "@/utils/activityLogger";
import { Save, X } from "lucide-react";

interface SiteFormProps {
  site?: Site | null;
  onSave: (site: Site) => void;
  onCancel: () => void;
  open: boolean;
}

const SiteForm = ({ site, onSave, onCancel, open }: SiteFormProps) => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [clientName, setClientName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [services, setServices] = useState<string[]>([]);

  const availableServices = [
    "Dewatering",
    "Waterproofing",
    "Tiling",
    "Sales, Repair and Maintenance"
  ];

  useEffect(() => {
    if (site) {
      setName(site.name);
      setLocation(site.location);
      setDescription(site.description || "");
      setClientName(site.clientName || "");
      setContactPerson(site.contactPerson || "");
      setPhone(site.phone || "");
      setStatus(site.status || "active");
      setServices(site.services || []);
    } else {
      setName("");
      setLocation("");
      setDescription("");
      setClientName("");
      setContactPerson("");
      setPhone("");
      setStatus("active");
      setServices([]);
    }
  }, [site]);

  const handleServiceChange = (service: string) => {
    setServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) {
      alert("Name and Location are required");
      return;
    }
    const newSite: Site = {
      id: site?.id || Date.now().toString(),
      name,
      location,
      description,
      clientName,
      contactPerson,
      phone,
      services,
      status,
      createdAt: site?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    onSave(newSite);

    // Log site creation if it's a new site
    if (!site) {
      logActivity({
        userId: 'current_user',
        userName: 'Admin',
        action: 'create',
        entity: 'site',
        entityId: newSite.id,
        details: `Added site ${newSite.name} at ${newSite.location} with services: ${newSite.services.join(', ') || 'none'}`
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={open ? () => {} : onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {site ? "Edit Site" : "Add New Site"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">Site Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter site name"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-sm font-medium">Location *</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Enter site location"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientName" className="text-sm font-medium">Client Name</Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="Enter client name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="contactPerson" className="text-sm font-medium">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={contactPerson}
                  onChange={e => setContactPerson(e.target.value)}
                  placeholder="Enter contact person"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="md:col-span-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Enter site description"
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="radio"
                    id="active"
                    value="active"
                    checked={status === "active"}
                    onChange={() => setStatus("active")}
                    className="rounded"
                  />
                  <Label htmlFor="active" className="text-sm">Active</Label>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="radio"
                    id="inactive"
                    value="inactive"
                    checked={status === "inactive"}
                    onChange={() => setStatus("inactive")}
                    className="rounded"
                  />
                  <Label htmlFor="inactive" className="text-sm">Inactive</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="md:col-span-2">
            <Label className="text-sm font-medium mb-3 block">Services Rendered</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableServices.map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={service}
                    checked={services.includes(service)}
                    onCheckedChange={() => handleServiceChange(service)}
                  />
                  <Label htmlFor={service} className="text-sm cursor-pointer">
                    {service.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                </div>
              ))}
            </div>
            {services.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">No services selected</p>
            )}
          </div>

          <DialogFooter className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {site ? "Update Site" : "Create Site"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SiteForm;
