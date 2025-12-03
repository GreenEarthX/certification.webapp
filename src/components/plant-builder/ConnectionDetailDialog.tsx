'use client';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Connection, PlacedComponent } from "../../app/plant-builder/types"; // CORRECT PATH

type ConnectionDetailDialogProps = {
  connection: Connection;
  components: PlacedComponent[];
  open: boolean;
  onClose: () => void;
  onSave: (id: string, type: string, reason: string, data: any) => void;
  onDelete: (id: string) => void; 
};

const ConnectionDetailDialog = ({
  connection,
  components,
  open,
  onClose,
  onSave,
  onDelete,
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
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Connection Details
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            From: <span className="font-medium">{getComponentName(connection.from)}</span> →{" "}
            <span className="font-medium">{getComponentName(connection.to)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="connection-type">Connection Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="connection-type">
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
            <Label htmlFor="connection-reason">Reason</Label>
            <Input
              id="connection-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for connection"
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between gap-3 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              onDelete(connection.id);
            }}
            className="border-red-600 text-red-600 hover:bg-red-50"
          >
            Delete Connection
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save
            </Button>
          </div>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};

export default ConnectionDetailDialog;