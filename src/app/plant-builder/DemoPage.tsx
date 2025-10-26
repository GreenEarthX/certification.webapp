import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Zap, ArrowRightLeft } from "lucide-react";
import ReactFlow, { addEdge, Background, Controls, MiniMap, NodeProps, Handle, Position } from "react-flow-renderer";
import type { ComponentType, ComponentData } from "@/components/plant-builder/ComponentLibrary";

// Simplified component data for demo (new components: Methanol Synthesis Reactor, Methanol, Product Output)
const demoComponents: ComponentData[] = [
  {
    id: "methanol-synthesis",
    type: "equipment",
    name: "Methanol Synthesis Reactor",
    category: "Power-to-X",
    icon: "Building2",
    technicalData: {
      input: [
        { name: "CO₂", quantity: 0, unit: "Ton/h" },
        { name: "Hydrogen", quantity: 0, unit: "Ton/h" },
      ],
      output: [{ name: "Methanol", quantity: 0, unit: "Ton/h" }],
      efficiency: 0,
      capacity: { value: 0, unit: "Ton/h" },
    },
    metadata: {},
  },
  {
    id: "methanol",
    type: "carrier",
    name: "Methanol (CH₃OH)",
    category: "Liquid",
    icon: "Zap",
    carrierData: {
      product: "Methanol",
      fuelType: "Methanol",
      fuelClass: "Renewable fuels of non-biological origin (RFNBO)",
      certificationStatus: "Pre-certification",
    },
  },
  {
    id: "output-product",
    type: "gate",
    name: "Product Output",
    category: "Output",
    icon: "ArrowRightLeft",
    gateData: {
      inputOrOutput: "output",
      product: "Methanol",
      output: [{ name: "Methanol", quantity: 0, unit: "Ton/h" }],
      endUse: "Shipping Industry",
      sinkType: "Market",
    },
  },
];

// Type for placed components on the canvas
type PlacedComponent = {
  id: string;
  name: string;
  type: ComponentType;
  category: string;
  position: { x: number; y: number };
  data: any;
  certifications?: string[];
  color: string; // Added for user-selected color
};

// Type for connections
type Connection = {
  id: string;
  from: string;
  to: string;
  type?: string;
};

// Custom node component with input/output handles
const CustomNode = ({ data }: NodeProps) => {
  return (
    <div
      className="px-4 py-2 rounded-md shadow-md border"
      style={{ backgroundColor: data.color, borderColor: data.borderColor }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#555", width: 10, height: 10 }}
        id="input"
      />
      <div className="text-sm font-medium text-gray-900">{data.label}</div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#555", width: 10, height: 10 }}
        id="output"
      />
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

const DemoPage = () => {
  const [components, setComponents] = useState<PlacedComponent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [showColorModal, setShowColorModal] = useState(false);
  const [pendingComponent, setPendingComponent] = useState<PlacedComponent | null>(null);
  const [selectedColor, setSelectedColor] = useState("blue");

  // Handle drag-and-drop from library to canvas
  const handleDragStart = (e: React.DragEvent, component: ComponentData) => {
    e.dataTransfer.setData("component", JSON.stringify(component));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const componentData = JSON.parse(e.dataTransfer.getData("component")) as ComponentData;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newComponent: PlacedComponent = {
      id: `${componentData.id}-${Date.now()}`,
      name: componentData.name,
      type: componentData.type,
      category: componentData.category,
      position: { x, y },
      data: {
        technicalData: componentData.technicalData,
        carrierData: componentData.carrierData,
        gateData: componentData.gateData,
      },
      certifications: [],
      color: "blue", // Default color, will be updated via modal
    };

    setPendingComponent(newComponent);
    setShowColorModal(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleColorSelect = () => {
    if (pendingComponent) {
      setComponents((prev) => [...prev, { ...pendingComponent, color: selectedColor }]);
      setShowColorModal(false);
      setPendingComponent(null);
      setSelectedColor("blue"); // Reset to default
    }
  };

  // React Flow setup for connections
  const nodes = components.map((component) => ({
    id: component.id,
    type: "custom",
    data: {
      label: `${component.name} (${component.type})`,
      color: component.color === "blue" ? "#bfdbfe" : component.color === "green" ? "#bbf7d0" : "#fecaca",
      borderColor: component.color === "blue" ? "#3b82f6" : component.color === "green" ? "#22c55e" : "#ef4444",
    },
    position: component.position,
  }));

  const edges = connections.map((conn) => ({
    id: conn.id,
    source: conn.from,
    sourceHandle: "output",
    target: conn.to,
    targetHandle: "input",
    label: conn.type || "Flow",
    animated: true,
  }));

  const onConnect = useCallback(
    (params: any) => {
      const newConn: Connection = {
        id: `conn-${Date.now()}`,
        from: params.source,
        to: params.target,
        type: "Flow",
      };
      setConnections((prev) => [...prev, newConn]);
    },
    [setConnections]
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur-sm flex items-center justify-between px-6 py-3">
        <h1 className="text-lg font-semibold text-gray-900">Plant Builder Demo</h1>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reset
        </Button>
      </header>
      <div className="flex-1 flex overflow-hidden">
        {/* Component Library Panel */}
        <div className="w-64 border-r border-gray-200 bg-white p-4">
          <h2 className="font-semibold text-lg text-gray-900 mb-4">Components</h2>
          <div className="space-y-4">
            {demoComponents.map((component) => (
              <Card
                key={component.id}
                draggable
                onDragStart={(e) => handleDragStart(e, component)}
                className={`p-3 cursor-move border-2 border-layer-${component.type}/20 hover:border-layer-${component.type} hover:bg-layer-${component.type}-light transition-colors`}
              >
                <div className="flex items-center gap-2">
                  {component.type === "equipment" && <Building2 className="h-4 w-4" />}
                  {component.type === "carrier" && <Zap className="h-4 w-4" />}
                  {component.type === "gate" && <ArrowRightLeft className="h-4 w-4" />}
                  <div>
                    <div className="font-medium text-sm text-gray-900">{component.name}</div>
                    <div className="text-xs text-gray-500">{component.category}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        {/* Canvas */}
        <div
          className="flex-1 bg-gray-100"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>
      {/* Color Selection Modal */}
      <Dialog open={showColorModal} onOpenChange={setShowColorModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Select Component Color</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Select
                value={selectedColor}
                onValueChange={setSelectedColor}
              >
                <SelectTrigger id="color">
                  <SelectValue placeholder="Select a color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleColorSelect}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DemoPage;