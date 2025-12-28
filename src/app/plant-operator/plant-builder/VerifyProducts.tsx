import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductInfo } from "./types";

interface VerifyProductsProps {
  productInfo: ProductInfo[];
  setProductInfo: React.Dispatch<React.SetStateAction<ProductInfo[]>>;
  verifiedProducts: string[];
  setVerifiedProducts: React.Dispatch<React.SetStateAction<string[]>>;
  error: string | null;
  handleNextStep: () => void;
  handleBackStep: () => void;
}

export const VerifyProducts = ({
  productInfo,
  setProductInfo,
  verifiedProducts,
  setVerifiedProducts,
  error,
  handleNextStep,
  handleBackStep,
}: VerifyProductsProps) => {
  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 min-h-screen w-full overflow-x-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">Verify Products</h2>
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6 border border-red-200">{error}</div>
      )}
      <div className="space-y-8 bg-white rounded-xl shadow-lg p-8 border border-gray-100 w-full">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Select the products relevant to your project by verifying them. Only verified products will be included in the compliance check.
          </p>
          <div className="w-full overflow-x-auto border border-gray-200 rounded-md">
            <Table className="min-w-[1200px] table-auto w-full"> {/* Increased min-w to 1200px for bigger width, table-auto for natural column sizing based on content */}
              <TableHeader>
                <TableRow className="bg-[#3c83f6]/10">
                  <TableHead className="font-semibold text-gray-700 min-w-[100px] text-sm">Product ID</TableHead> {/* min-w for each column to ensure visibility */}
                  {/*<TableHead className="font-semibold text-gray-700 min-w-[120px] text-sm">Product Name</TableHead>*/}
                  <TableHead className="font-semibold text-gray-700 min-w-[150px] text-sm">Fuel Type</TableHead>
                  <TableHead className="font-semibold text-gray-700 min-w-[300px] text-sm">Feedstock</TableHead> {/* Wider for long feedstock */}
                  <TableHead className="font-semibold text-gray-700 min-w-[150px] text-sm">Verify</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productInfo.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                      No products defined
                    </TableCell>
                  </TableRow>
                ) : (
                  productInfo.map((product, index) => (
                    <TableRow key={index} className="hover:bg-[#3c83f6]/5 transition-colors">
                      <TableCell className="text-gray-900 text-sm break-words">{product.productId}</TableCell> {/* break-words to wrap if needed, show all data */}
                      {/*<TableCell className="text-gray-900 text-sm break-words">{product.productName}</TableCell>*/}
                      <TableCell className="text-gray-900 text-sm break-words">{product.fuelType}</TableCell>
                      <TableCell className="text-gray-900 text-sm break-words max-w-[300px]">{product.feedstock || "N/A"}</TableCell> {/* Wider cell, break-words for full visibility */}
                      <TableCell className="text-gray-900">
                        <Button
                          variant={product.verified ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            try {
                              const updatedProducts = [...productInfo];
                              updatedProducts[index] = { ...updatedProducts[index], verified: !product.verified };
                              setProductInfo(updatedProducts);
                              setVerifiedProducts(
                                updatedProducts.filter((p) => p.verified).map((p) => p.productName)
                              );
                              toast.success(`${product.productName} ${product.verified ? "unverified" : "verified"}!`);
                            } catch (err) {
                              toast.error("Error verifying product.");
                            }
                          }}
                          className={product.verified ? "bg-[#3c83f6] hover:bg-[#3c83f6]/90 text-white font-semibold" : "border-[#3c83f6]/30 hover:bg-[#3c83f6]/10 text-gray-700 font-semibold"}
                        >
                          {product.verified ? <CheckCircle className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                          {product.verified ? "Verified" : "Verify"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBackStep}
            className="border-[#3c83f6]/30 hover:bg-[#3c83f6]/10 text-gray-700 font-semibold"
          >
            Back to Builder
          </Button>
          <Button
            className="bg-[#3c83f6] hover:bg-[#3c83f6]/90 text-white font-semibold"
            onClick={handleNextStep}
            disabled={productInfo.length === 0}
          >
            Next: Select Offtake Location
          </Button>
        </div>
      </div>
    </div>
  );
};