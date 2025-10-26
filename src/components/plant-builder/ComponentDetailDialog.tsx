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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Plus, ChevronDown, Trash2 } from "lucide-react";
import type { PlacedComponent, Connection } from "./Canvas";

type ComponentDetailDialogProps = {
  component: PlacedComponent;
  components: PlacedComponent[];
  connections: Connection[];
  open: boolean;
  onClose: () => void;
  onSave: (id: string, data: any, certifications: string[]) => void;
  onAddConnection: (from: string, to: string, type: string, reason: string) => void;
};

type Stream = {
  id: string;
  from: string;
  to: string;
  carrier: string;
  energyAmount: string;
  unit: string;
  additionalDetails: string;
  additionalExpanded: boolean;
};

const ComponentDetailDialog = ({
  component,
  components,
  connections,
  open,
  onClose,
  onSave,
  onAddConnection,
}: ComponentDetailDialogProps) => {
  const [formData, setFormData] = useState(component.data || {});
  const [certifications, setCertifications] = useState<string[]>(component.certifications || []);
  const [inputStreams, setInputStreams] = useState<Stream[]>([]);
  const [outputStreams, setOutputStreams] = useState<Stream[]>([]);

  const handleSave = () => {
    inputStreams.forEach((stream) => {
      if (stream.from && stream.carrier) {
        onAddConnection(stream.from, stream.to, stream.carrier, stream.additionalDetails);
      }
    });
    outputStreams.forEach((stream) => {
      if (stream.to && stream.carrier) {
        onAddConnection(stream.from, stream.to, stream.carrier, stream.additionalDetails);
      }
    });
    onSave(component.id, formData, certifications);
  };

  const addInputStream = () => {
    const newStream: Stream = {
      id: Date.now().toString(),
      from: "",
      to: component.id,
      carrier: "",
      energyAmount: "",
      unit: "",
      additionalDetails: "",
      additionalExpanded: false,
    };
    setInputStreams((prev) => [...prev, newStream]);
  };

  const addOutputStream = () => {
    const newStream: Stream = {
      id: Date.now().toString(),
      from: component.id,
      to: "",
      carrier: "",
      energyAmount: "",
      unit: "",
      additionalDetails: "",
      additionalExpanded: false,
    };
    setOutputStreams((prev) => [...prev, newStream]);
  };

  const updateStream = (
    streams: Stream[],
    setStreams: React.Dispatch<React.SetStateAction<Stream[]>>,
    id: string,
    field: keyof Omit<Stream, 'id' | 'additionalExpanded'>,
    value: string,
  ) => {
    setStreams((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  const toggleAdditional = (
    streams: Stream[],
    setStreams: React.Dispatch<React.SetStateAction<Stream[]>>,
    id: string,
  ) => {
    setStreams((prev) =>
      prev.map((s) => (s.id === id ? { ...s, additionalExpanded: !s.additionalExpanded } : s)),
    );
  };

  const removeStream = (
    id: string,
    isInput: boolean,
  ) => {
    if (isInput) {
      setInputStreams((prev) => prev.filter((s) => s.id !== id));
    } else {
      setOutputStreams((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleUploadCertification = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      // Simulate upload, in real app, upload to server and get URL
      const url = URL.createObjectURL(file);
      setCertifications((prev) => [...prev, url]);
    }
  };

  const inputs = connections.filter((conn) => conn.to === component.id);
  const outputs = connections.filter((conn) => conn.from === component.id);

  const getComponentName = (id: string) => {
    return components.find((c) => c.id === id)?.name || "Unknown";
  };

  const renderEquipmentForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Input Type</Label>
        <Select
          value={formData.inputType}
          onValueChange={(value) => setFormData({ ...formData, inputType: value })}
        >
          <SelectTrigger className="border-[#3c83f6]/30 focus:ring-[#3c83f6]">
            <SelectValue placeholder="Select input type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hydrogen">Hydrogen</SelectItem>
            <SelectItem value="electricity">Electricity</SelectItem>
            <SelectItem value="water">Water</SelectItem>
            <SelectItem value="co2">CO₂</SelectItem>
            <SelectItem value="biomass">Biomass</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Input Quantity</Label>
          <Input
            type="number"
            value={formData.inputQuantity || ""}
            onChange={(e) => setFormData({ ...formData, inputQuantity: e.target.value })}
            placeholder="0"
            className="border-[#3c83f6]/30 focus:ring-[#3c83f6]"
          />
        </div>
        <div className="space-y-2">
          <Label>Input Unit</Label>
          <Select
            value={formData.inputUnit}
            onValueChange={(value) => setFormData({ ...formData, inputUnit: value })}
          >
            <SelectTrigger className="border-[#3c83f6]/30 focus:ring-[#3c83f6]">
              <SelectValue placeholder="Unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MW">MW</SelectItem>
              <SelectItem value="MWel">MWel</SelectItem>
              <SelectItem value="nm3">Nm³/h</SelectItem>
              <SelectItem value="kt">kt/y</SelectItem>
              <SelectItem value="t">t/y</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Output Type</Label>
        <Select
          value={formData.outputType}
          onValueChange={(value) => setFormData({ ...formData, outputType: value })}
        >
          <SelectTrigger className="border-[#3c83f6]/30 focus:ring-[#3c83f6]">
            <SelectValue placeholder="Select output type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hydrogen">Hydrogen</SelectItem>
            <SelectItem value="methanol">Methanol</SelectItem>
            <SelectItem value="ammonia">Ammonia</SelectItem>
            <SelectItem value="diesel">Diesel</SelectItem>
            <SelectItem value="kerosene">Kerosene</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Output Quantity</Label>
          <Input
            type="number"
            value={formData.outputQuantity || ""}
            onChange={(e) => setFormData({ ...formData, outputQuantity: e.target.value })}
            placeholder="0"
            className="border-[#3c83f6]/30 focus:ring-[#3c83f6]"
          />
        </div>
        <div className="space-y-2">
          <Label>Output Unit</Label>
          <Select
            value={formData.outputUnit}
            onValueChange={(value) => setFormData({ ...formData, outputUnit: value })}
          >
            <SelectTrigger className="border-[#3c83f6]/30 focus:ring-[#3c83f6]">
              <SelectValue placeholder="Unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MW">MW</SelectItem>
              <SelectItem value="MWel">MWel</SelectItem>
              <SelectItem value="nm3">Nm³/h</SelectItem>
              <SelectItem value="kt">kt/y</SelectItem>
              <SelectItem value="t">t/y</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Efficiency (%)</Label>
        <Input
          type="number"
          value={formData.efficiency || ""}
          onChange={(e) => setFormData({ ...formData, efficiency: e.target.value })}
          placeholder="0-100"
          min="0"
          max="100"
          className="border-[#3c83f6]/30 focus:ring-[#3c83f6]"
        />
      </div>
      <div className="space-y-2">
        <Label>Manufacturer</Label>
        <Input
          value={formData.manufacturer || ""}
          onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
          placeholder="Enter manufacturer"
          className="border-[#3c83f6]/30 focus:ring-[#3c83f6]"
        />
      </div>
      <div className="space-y-2">
        <Label>Commercial Operating Date</Label>
        <Input
          type="date"
          value={formData.operatingDate || ""}
          onChange={(e) => setFormData({ ...formData, operatingDate: e.target.value })}
          className="border-[#3c83f6]/30 focus:ring-[#3c83f6]"
        />
      </div>
    </div>
  );

  const renderCarrierForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Fuel Type</Label>
        <Select
          value={formData.fuelType}
          onValueChange={(value) => setFormData({ ...formData, fuelType: value })}
        >
          <SelectTrigger className="border-[#3c83f6]/30 focus:ring-[#3c83f6]">
            <SelectValue placeholder="Select fuel type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hydrogen">Hydrogen</SelectItem>
            <SelectItem value="methanol">Methanol</SelectItem>
            <SelectItem value="ammonia">Ammonia</SelectItem>
            <SelectItem value="diesel">Diesel</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Fuel Class</Label>
        <Select
          value={formData.fuelClass}
          onValueChange={(value) => setFormData({ ...formData, fuelClass: value })}
        >
          <SelectTrigger className="border-[#3c83f6]/30 focus:ring-[#3c83f6]">
            <SelectValue placeholder="Select fuel class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rfnbo">RFNBO</SelectItem>
            <SelectItem value="advanced">Advanced Biofuels</SelectItem>
            <SelectItem value="annexIXA">Annex IX Part A</SelectItem>
            <SelectItem value="annexIXB">Annex IX Part B</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Temperature (°C)</Label>
          <Input
            type="number"
            value={formData.temperature || ""}
            onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
            placeholder="0"
            className="border-[#3c83f6]/30 focus:ring-[#3c83f6]"
          />
        </div>
        <div className="space-y-2">
          <Label>Pressure (bar)</Label>
          <Input
            type="number"
            value={formData.pressure || ""}
            onChange={(e) => setFormData({ ...formData, pressure: e.target.value })}
            placeholder="0"
            className="border-[#3c83f6]/30 focus:ring-[#3c83f6]"
          />
        </div>
      </div>
    </div>
  );

  const renderGateForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Gate Type</Label>
        <Select
          value={formData.gateType}
          onValueChange={(value) => setFormData({ ...formData, gateType: value })}
        >
          <SelectTrigger className="border-[#3c83f6]/30 focus:ring-[#3c83f6]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="input">Input</SelectItem>
            <SelectItem value="output">Output</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Product</Label>
        <Select
          value={formData.product}
          onValueChange={(value) => setFormData({ ...formData, product: value })}
        >
          <SelectTrigger className="border-[#3c83f6]/30 focus:ring-[#3c83f6]">
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hydrogen">Hydrogen</SelectItem>
            <SelectItem value="electricity">Electricity</SelectItem>
            <SelectItem value="water">Water</SelectItem>
            <SelectItem value="co2">CO₂</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Quantity</Label>
          <Input
            type="number"
            value={formData.quantity || ""}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            placeholder="0"
            className="border-[#3c83f6]/30 focus:ring-[#3c83f6]"
          />
        </div>
        <div className="space-y-2">
          <Label>Unit</Label>
          <Select
            value={formData.unit}
            onValueChange={(value) => setFormData({ ...formData, unit: value })}
          >
            <SelectTrigger className="border-[#3c83f6]/30 focus:ring-[#3c83f6]">
              <SelectValue placeholder="Unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="t/h">t/h</SelectItem>
              <SelectItem value="kWh/h">kWh/h</SelectItem>
              <SelectItem value="m3/h">m³/h</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {formData.gateType === "input" && (
        <>
          <div className="space-y-2">
            <Label>Source Type</Label>
            <Select
              value={formData.sourceType}
              onValueChange={(value) => setFormData({ ...formData, sourceType: value })}
            >
              <SelectTrigger className="border-[#3c83f6]/30 focus:ring-[#3c83f6]">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="ppa">PPA</SelectItem>
                <SelectItem value="spot">Spot Market</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Source Origin</Label>
            <Select
              value={formData.sourceOrigin}
              onValueChange={(value) => setFormData({ ...formData, sourceOrigin: value })}
            >
              <SelectTrigger className="border-[#3c83f6]/30 focus:ring-[#3c83f6]">
                <SelectValue placeholder="Select origin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wind">Wind</SelectItem>
                <SelectItem value="solar">Solar</SelectItem>
                <SelectItem value="hydro">Hydro</SelectItem>
                <SelectItem value="waste">Waste</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
      {formData.gateType === "output" && (
        <div className="space-y-2">
          <Label>End Use</Label>
          <Input
            value={formData.endUse || ""}
            onChange={(e) => setFormData({ ...formData, endUse: e.target.value })}
            placeholder="Enter end use"
            className="border-[#3c83f6]/30 focus:ring-[#3c83f6]"
          />
        </div>
      )}
    </div>
  );

  const renderStreamForm = (stream: Stream, isInput: boolean, streams: Stream[], setStreams: React.Dispatch<React.SetStateAction<Stream[]>>) => (
    <>
      <div className="flex items-end space-x-4 border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
        <div className="flex-1 space-y-2">
          <Label>{isInput ? "From" : "To"}</Label>
          <Select
            value={isInput ? stream.from : stream.to}
            onValueChange={(value) => updateStream(streams, setStreams, stream.id, isInput ? "from" : "to", value)}
          >
            <SelectTrigger className="border-[#3c83f6]/30 focus:ring-[#3c83f6]">
              <SelectValue placeholder="Select component" />
            </SelectTrigger>
            <SelectContent>
              {components
                .filter((c) => c.id !== component.id)
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-2">
          <Label>{isInput ? "To" : "From"}</Label>
          <Input value={component.name} disabled className="bg-gray-100 cursor-not-allowed border-[#3c83f6]/30" />
        </div>
        <div className="flex-1 space-y-2">
          <Label>Carrier</Label>
          <Select
            value={stream.carrier}
            onValueChange={(value) => updateStream(streams, setStreams, stream.id, "carrier", value)}
          >
            <SelectTrigger className="border-[#3c83f6]/30 focus:ring-[#3c83f6]">
              <SelectValue placeholder="Select carrier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hydrogen">Hydrogen</SelectItem>
              <SelectItem value="co2">CO₂</SelectItem>
              <SelectItem value="methanol">Methanol</SelectItem>
              <SelectItem value="ammonia">Ammonia</SelectItem>
              <SelectItem value="electricity">Electricity</SelectItem>
              <SelectItem value="water">Water</SelectItem>
              <SelectItem value="biomass">Biomass</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-2">
          <Label>Energy Amount</Label>
          <Input
            type="number"
            value={stream.energyAmount}
            onChange={(e) => updateStream(streams, setStreams, stream.id, "energyAmount", e.target.value)}
            placeholder="0"
            className="border-[#3c83f6]/30 focus:ring-[#3c83f6]"
          />
        </div>
        <div className="flex-1 space-y-2">
          <Label>Unit</Label>
          <Select
            value={stream.unit}
            onValueChange={(value) => updateStream(streams, setStreams, stream.id, "unit", value)}
          >
            <SelectTrigger className="border-[#3c83f6]/30 focus:ring-[#3c83f6]">
              <SelectValue placeholder="Unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MW">MW</SelectItem>
              <SelectItem value="MWel">MWel</SelectItem>
              <SelectItem value="nm3">Nm³/h</SelectItem>
              <SelectItem value="kt">kt/y</SelectItem>
              <SelectItem value="t">t/y</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-2">
          <Label>Details</Label>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-[#3c83f6]/30 hover:bg-[#3c83f6]/10 text-gray-700"
            onClick={() => toggleAdditional(streams, setStreams, stream.id)}
          >
            {stream.additionalExpanded ? "Hide" : "Show"}
            <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${stream.additionalExpanded ? 'rotate-180' : ''}`} />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeStream(stream.id, isInput)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {stream.additionalExpanded && (
        <div className="space-y-2 mb-4 pl-4">
          <Label>Additional Details</Label>
          <Textarea
            value={stream.additionalDetails}
            onChange={(e) => updateStream(streams, setStreams, stream.id, "additionalDetails", e.target.value)}
            placeholder="Enter additional details"
            className="border-[#3c83f6]/30 focus:ring-[#3c83f6] min-h-[80px]"
          />
        </div>
      )}
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{component.name}</DialogTitle>
          <DialogDescription>
            Configure the technical specifications for this {component.type} component
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {component.type === "equipment" && renderEquipmentForm()}
          {component.type === "carrier" && renderCarrierForm()}
          {component.type === "gate" && renderGateForm()}
        </div>
        <div className="space-y-4 mt-6">
          <h4 className="font-semibold">Ports Configuration</h4>
          <div className="space-y-6">
            <div>
              <h5 className="font-medium mb-4">Input Streams</h5>
              {inputStreams.map((stream) => renderStreamForm(stream, true, inputStreams, setInputStreams))}
              <Button
                variant="outline"
                className="w-full border-[#3c83f6]/30 hover:bg-[#3c83f6]/10 text-gray-700 font-semibold"
                onClick={addInputStream}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Input Stream
              </Button>
            </div>
            <div>
              <h5 className="font-medium mb-4">Output Streams</h5>
              {outputStreams.map((stream) => renderStreamForm(stream, false, outputStreams, setOutputStreams))}
              <Button
                variant="outline"
                className="w-full border-[#3c83f6]/30 hover:bg-[#3c83f6]/10 text-gray-700 font-semibold"
                onClick={addOutputStream}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Output Stream
              </Button>
            </div>
          </div>
        </div>
        <div className="space-y-4 mt-6">
          <h4 className="font-semibold">Inputs</h4>
          {inputs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No inputs</p>
          ) : (
            <ul className="space-y-2">
              {inputs.map((conn) => (
                <li key={conn.id} className="text-sm">
                  From: {getComponentName(conn.from)} ({conn.type || "Untitled"}) - Reason: {conn.reason || "N/A"}
                </li>
              ))}
            </ul>
          )}
          <h4 className="font-semibold">Outputs</h4>
          {outputs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No outputs</p>
          ) : (
            <ul className="space-y-2">
              {outputs.map((conn) => (
                <li key={conn.id} className="text-sm">
                  To: {getComponentName(conn.to)} ({conn.type || "Untitled"}) - Reason: {conn.reason || "N/A"}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-4 mt-6">
          <h4 className="font-semibold">Certifications</h4>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload Certification
              </Button>
              <input
                type="file"
                className="hidden"
                onChange={handleUploadCertification}
                accept=".pdf,.jpg,.png"
              />
            </label>
          </div>
          {certifications.length > 0 && (
            <ul className="space-y-2">
              {certifications.map((cert, index) => (
                <li key={index} className="text-sm">
                  <a href={cert} target="_blank" rel="noopener noreferrer">
                    Certification {index + 1}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Details</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComponentDetailDialog;