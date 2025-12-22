import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Zap, Shield, BarChart3 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-canvas-bg via-background to-layer-equipment-light">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Plant Builder</h1>
            </div>
            <Button onClick={() => navigate("/plant-builder")} size="lg">
              Start Building
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
            Build Your Digital Twin
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create accurate digital representations of your renewable fuel plants for compliance verification, 
            process optimization, and regulatory comparison.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button onClick={() => navigate("/plant-builder")} size="lg" className="text-lg px-8">
              Create New Plant
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="border-2 border-layer-equipment/20 hover:border-layer-equipment transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-layer-equipment-light flex items-center justify-center mb-2">
                <Building2 className="h-6 w-6 text-layer-equipment" />
              </div>
              <CardTitle>Equipment Layer</CardTitle>
              <CardDescription>
                Physical infrastructure components, machinery, reactors, and storage systems
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-layer-carrier/20 hover:border-layer-carrier transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-layer-carrier-light flex items-center justify-center mb-2">
                <Zap className="h-6 w-6 text-layer-carrier" />
              </div>
              <CardTitle>Carrier Layer</CardTitle>
              <CardDescription>
                Energy carriers, materials, fuels, and intermediates flowing through the plant
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-layer-gate/20 hover:border-layer-gate transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-layer-gate-light flex items-center justify-center mb-2">
                <Shield className="h-6 w-6 text-layer-gate" />
              </div>
              <CardTitle>Gate Layer</CardTitle>
              <CardDescription>
                Input/output nodes, control points, valves, and mass/energy flow interfaces
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-primary/20 hover:border-primary transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Compliance Check</CardTitle>
              <CardDescription>
                Automated verification against regulatory requirements and standards
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Process Flow */}
      <section className="container mx-auto px-4 py-16 bg-card/30 rounded-2xl my-16">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">
            Simple 3-Step Process
          </h3>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2 text-foreground">Add Plant Information</h4>
                <p className="text-muted-foreground">
                  Enter basic details about your plant including name, location, type, and project parameters
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2 text-foreground">Build Plant Model</h4>
                <p className="text-muted-foreground">
                  Drag and drop components across three layers, define specifications, and connect them to represent mass and energy flows
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2 text-foreground">Generate Digital Twin</h4>
                <p className="text-muted-foreground">
                  Get a complete process flow diagram, product lists, and compliance-ready data for regulatory verification
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h3 className="text-3xl font-bold text-foreground">Ready to Get Started?</h3>
          <p className="text-xl text-muted-foreground">
            Create your first digital twin and streamline your compliance process today
          </p>
          <Button onClick={() => navigate("/plant-builder")} size="lg" className="text-lg px-8">
            Launch Plant Builder
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
