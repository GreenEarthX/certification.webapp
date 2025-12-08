'use client';

import { useEffect } from "react"; // ← THIS KILLS DARK MODE
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Plus, ChevronDown, Trash2 } from "lucide-react";
import type { PlacedComponent, Connection } from "../../app/plant-builder/types";

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
  // FORCE LIGHT MODE — NO DARK MODE ALLOWED HERE
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

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
    setInputStreams((prev) => [...prev, {
      id: Date.now().toString(),
      from: "",
      to: component.id,
      carrier: "",
      energyAmount: "",
      unit: "",
      additionalDetails: "",
      additionalExpanded: false,
    }]);
  };

  const addOutputStream = () => {
    setOutputStreams((prev) => [...prev, {
      id: Date.now().toString(),
      from: component.id,
      to: "",
      carrier: "",
      energyAmount: "",
      unit: "",
      additionalDetails: "",
      additionalExpanded: false,
    }]);
  };

  const updateStream = (
    streams: Stream[],
    setStreams: React.Dispatch<React.SetStateAction<Stream[]>>,
    id: string,
    field: keyof Omit<Stream, "id" | "additionalExpanded">,
    value: string
  ) => {
    setStreams((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const toggleAdditional = (
    streams: Stream[],
    setStreams: React.Dispatch<React.SetStateAction<Stream[]>>,
    id: string
  ) => {
    setStreams((prev) =>
      prev.map((s) => (s.id === id ? { ...s, additionalExpanded: !s.additionalExpanded } : s))
    );
  };

  const removeStream = (id: string, isInput: boolean) => {
    if (isInput) {
      setInputStreams((prev) => prev.filter((s) => s.id !== id));
    } else {
      setOutputStreams((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleUploadCertification = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setCertifications((prev) => [...prev, url]);
    }
  };

  const inputs = connections.filter((conn) => conn.to === component.id);
  const outputs = connections.filter((conn) => conn.from === component.id);

  const getComponentName = (id: string) => {
    return components.find((c) => c.id === id)?.name || "Unknown";
  };

  // Reusable form renders with forced white background
  const renderEquipmentForm = () => (
    <div className="space-y-4">
      {/* All selects & inputs forced white */}
      <div><Label>Input Type</Label><Select value={formData.inputType} onValueChange={(v) => setFormData({ ...formData, inputType: v })}><SelectTrigger className="bg-white border-gray-300"><SelectValue placeholder="Select input type" /></SelectTrigger><SelectContent className="bg-white border-gray-300">{"hydrogen,electricity,water,co2,biomass".split(",").map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Input Quantity</Label><Input type="number" value={formData.inputQuantity || ""} onChange={(e) => setFormData({ ...formData, inputQuantity: e.target.value })} placeholder="0" className="bg-white" /></div>
        <div><Label>Input Unit</Label><Select value={formData.inputUnit} onValueChange={(v) => setFormData({ ...formData, inputUnit: v })}><SelectTrigger className="bg-white border-gray-300"><SelectValue placeholder="Unit" /></SelectTrigger><SelectContent className="bg-white border-gray-300">{"MW,MWel,nm3,kt,t".split(",").map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div><Label>Output Type</Label><Select value={formData.outputType} onValueChange={(v) => setFormData({ ...formData, outputType: v })}><SelectTrigger className="bg-white border-gray-300"><SelectValue placeholder="Select output type" /></SelectTrigger><SelectContent className="bg-white border-gray-300">{"hydrogen,methanol,ammonia,diesel,kerosene".split(",").map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Output Quantity</Label><Input type="number" value={formData.outputQuantity || ""} onChange={(e) => setFormData({ ...formData, outputQuantity: e.target.value })} placeholder="0" className="bg-white" /></div>
        <div><Label>Output Unit</Label><Select value={formData.outputUnit} onValueChange={(v) => setFormData({ ...formData, outputUnit: v })}><SelectTrigger className="bg-white border-gray-300"><SelectValue placeholder="Unit" /></SelectTrigger><SelectContent className="bg-white border-gray-300">{"MW,MWel,nm3,kt,t".split(",").map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div><Label>Efficiency (%)</Label><Input type="number" value={formData.efficiency || ""} onChange={(e) => setFormData({ ...formData, efficiency: e.target.value })} placeholder="0-100" min="0" max="100" className="bg-white" /></div>
      <div><Label>Manufacturer</Label><Input value={formData.manufacturer || ""} onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })} placeholder="Enter manufacturer" className="bg-white" /></div>
      <div><Label>Commercial Operating Date</Label><Input type="date" value={formData.operatingDate || ""} onChange={(e) => setFormData({ ...formData, operatingDate: e.target.value })} className="bg-white" /></div>
    </div>
  );

  const renderCarrierForm = () => (
    <div className="space-y-4">
      <div><Label>Fuel Type</Label><Select value={formData.fuelType} onValueChange={(v) => setFormData({ ...formData, fuelType: v })}><SelectTrigger className="bg-white border-gray-300"><SelectValue placeholder="Select fuel type" /></SelectTrigger><SelectContent className="bg-white border-gray-300">{"hydrogen,methanol,ammonia,diesel".split(",").map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Fuel Class</Label><Select value={formData.fuelClass} onValueChange={(v) => setFormData({ ...formData, fuelClass: v })}><SelectTrigger className="bg-white border-gray-300"><SelectValue placeholder="Select fuel class" /></SelectTrigger><SelectContent className="bg-white border-gray-300">{"rfnbo,advanced,annexIXA,annexIXB".split(",").map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Temperature (°C)</Label><Input type="number" value={formData.temperature ?? ""} onChange={(e) => setFormData({ ...formData, temperature: e.target.value === "" ? undefined : Number(e.target.value) })} placeholder="0" className="bg-white" /></div>
        <div><Label>Pressure (bar)</Label><Input type="number" value={formData.pressure ?? ""} onChange={(e) => setFormData({ ...formData, pressure: e.target.value === "" ? undefined : Number(e.target.value) })} placeholder="0" className="bg-white" /></div>
      </div>
    </div>
  );

  const renderGateForm = () => (
    <div className="space-y-4">
      <div><Label>Gate Type</Label><Select value={formData.gateType} onValueChange={(v) => setFormData({ ...formData, gateType: v })}><SelectTrigger className="bg-white border-gray-300"><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent className="bg-white border-gray-300">{"input,output".split(",").map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Product</Label><Select value={formData.product} onValueChange={(v) => setFormData({ ...formData, product: v })}><SelectTrigger className="bg-white border-gray-300"><SelectValue placeholder="Select product" /></SelectTrigger><SelectContent className="bg-white border-gray-300">{"hydrogen,electricity,water,co2".split(",").map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Quantity</Label><Input type="number" value={formData.quantity || ""} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} placeholder="0" className="bg-white" /></div>
        <div><Label>Unit</Label><Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}><SelectTrigger className="bg-white border-gray-300"><SelectValue placeholder="Unit" /></SelectTrigger><SelectContent className="bg-white border-gray-300">{"t/h,kWh/h,m3/h".split(",").map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
      </div>
      {formData.gateType === "input" && (
        <>
          <div><Label>Source Type</Label><Select value={formData.sourceType} onValueChange={(v) => setFormData({ ...formData, sourceType: v })}><SelectTrigger className="bg-white border-gray-300"><SelectValue placeholder="Select source" /></SelectTrigger><SelectContent className="bg-white border-gray-300">{"grid,ppa,spot".split(",").map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Source Origin</Label><Select value={formData.sourceOrigin} onValueChange={(v) => setFormData({ ...formData, sourceOrigin: v })}><SelectTrigger className="bg-white border-gray-300"><SelectValue placeholder="Select origin" /></SelectTrigger><SelectContent className="bg-white border-gray-300">{"wind,solar,hydro,waste".split(",").map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
        </>
      )}
      {formData.gateType === "output" && (
        <div><Label>End Use</Label><Input value={formData.endUse || ""} onChange={(e) => setFormData({ ...formData, endUse: e.target.value })} placeholder="Enter end use" className="bg-white" /></div>
      )}
    </div>
  );

  const renderStreamForm = (stream: Stream, isInput: boolean, streams: Stream[], setStreams: React.Dispatch<React.SetStateAction<Stream[]>>) => (
    <div key={stream.id} className="flex items-end gap-3 pb-3 mb-3 border-b last:border-0">
      <div className="flex-1">
        <Label>{isInput ? "From" : "To"}</Label>
        <Select value={isInput ? stream.from : stream.to} onValueChange={(v) => updateStream(streams, setStreams, stream.id, isInput ? "from" : "to", v)}>
          <SelectTrigger className="bg-white border-gray-300"><SelectValue placeholder="Select component" /></SelectTrigger>
          <SelectContent className="bg-white border-gray-300">
            {components.filter((c) => c.id !== component.id).map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <Label>{isInput ? "To" : "From"}</Label>
        <Input value={component.name} disabled className="bg-gray-100" />
      </div>
      <div className="flex-1">
        <Label>Carrier</Label>
        <Select value={stream.carrier} onValueChange={(v) => updateStream(streams, setStreams, stream.id, "carrier", v)}>
          <SelectTrigger className="bg-white border-gray-300"><SelectValue placeholder="Select carrier" /></SelectTrigger>
          <SelectContent className="bg-white border-gray-300">
            {"hydrogen,co2,methanol,ammonia,electricity,water,biomass".split(",").map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <Label>Energy Amount</Label>
        <Input type="number" value={stream.energyAmount} onChange={(e) => updateStream(streams, setStreams, stream.id, "energyAmount", e.target.value)} placeholder="0" className="bg-white" />
      </div>
      <div className="flex-1">
        <Label>Unit</Label>
        <Select value={stream.unit} onValueChange={(v) => updateStream(streams, setStreams, stream.id, "unit", v)}>
          <SelectTrigger className="bg-white border-gray-300"><SelectValue placeholder="Unit" /></SelectTrigger>
          <SelectContent className="bg-white border-gray-300">
            {"MW,MWel,nm3,kt,t".split(",").map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <Label>Details</Label>
        <Button variant="outline" className="w-full" onClick={() => toggleAdditional(streams, setStreams, stream.id)}>
          {stream.additionalExpanded ? "Hide" : "Show"}
          <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${stream.additionalExpanded ? "rotate-180" : ""}`} />
        </Button>
      </div>
      {/* RED TRASH BUTTON — ALWAYS RED + WHITE TEXT */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => removeStream(stream.id, isInput)}
        className="text-white bg-red-600 hover:bg-red-700 rounded-lg"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      {stream.additionalExpanded && (
        <div className="col-span-full ml-4 mt-2">
          <Label>Additional Details</Label>
          <Textarea
            value={stream.additionalDetails}
            onChange={(e) => updateStream(streams, setStreams, stream.id, "additionalDetails", e.target.value)}
            placeholder="Enter additional details"
            className="min-h-20 bg-white"
          />
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 bg-white text-black">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{component.name}</DialogTitle>
          <DialogDescription>
            Configure the technical specifications for this {component.type} component
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {component.type === "equipment" && renderEquipmentForm()}
          {component.type === "carrier" && renderCarrierForm()}
          {component.type === "gate" && renderGateForm()}
        </div>

        {/* Streams Section */}
        <div className="mt-8 border-t pt-6">
          <h4 className="font-semibold text-lg mb-4">Ports Configuration</h4>
          <div className="space-y-6">
            <div>
              <h5 className="font-medium mb-3">Input Streams</h5>
              <div className="space-y-4">
                {inputStreams.map((stream) => renderStreamForm(stream, true, inputStreams, setInputStreams))}
                <Button variant="outline" className="w-full border-gray-300" onClick={addInputStream}>
                  <Plus className="h-4 w-4 mr-2" /> Add Input Stream
                </Button>
              </div>
            </div>
            <div>
              <h5 className="font-medium mb-3">Output Streams</h5>
              <div className="space-y-4">
                {outputStreams.map((stream) => renderStreamForm(stream, false, outputStreams, setOutputStreams))}
                <Button variant="outline" className="w-full border-gray-300" onClick={addOutputStream}>
                  <Plus className="h-4 w-4 mr-2" /> Add Output Stream
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Existing Connections */}
        <div className="mt-8 border-t pt-6 space-y-4">
          <div>
            <h4 className="font-semibold text-lg">Inputs</h4>
            {inputs.length === 0 ? <p className="text-gray-500 text-sm">No inputs</p> : (
              <ul className="space-y-1">
                {inputs.map((conn) => (
                  <li key={conn.id} className="text-sm">From: <strong>{getComponentName(conn.from)}</strong> ({conn.type || "Untitled"}) — Reason: {conn.reason || "N/A"}</li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-lg">Outputs</h4>
            {outputs.length === 0 ? <p className="text-gray-500 text-sm">No outputs</p> : (
              <ul className="space-y-1">
                {outputs.map((conn) => (
                  <li key={conn.id} className="text-sm">To: <strong>{getComponentName(conn.to)}</strong> ({conn.type || "Untitled"}) — Reason: {conn.reason || "N/A"}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Certifications */}
        <div className="mt-8 border-t pt-6">
          <h4 className="font-semibold text-lg mb-3">Certifications</h4>
          <label>
            <Button variant="outline" asChild className="border-gray-300">
              <span><Upload className="h-4 w-4 mr-2" /> Upload Certification</span>
            </Button>
            <input type="file" className="hidden" onChange={handleUploadCertification} accept=".pdf,.jpg,.png" />
          </label>
          {certifications.length > 0 && (
            <ul className="mt-3 space-y-1">
              {certifications.map((cert, i) => (
                <li key={i}><a href={cert} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">Certification {i + 1}</a></li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="border-gray-300">Cancel</Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">Save Details</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComponentDetailDialog;