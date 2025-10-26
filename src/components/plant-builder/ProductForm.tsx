import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type { ProductInfo } from "@/pages/PlantBuilder";

type ProductFormProps = {
  onSubmit: (products: ProductInfo[]) => void;
};

const ProductForm = ({ onSubmit }: ProductFormProps) => {
  const [products, setProducts] = useState<ProductInfo[]>([
    { productName: "", productType: "", productionCapacity: "", unit: "" },
  ]);

  const handleAddProduct = () => {
    setProducts([...products, { productName: "", productType: "", productionCapacity: "", unit: "" }]);
  };

  const handleRemoveProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, field: keyof ProductInfo, value: string) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (products.every((p) => p.productName && p.productType && p.productionCapacity && p.unit)) {
      onSubmit(products);
    } else {
      alert("Please fill in all fields for each product.");
    }
  };

  return (
    <Card className="w-full max-w-2xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Product Information</CardTitle>
        <CardDescription>
          Specify the products your plant will produce. Add as many products as needed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {products.map((product, index) => (
            <div key={index} className="space-y-4 border-b pb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`productName-${index}`}>Product Name *</Label>
                  <Input
                    id={`productName-${index}`}
                    required
                    value={product.productName}
                    onChange={(e) => handleProductChange(index, "productName", e.target.value)}
                    placeholder="Enter product name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`productType-${index}`}>Product Type *</Label>
                  <Select
                    required
                    value={product.productType}
                    onValueChange={(value) => handleProductChange(index, "productType", value)}
                  >
                    <SelectTrigger id={`productType-${index}`}>
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hydrogen">Hydrogen</SelectItem>
                      <SelectItem value="ammonia">Ammonia</SelectItem>
                      <SelectItem value="methanol">Methanol</SelectItem>
                      <SelectItem value="kerosene">Kerosene/SAF</SelectItem>
                      <SelectItem value="diesel">Diesel/HVO</SelectItem>
                      <SelectItem value="ethanol">Ethanol</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`productionCapacity-${index}`}>Production Capacity *</Label>
                  <Input
                    id={`productionCapacity-${index}`}
                    required
                    type="number"
                    value={product.productionCapacity}
                    onChange={(e) => handleProductChange(index, "productionCapacity", e.target.value)}
                    placeholder="Enter capacity"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`unit-${index}`}>Unit *</Label>
                  <Select
                    required
                    value={product.unit}
                    onValueChange={(value) => handleProductChange(index, "unit", value)}
                  >
                    <SelectTrigger id={`unit-${index}`}>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="t/h">t/h</SelectItem>
                      <SelectItem value="kWh/h">kWh/h</SelectItem>
                      <SelectItem value="m3/h">m³/h</SelectItem>
                      <SelectItem value="kt/y">kt/y</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {products.length > 1 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveProduct(index)}
                  className="mt-2"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Product
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={handleAddProduct}
            className="w-full mt-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Product
          </Button>
          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg">
              Continue to Plant Model
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;