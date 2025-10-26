import { useState, useRef, useCallback, useEffect } from "react";
import { Plus, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PlantComponent from "./PlantComponent";
import ComponentDetailDialog from "./ComponentDetailDialog";
import ConnectionArrow from "./ConnectionArrow";
import ConnectionDetailDialog from "./ConnectionDetailDialog";

export type Position = { x: number; y: number };
export type PlacedComponent = {
  id: string;
  type: "equipment" | "carrier" | "gate";
  name: string;
  category: string;
  position: Position;
  data?: any;
  certifications?: string[];
};
export type Connection = {
  id: string;
  from: string;
  to: string;
  type: string;
  reason?: string;
  data?: any;
};

type CanvasProps = {
  components: PlacedComponent[];
  setComponents: React.Dispatch<React.SetStateAction<PlacedComponent[]>>;
  connections: Connection[];
  setConnections: React.Dispatch<React.SetStateAction<Connection[]>>;
};

const Canvas = ({ components, setComponents, connections, setConnections }: CanvasProps) => {
  const [selectedComponent, setSelectedComponent] = useState<PlacedComponent | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showAddComponent, setShowAddComponent] = useState(false);
  const [newComponent, setNewComponent] = useState({ name: "", type: "" as "equipment" | "carrier" | "gate", category: "" });
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await import("@/data/examplePlant.json");
        if (!mounted) return;
        if (data?.default && components.length === 0 && connections.length === 0) {
          setComponents((data.default.components || []) as PlacedComponent[]);
          setConnections((data.default.connections || []) as Connection[]);
        }
      } catch (e) {
        console.warn("Could not load example plant", e);
      }
    })();
    return () => { mounted = false; };
  }, [setComponents, setConnections]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const componentData = JSON.parse(e.dataTransfer.getData("component"));
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const newComponent: PlacedComponent = {
      ...componentData,
      id: `${componentData.id}-${Date.now()}`,
      position: {
        x: (e.clientX - rect.left) / zoom,
        y: (e.clientY - rect.top) / zoom,
      },
    };
    setComponents((prev) => [...prev, newComponent]);
  }, [zoom, setComponents]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleConnectStart = (componentId: string) => {
    setConnectingFrom(componentId);
  };

  const handleConnectEnd = (componentId: string) => {
    if (connectingFrom && connectingFrom !== componentId) {
      const newConn = {
        id: `conn-${Date.now()}`,
        from: connectingFrom,
        to: componentId,
        type: "",
      };
      setConnections((prev) => [...prev, newConn]);
      setSelectedConnection(newConn);
    }
    setConnectingFrom(null);
  };

  const handleComponentClick = (component: PlacedComponent) => {
    if (connectingFrom) {
      handleConnectEnd(component.id);
    } else {
      setSelectedComponent(component);
    }
  };

  const handleComponentMove = (id: string, position: Position) => {
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, position } : c)));
  };

  const handleSaveDetails = (id: string, data: any, certifications: string[]) => {
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, data, certifications } : c)));
    setSelectedComponent(null);
  };

  const handleSaveConnection = (id: string, type: string, reason: string, data: any) => {
    setConnections((prev) => prev.map((c) => (c.id === id ? { ...c, type, reason, data } : c)));
    setSelectedConnection(null);
  };

  const handleAddConnection = (from: string, to: string, type: string, reason: string) => {
    if (from !== to) {
      const newConn = {
        id: `conn-${Date.now()}`,
        from,
        to,
        type,
        reason,
      };
      setConnections((prev) => [...prev, newConn]);
    }
  };

  const handleAddNewComponent = () => {
    if (newComponent.name && newComponent.type && newComponent.category) {
      const component: PlacedComponent = {
        id: `comp-${Date.now()}`,
        name: newComponent.name,
        type: newComponent.type,
        category: newComponent.category,
        position: { x: 100, y: 100 },
        data: {},
        certifications: [],
      };
      setComponents((prev) => [...prev, component]);
      setNewComponent({ name: "", type: "" as any, category: "" });
      setShowAddComponent(false);
    }
  };

  const getComponentPosition = (id: string): Position | undefined => {
    return components.find((c) => c.id === id)?.position;
  };

  return (
    <div className="flex-1 flex flex-col bg-canvas-bg relative">
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setZoom((z) => Math.min(z + 0.1, 2))}
          className="bg-card"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setZoom((z) => Math.max(z - 0.1, 0.5))}
          className="bg-card"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>
      {connectingFrom && (
        <div className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
          Click on an input port of another component to connect
        </div>
      )}
      <div
        ref={canvasRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex-1 relative overflow-auto"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--canvas-grid)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--canvas-grid)) 1px, transparent 1px)
          `,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
        }}
      >
        <div
          className="relative w-full h-full min-w-[2400px] min-h-[1800px]"
          style={{ transform: `scale(${zoom})`, transformOrigin: "0 0" }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-layer-equipment/5" />
            <div className="absolute top-0 bottom-0" style={{ left: "33.3333%", width: "33.3333%" }}>
              <div className="absolute inset-0 bg-layer-carrier/5" />
            </div>
            <div className="absolute top-0 bottom-0 right-0 w-1/3 bg-layer-gate/5" />
          </div>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {connections.map((conn) => {
              const fromPos = getComponentPosition(conn.from);
              const toPos = getComponentPosition(conn.to);
              if (!fromPos || !toPos) return null;
              return (
                <ConnectionArrow
                  key={conn.id}
                  from={fromPos}
                  to={toPos}
                  onClick={() => setSelectedConnection(conn)}
                />
              );
            })}
          </svg>
          <div className="relative pointer-events-none" style={{ zIndex: 10 }}>
            <div className="pointer-events-auto">
              {components.map((component) => (
                <PlantComponent
                  key={component.id}
                  component={component}
                  onClick={() => handleComponentClick(component)}
                  onMove={handleComponentMove}
                  onConnectStart={handleConnectStart}
                  onConnectEnd={handleConnectEnd}
                  isConnecting={connectingFrom === component.id}
                />
              ))}
            </div>
          </div>
          {components.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center space-y-4 max-w-2xl px-8">
                <Plus className="h-16 w-16 mx-auto text-muted-foreground/50" />
                <h3 className="text-xl font-semibold text-foreground">
                  Start Building Your Plant Digital Twin
                </h3>
                <p className="text-muted-foreground">
                  Drag components from the library or use the Add Component button
                </p>
                <div className="grid grid-cols-3 gap-4 mt-8 text-sm">
                  <div className="p-4 rounded-lg bg-layer-equipment/10 border border-layer-equipment/20">
                    <div className="text-muted-foreground">Drop Equipment here</div>
                  </div>
                  <div className="p-4 rounded-lg bg-layer-carrier/10 border border-layer-carrier/20">
                    <div className="text-muted-foreground">Drop Carriers here</div>
                  </div>
                  <div className="p-4 rounded-lg bg-layer-gate/10 border border-layer-gate/20">
                    <div className="text-muted-foreground">Drop Gates here</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {selectedComponent && (
        <ComponentDetailDialog
          component={selectedComponent}
          components={components}
          connections={connections}
          open={!!selectedComponent}
          onClose={() => setSelectedComponent(null)}
          onSave={handleSaveDetails}
          onAddConnection={handleAddConnection}
        />
      )}
      {selectedConnection && (
        <ConnectionDetailDialog
          connection={selectedConnection}
          components={components}
          open={!!selectedConnection}
          onClose={() => setSelectedConnection(null)}
          onSave={handleSaveConnection}
        />
      )}
      <Dialog open={showAddComponent} onOpenChange={setShowAddComponent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Component</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="componentType">Component Type *</Label>
              <Select
                required
                value={newComponent.type}
                onValueChange={(value) =>
                  setNewComponent({ ...newComponent, type: value as "equipment" | "carrier" | "gate" })
                }
              >
                <SelectTrigger id="componentType">
                  <SelectValue placeholder="Select component type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equipment">Equipment (Physical infrastructure)</SelectItem>
                  <SelectItem value="carrier">Carrier (Energy & material flow)</SelectItem>
                  <SelectItem value="gate">Gate (Input/Output points)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="componentName">Name *</Label>
              <Input
                id="componentName"
                value={newComponent.name}
                onChange={(e) => setNewComponent({ ...newComponent, name: e.target.value })}
                placeholder="Enter custom component name (e.g., Custom Reactor)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="componentCategory">Category *</Label>
              <Input
                id="componentCategory"
                value={newComponent.category}
                onChange={(e) => setNewComponent({ ...newComponent, category: e.target.value })}
                placeholder="Enter category (e.g., Reactor, Fuel, Input)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddComponent(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddNewComponent}
              disabled={!newComponent.name || !newComponent.type || !newComponent.category}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Canvas;