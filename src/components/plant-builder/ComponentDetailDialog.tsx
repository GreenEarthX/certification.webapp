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
import ComponentSchemaForm, { ComponentFieldDefinition } from "./ComponentSchemaForm";
import { fetchComponentInstanceById, updateComponentInstance } from "@/services/plant-builder/componentInstances";
import { fetchComponentDefinitionById, fetchComponentDefinitions } from "@/services/plant-builder/componentDefinitions";
import toast from "react-hot-toast";

type ComponentDetailDialogProps = {
  component: PlacedComponent;
  components: PlacedComponent[];
  connections: Connection[];
  open: boolean;
  onClose: () => void;
  onSave: (id: string, data: any, certifications: string[], componentDefinitionId?: number | null) => void;
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

const sanitizeFieldValues = (data?: Record<string, any> | null): Record<string, any> => {
  if (!data) return {};
  const keys = Object.keys(data);
  if (
    keys.length === 1 &&
    keys[0] === "technicalData" &&
    typeof data["technicalData"] === "object" &&
    data["technicalData"] !== null &&
    Object.keys(data["technicalData"]).length === 0
  ) {
    return {};
  }
  return data;
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

  const [certifications, setCertifications] = useState<string[]>(component.certifications || []);
  const [inputStreams, setInputStreams] = useState<Stream[]>([]);
  const [outputStreams, setOutputStreams] = useState<Stream[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>(
    sanitizeFieldValues(component.data)
  );
  const [schemaFields, setSchemaFields] = useState<ComponentFieldDefinition[]>([]);
  const [isSchemaLoading, setIsSchemaLoading] = useState(false);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [activeDefinitionId, setActiveDefinitionId] = useState<number | null>(
    component.componentDefinitionId ?? null
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFieldValues(sanitizeFieldValues(component.data));
    setCertifications(component.certifications || []);
    setActiveDefinitionId(component.componentDefinitionId ?? null);
  }, [component]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const loadSchema = async () => {
      setIsSchemaLoading(true);
      setSchemaError(null);
      try {
        let definitionId = component.componentDefinitionId ?? null;
        let nextValues: Record<string, any> = sanitizeFieldValues(component.data);

        if (component.instanceId) {
          const instance = await fetchComponentInstanceById(component.instanceId);
          if (cancelled) return;
          nextValues = sanitizeFieldValues(instance.field_values);
          definitionId = definitionId ?? instance.component_definition_id ?? null;
        }

        if (!definitionId) {
          const defs = await fetchComponentDefinitions();
          if (cancelled) return;
          const match = defs.find(
            (def) => def.component_name === component.name && def.component_type === component.type
          );
          definitionId = match?.id ?? null;
        }

        setFieldValues(nextValues);
        setActiveDefinitionId(definitionId);

        if (definitionId) {
          const definition = await fetchComponentDefinitionById(definitionId);
          if (cancelled) return;
          setSchemaFields(definition.field_schema?.fields || []);
        } else {
          setSchemaFields([]);
        }
      } catch (err) {
        console.error("Failed to load component schema:", err);
        if (!cancelled) {
          setSchemaFields([]);
          setSchemaError("Unable to load component fields.");
        }
      } finally {
        if (!cancelled) {
          setIsSchemaLoading(false);
        }
      }
    };

    loadSchema();
    return () => {
      cancelled = true;
    };
  }, [component.id, component.instanceId, component.componentDefinitionId, component.name, component.type, open]);

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
    onSave(component.id, fieldValues, certifications, activeDefinitionId);
    if (component.instanceId) {
      setIsSaving(true);
      updateComponentInstance(component.instanceId, {
        field_values: fieldValues,
        component_definition_id: activeDefinitionId ?? undefined,
      })
        .then(() => {
          toast.success(`${component.name} updated`);
        })
        .catch((err) => {
          console.error("Failed to update component instance:", err);
          toast.error("Failed to save component fields");
        })
        .finally(() => setIsSaving(false));
    }
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

        <div className="mt-6 space-y-4">
          {schemaError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {schemaError}
            </div>
          )}
          {isSchemaLoading ? (
            <div className="text-sm text-muted-foreground">Loading component fields…</div>
          ) : (
            <ComponentSchemaForm
              fields={schemaFields}
              values={fieldValues}
              onChange={(name, value) =>
                setFieldValues((prev) => ({
                  ...prev,
                  [name]: value,
                }))
              }
            />
          )}
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
          <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60">
            {isSaving ? "Saving..." : "Save Details"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComponentDetailDialog;
