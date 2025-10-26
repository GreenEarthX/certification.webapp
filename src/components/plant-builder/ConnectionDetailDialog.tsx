import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Connection, PlacedComponent } from "./Canvas";

type ConnectionDetailDialogProps = {
  connection: Connection;
  components: PlacedComponent[];
  open: boolean;
  onClose: () => void;
  onSave: (id: string, type: string, reason: string, data: any) => void;
};

const ConnectionDetailDialog = ({
  connection,
  components,
  open,
  onClose,
  onSave,
}: ConnectionDetailDialogProps) => {
  const [type, setType] = useState(connection.type || "");
  const [reason, setReason] = useState(connection.reason || "");
  const [formData, setFormData] = useState(connection.data || {});

  const handleSave = () => {
    onSave(connection.id, type, reason, formData);
  };

  const getComponentName = (id: string) => {
    return components.find((c) => c.id === id)?.name || "Unknown";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Connection Details</DialogTitle>
          <DialogDescription>
            From: {getComponentName(connection.from)} to {getComponentName(connection.to)}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>Connection Type</Label>
            <Select
              value={type}
              onValueChange={setType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select connection type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hydrogen">Hydrogen (H₂)</SelectItem>
                <SelectItem value="co2">Carbon Dioxide (CO₂)</SelectItem>
                <SelectItem value="methanol">Methanol (CH₃OH)</SelectItem>
                <SelectItem value="ammonia">Ammonia (NH₃)</SelectItem>
                <SelectItem value="electricity">Electricity</SelectItem>
                <SelectItem value="water">Water (H₂O)</SelectItem>
                <SelectItem value="biomass">Biomass</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for connection"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectionDetailDialog;