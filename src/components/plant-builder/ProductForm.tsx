'use client';

import { useEffect } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type { ProductInfo } from "@/app/plant-operator/plant-builder/types";
import { toast } from "sonner";

type ProductFormProps = {
  onSubmit: (products: ProductInfo[]) => void;
};

const ProductForm = ({ onSubmit }: ProductFormProps) => {
  // KILL DARK MODE ON THIS PAGE
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const [products, setProducts] = useState<ProductInfo[]>([
    {
      productId: `prod-${Date.now()}`,
      productName: "",
      productType: "",
      productionCapacity: "",
      unit: "",
      fuelType: "",
      verified: false,
    },
  ]);

  const handleAddProduct = () => {
    setProducts([
      ...products,
      {
        productId: `prod-${Date.now()}`,
        productName: "",
        productType: "",
        productionCapacity: "",
        unit: "",
        fuelType: "",
        verified: false,
      },
    ]);
  };

  const handleRemoveProduct = (index: number) => {
    if (products.length <= 1) {
      toast.warning("You must define at least one product for the plant.");
      return;
    }
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleProductChange = (
    index: number,
    field: keyof ProductInfo,
    value: string | number
  ) => {
    const newProducts = [...products];
    // @ts-expect-error - safe
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = products.every(
      (p) =>
        p.productName &&
        p.productType &&
        p.productionCapacity &&
        p.unit &&
        p.fuelType
    );
    if (!isValid) {
      toast.error("Please fill in all required fields for each product.");
      return;
    }

    const submittedProducts: ProductInfo[] = products.map((p) => ({
      ...p,
      productionCapacity: Number(p.productionCapacity),
      verified: true,
    }));
    onSubmit(submittedProducts);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl bg-white border border-gray-300 shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <CardTitle className="text-2xl font-bold">Product Information</CardTitle>
          <CardDescription className="text-blue-100 mt-1">
            Specify the products your plant will produce. Add as many as needed.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">

            {products.map((product, index) => (
              <div
                key={product.productId}
                className="space-y-5 border-b border-gray-200 pb-6 last:border-0 last:pb-0"
              >
                {/* Your existing fields with bg-white */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor={`productName-${index}`}>
                      Product Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`productName-${index}`}
                      required
                      value={product.productName}
                      onChange={(e) => handleProductChange(index, "productName", e.target.value)}
                      placeholder="e.g., Green Hydrogen"
                      className="h-11 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`productType-${index}`}>
                      Product Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      required
                      value={product.productType}
                      onValueChange={(value) => handleProductChange(index, "productType", value)}
                    >
                      <SelectTrigger className="h-11 bg-white border-gray-300">
                        <SelectValue placeholder="Select product type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor={`productionCapacity-${index}`}>
                      Production Capacity <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`productionCapacity-${index}`}
                      required
                      type="number"
                      value={product.productionCapacity}
                      onChange={(e) => handleProductChange(index, "productionCapacity", e.target.value)}
                      placeholder="e.g., 500"
                      className="h-11 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`unit-${index}`}>
                      Unit <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      required
                      value={product.unit}
                      onValueChange={(value) => handleProductChange(index, "unit", value)}
                    >
                      <SelectTrigger className="h-11 bg-white border-gray-300">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300">
                        <SelectItem value="t/h">t/h</SelectItem>
                        <SelectItem value="kWh/h">kWh/h</SelectItem>
                        <SelectItem value="m3/h">m³/h</SelectItem>
                        <SelectItem value="kt/y">kt/y</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`fuelType-${index}`}>
                    Fuel Type <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`fuelType-${index}`}
                    required
                    value={product.fuelType || ""}
                    onChange={(e) => handleProductChange(index, "fuelType", e.target.value)}
                    placeholder="e.g., H2, NH3"
                    className="h-11 bg-white"
                  />
                </div>

                {/* REMOVE BUTTON — ALWAYS RED + WHITE TEXT */}
                {products.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => handleRemoveProduct(index)}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg px-4 py-2 transition-all shadow-md hover:shadow-lg"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Product
                  </Button>
                )}
              </div>
            ))}

            <Button
              type="button"
              onClick={handleAddProduct}
              className="w-full h-11 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg border border-gray-300 transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Product
            </Button>

            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                size="lg"
                className="min-w-[200px] bg-[#4F8FF7] hover:bg-[#3A78E0] text-white font-medium px-6 py-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
              >
                Continue to Plant Model
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductForm;
