'use client';

import { useEffect, useState } from "react";
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

const FUEL_TYPES = [
  "Hydrogen",
  "Ammonia",
  "Methanol",
  "Methane",
  "Diesel",
  "Kerosene",
  "Naphtha",
  "Butane",
  "Propane",
  "Ethanol",
  "Gasoline",
];

const CAPACITY_UNITS = [
  "Ton per Year",
  "Ton per Day",
  "Kilogram per Hour",
  "Normal Cubic Meter per Hour",
];

const ProductForm = ({ onSubmit }: ProductFormProps) => {
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
    setProducts((prev) => [
      ...prev,
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
      toast.warning("At least one fuel type is required.");
      return;
    }
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProductChange = (
    index: number,
    field: keyof ProductInfo,
    value: string | number
  ) => {
    const next = [...products];
    // @ts-expect-error - safe
    next[index][field] = value;
    setProducts(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hasFuelType = products.every((p) => p.fuelType);
    if (!hasFuelType) {
      toast.error("Please select a Fuel Type for each product.");
      return;
    }

    const nameCounts = products.reduce<Record<string, number>>((acc, p) => {
      const key = String(p.fuelType || "");
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const nameIndex: Record<string, number> = {};

    const submittedProducts: ProductInfo[] = products.map((p) => {
      const capacity = typeof p.productionCapacity === "string"
        ? Number.parseFloat(p.productionCapacity)
        : p.productionCapacity;
      const normalizedCapacity = Number.isFinite(capacity) ? capacity : "";
      const fuelLabel = String(p.fuelType || "");
      const seen = (nameIndex[fuelLabel] || 0) + 1;
      nameIndex[fuelLabel] = seen;
      const productName =
        nameCounts[fuelLabel] > 1 ? `${fuelLabel} ${seen}` : fuelLabel;

      return {
        ...p,
        productName,
        productType: fuelLabel,
        productionCapacity: normalizedCapacity,
        verified: true,
      };
    });

    onSubmit(submittedProducts);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8 flex items-start">
      <div className="w-full max-w-none">
        <Card className="w-full h-[calc(100vh-140px)] bg-white border border-gray-300 shadow-xl rounded-xl overflow-hidden flex flex-col">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <CardTitle className="text-2xl font-bold">Products</CardTitle>
            <CardDescription className="text-blue-100 mt-1">
              This form defines output fuels only. Add as many product blocks as needed.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 md:p-8 bg-white flex-1 min-h-0">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 h-full">
              <div className="flex-1 min-h-0 overflow-y-auto pr-3 form-scroll space-y-6">
                {products.map((product, index) => (
                  <div
                    key={product.productId}
                    className="space-y-5 rounded-xl border border-slate-200 bg-slate-50/60 p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-700">
                        Product {index + 1}
                      </div>
                      {products.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => handleRemoveProduct(index)}
                          className="bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg px-3 py-2 transition-all shadow-md hover:shadow-lg"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`fuelType-${index}`}>Fuel Type *</Label>
                      <Select
                        required
                        value={product.fuelType}
                        onValueChange={(value) => handleProductChange(index, "fuelType", value)}
                      >
                        <SelectTrigger className="h-11 bg-white border-gray-300">
                          <SelectValue placeholder="Select fuel type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300 max-h-72">
                          {FUEL_TYPES.map((fuel) => (
                            <SelectItem key={fuel} value={fuel}>
                              {fuel}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <Label htmlFor={`productionCapacity-${index}`}>Production Capacity</Label>
                        <Input
                          id={`productionCapacity-${index}`}
                          type="number"
                          min="0"
                          value={product.productionCapacity}
                          onChange={(e) => handleProductChange(index, "productionCapacity", e.target.value)}
                          placeholder="Optional"
                          className="h-11 bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`unit-${index}`}>Capacity Unit</Label>
                        <Select
                          value={product.unit}
                          onValueChange={(value) => handleProductChange(index, "unit", value)}
                        >
                          <SelectTrigger className="h-11 bg-white border-gray-300">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-300">
                            {CAPACITY_UNITS.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200 bg-white">
                <Button
                  type="button"
                  onClick={handleAddProduct}
                  className="h-11 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg border border-gray-300 transition-all"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Product
                </Button>

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
      <style jsx>{`
        .form-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(79, 143, 247, 0.85) rgba(226, 232, 240, 0.8);
        }
        .form-scroll::-webkit-scrollbar {
          width: 12px;
        }
        .form-scroll::-webkit-scrollbar-track {
          background: rgba(226, 232, 240, 0.8);
          border-radius: 10px;
        }
        .form-scroll::-webkit-scrollbar-thumb {
          background: rgba(79, 143, 247, 0.85);
          border-radius: 10px;
          border: 2px solid rgba(226, 232, 240, 0.8);
        }
      `}</style>
    </div>
  );
};

export default ProductForm;
