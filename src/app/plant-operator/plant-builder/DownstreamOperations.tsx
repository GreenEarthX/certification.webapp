import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { ProductInfo } from "./types";

interface DownstreamOperationsProps {
  productInfo: ProductInfo[];
  setProductInfo: React.Dispatch<React.SetStateAction<ProductInfo[]>>;
  verifiedProducts: string[];
  error: string | null;
  handleNextStep: () => void;
  handleBackStep: () => void;
}

export const DownstreamOperations = ({
  productInfo,
  setProductInfo,
  verifiedProducts,
  error,
  handleNextStep,
  handleBackStep,
}: DownstreamOperationsProps) => {
  // Support multiple downstream operations via array (migrate in parent if needed)
  // Assume ProductInfo has downstreamOperationsArray?: string[]

  const addDownstreamOperation = (productName: string) => {
    const updatedProducts = [...productInfo];
    const productIndex = updatedProducts.findIndex((p) => p.productName === productName);
    if (productIndex !== -1) {
      const currentOps = (updatedProducts[productIndex] as any).downstreamOperationsArray || [];
      (updatedProducts[productIndex] as any).downstreamOperationsArray = [...currentOps, ""];
      setProductInfo(updatedProducts);
    }
  };

  const removeDownstreamOperation = (productName: string, opIndex: number) => {
    const updatedProducts = [...productInfo];
    const productIndex = updatedProducts.findIndex((p) => p.productName === productName);
    if (productIndex !== -1) {
      const currentOps = (updatedProducts[productIndex] as any).downstreamOperationsArray || [];
      currentOps.splice(opIndex, 1);
      (updatedProducts[productIndex] as any).downstreamOperationsArray = currentOps;
      setProductInfo(updatedProducts);
    }
  };

  const updateDownstreamOperation = (
    productName: string,
    opIndex: number,
    value: string
  ) => {
    const updatedProducts = [...productInfo];
    const productIndex = updatedProducts.findIndex((p) => p.productName === productName);
    if (productIndex !== -1) {
      const currentOps = (updatedProducts[productIndex] as any).downstreamOperationsArray || [];
      if (currentOps[opIndex] !== undefined) {
        currentOps[opIndex] = value;
        (updatedProducts[productIndex] as any).downstreamOperationsArray = currentOps;
        setProductInfo(updatedProducts);
      }
    }
  };

  const verifiedProductInfo = productInfo.filter((p) => verifiedProducts.includes(p.productName));

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 min-h-screen w-full overflow-x-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">Downstream Operations</h2>
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6 border border-red-200">{error}</div>
      )}
      <div className="space-y-8 bg-white rounded-xl shadow-lg p-8 border border-gray-100 w-full">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Provide details about downstream operations for each verified product (optional). You can add multiple operations (e.g., refining, blending, transport). This may affect compliance confidence (e.g., additional processing reduces score by 10% per operation).
          </p>
          <div className="w-full overflow-x-auto border border-gray-200 rounded-md">
            <div className="min-w-[1200px] table-auto w-full">
              {/* Header Row */}
              <div className="grid grid-cols-5 gap-0 bg-[#3c83f6]/10 border-b border-gray-200">
                <div className="font-semibold text-gray-700 p-4 text-sm min-w-[100px]">Product ID</div>
                <div className="font-semibold text-gray-700 p-4 text-sm min-w-[120px]">Product Name</div>
                <div className="font-semibold text-gray-700 p-4 text-sm min-w-[150px]">Fuel Type</div>
                <div className="font-semibold text-gray-700 p-4 text-sm min-w-[300px]">Feedstock</div>
                <div className="font-semibold text-gray-700 p-4 text-sm min-w-[400px]">Downstream Operations</div>
              </div>
              {/* Body */}
              {verifiedProductInfo.length === 0 ? (
                <div className="grid grid-cols-5 gap-0 border-b border-gray-200">
                  <div className="text-center text-gray-500 py-4 col-span-5">
                    No verified products
                  </div>
                </div>
              ) : (
                verifiedProductInfo.map((product, productIndex) => (
                  <div key={product.productName} className="border-b border-gray-200 last:border-b-0">
                    {/* Product Header Row */}
                    <div className="grid grid-cols-5 gap-0 bg-gray-50">
                      <div className="text-gray-900 text-sm break-words min-w-[100px] p-4">{product.productId}</div>
                      <div className="text-gray-900 text-sm break-words min-w-[120px] p-4">{product.productName}</div>
                      <div className="text-gray-900 text-sm break-words min-w-[150px] p-4">{product.fuelType}</div>
                      <div className="text-gray-900 text-sm break-words min-w-[300px] p-4">{product.feedstock || "N/A"}</div>
                      <div className="min-w-[400px] p-4"></div> {/* Alignment spacer */}
                    </div>
                    {/* Operations List */}
                    <div className="p-4 space-y-4 bg-white">
                      {((product as any).downstreamOperationsArray || []).map((operation: string, opIndex: number) => (
                        <div key={opIndex} className="flex items-start space-x-4 border-b pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                          <div className="flex-1 space-y-2">
                            <Textarea
                              value={operation}
                              onChange={(e) => updateDownstreamOperation(product.productName, opIndex, e.target.value)}
                              placeholder="Describe downstream operation (e.g., blending with fossil fuels, pipeline transport, chemical conversion)"
                              className="border-[#3c83f6]/30 focus:ring-[#3c83f6] rounded-md min-h-[80px] resize-vertical"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDownstreamOperation(product.productName, opIndex)}
                            className="text-red-500 hover:text-red-700 mt-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full border-[#3c83f6]/30 hover:bg-[#3c83f6]/10 text-gray-700 font-semibold"
                        onClick={() => addDownstreamOperation(product.productName)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Downstream Operation
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBackStep}
            className="border-[#3c83f6]/30 hover:bg-[#3c83f6]/10 text-gray-700 font-semibold"
          >
            Back to Offtake Location
          </Button>
          <Button
            className="bg-[#3c83f6] hover:bg-[#3c83f6]/90 text-white font-semibold"
            onClick={handleNextStep}
          >
            Next: Filter Certifications
          </Button>
        </div>
      </div>
    </div>
  );
};