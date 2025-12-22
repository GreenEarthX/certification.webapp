import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { ProductInfo } from "./types";

interface OfftakeLocationProps {
  productInfo: ProductInfo[];
  setProductInfo: React.Dispatch<React.SetStateAction<ProductInfo[]>>;
  verifiedProducts: string[];
  error: string | null;
  handleNextStep: () => void;
  handleBackStep: () => void;
}

export const OfftakeLocation = ({
  productInfo,
  setProductInfo,
  verifiedProducts,
  error,
  handleNextStep,
  handleBackStep,
}: OfftakeLocationProps) => {
  const addOfftakeLocation = (productName: string) => {
    const updatedProducts = [...productInfo];
    const productIndex = updatedProducts.findIndex((p) => p.productName === productName);
    if (productIndex !== -1) {
      const currentLocations = updatedProducts[productIndex].offtakeLocations || [];
      updatedProducts[productIndex].offtakeLocations = [
        ...currentLocations,
        { country: "", zip: "", city: "", street: "" },
      ];
      setProductInfo(updatedProducts);
    }
  };

  const removeOfftakeLocation = (productName: string, locationIndex: number) => {
    const updatedProducts = [...productInfo];
    const productIndex = updatedProducts.findIndex((p) => p.productName === productName);
    if (productIndex !== -1) {
      const currentLocations = updatedProducts[productIndex].offtakeLocations || [];
      currentLocations.splice(locationIndex, 1);
      updatedProducts[productIndex].offtakeLocations = currentLocations;
      setProductInfo(updatedProducts);
    }
  };

  const updateOfftakeLocation = (
    productName: string,
    locationIndex: number,
    field: "country" | "zip" | "city" | "street",
    value: string
  ) => {
    const updatedProducts = [...productInfo];
    const productIndex = updatedProducts.findIndex((p) => p.productName === productName);
    if (productIndex !== -1) {
      const currentLocations = updatedProducts[productIndex].offtakeLocations || [];
      if (currentLocations[locationIndex]) {
        currentLocations[locationIndex][field] = value;
        updatedProducts[productIndex].offtakeLocations = currentLocations;
        setProductInfo(updatedProducts);
      }
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">Select Offtake Location</h2>
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6 border border-gray-200">{error}</div>
      )}
      <div className="space-y-8 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Fill in the offtake location details for each verified product (optional). You can add multiple offtakers for each product. This will filter out irrelevant certifications based on market eligibility.
          </p>
          <div className="space-y-6">
            {productInfo
              .filter((p) => verifiedProducts.includes(p.productName))
              .map((product, productIndex) => (
                <Card key={productIndex} className="p-4 border-gray-200">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-lg font-semibold">{product.fuelType}</CardTitle>
                    <p className="text-sm text-gray-600">Fuel Type: {product.fuelType} | Feedstock: {product.feedstock || "N/A"}</p>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4">
                    {(product.offtakeLocations || []).map((location, locationIndex) => (
                      <div key={locationIndex} className="flex items-end space-x-4 border-b pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                        <div className="flex-1 space-y-2">
                          <Label htmlFor={`country-${productIndex}-${locationIndex}`}>Country</Label>
                          <Select
                            value={location.country || ""}
                            onValueChange={(value) => updateOfftakeLocation(product.productName, locationIndex, "country", value)}
                          >
                            <SelectTrigger id={`country-${productIndex}-${locationIndex}`} className="border-[#3c83f6]/30 focus:ring-[#3c83f6] rounded-md">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Germany">Germany</SelectItem>
                              <SelectItem value="EU">EU</SelectItem>
                              <SelectItem value="UK">UK</SelectItem>
                              <SelectItem value="US">US</SelectItem>
                              <SelectItem value="India">India</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label htmlFor={`zip-${productIndex}-${locationIndex}`}>ZIP Code</Label>
                          <Input
                            id={`zip-${productIndex}-${locationIndex}`}
                            value={location.zip}
                            onChange={(e) => updateOfftakeLocation(product.productName, locationIndex, "zip", e.target.value)}
                            placeholder="ZIP Code"
                            className="border-[#3c83f6]/30 focus:ring-[#3c83f6]"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label htmlFor={`city-${productIndex}-${locationIndex}`}>City</Label>
                          <Input
                            id={`city-${productIndex}-${locationIndex}`}
                            value={location.city}
                            onChange={(e) => updateOfftakeLocation(product.productName, locationIndex, "city", e.target.value)}
                            placeholder="City"
                            className="border-[#3c83f6]/30 focus:ring-[#3c83f6]"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label htmlFor={`street-${productIndex}-${locationIndex}`}>Street</Label>
                          <Input
                            id={`street-${productIndex}-${locationIndex}`}
                            value={location.street}
                            onChange={(e) => updateOfftakeLocation(product.productName, locationIndex, "street", e.target.value)}
                            placeholder="Street"
                            className="border-[#3c83f6]/30 focus:ring-[#3c83f6]"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOfftakeLocation(product.productName, locationIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="w-full border-[#3c83f6]/30 hover:bg-[#3c83f6]/10 text-gray-700 font-semibold"
                      onClick={() => addOfftakeLocation(product.productName)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Offtake Location
                    </Button>
                  </CardContent>
                </Card>
              ))}
            {productInfo.filter((p) => verifiedProducts.includes(p.productName)).length === 0 && (
              <p className="text-center text-gray-500 py-4">No verified products</p>
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBackStep}
            className="border-[#3c83f6]/30 hover:bg-[#3c83f6]/10 text-gray-700 font-semibold"
          >
            Back to Verify Products
          </Button>
          <Button
            className="bg-[#3c83f6] hover:bg-[#3c83f6]/90 text-white font-semibold"
            onClick={handleNextStep}
          >
            Next: Downstream Operations
          </Button>
        </div>
      </div>
    </div>
  );
};