// src/app/plant-operator/plausibility-check/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText, Plus, X, CheckCircle2, ChevronDown,
  Loader2, Eye, ExternalLink, Download, AlertCircle
} from "lucide-react";

type NFTResult = { cid: string; serial: string };
type NFTResults = { 
  proof: NFTResult[]; 
  invoice: NFTResult[]; 
  ppa: NFTResult[]; 
  termsheet: NFTResult[] 
};

type CheckResult = {
  check_name: string;
  passed: boolean;
  expected: string;
  actual: string;
  details: string;
};

type PlausibilityResult = {
  is_valid: boolean;
  invoice_expiry_date: string;
  seal_hash: string | null;
  checks: CheckResult[];
  proof: string | null;
  hcs_data: {
    seal_hash: string;
    plant_id: string;
    validity_date: string;
    proof: string;
    timestamp: string;
    documents: Record<string, string>;
  } | null;
};

const mockUserPlants = [
  { id: "PLANT-001", name: "JetNova Fuels" },
  { id: "PLANT-002", name: "MethoClear Energy" },
  { id: "PLANT-003", name: "EcoHydro One " },
  
];

const useToast = () => {
  const [toast, setToast] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant: "default" | "destructive" | "success" | "warning";
  } | null>(null);

  const showToast = ({
    title,
    description,
    variant = "default",
  }: { title: string; description: string; variant?: "default" | "destructive" | "success" | "warning" }) => {
    setToast({ open: true, title, description, variant });
    setTimeout(() => setToast(null), 5000);
  };

  return { toast, showToast };
};

const Select = ({ value, onChange, options, placeholder }: any) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2.5 text-left bg-white border border-gray-300 rounded-lg shadow-sm flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {value ? options.find((o: any) => o.id === value)?.name : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option: any) => (
            <button
              key={option.id}
              type="button"
              onClick={() => { onChange(option.id); setOpen(false); }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition"
            >
              {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const FileItem = ({ file, type }: { file: File; type: string }) => {
  const getBadge = () => {
    const name = file.name.toLowerCase();
    if (name.includes("termsheet")) return { text: "TERM", color: "bg-orange-100 text-orange-800" };
    if (name.includes("pos") || type === "proof") return { text: "PoS", color: "bg-green-100 text-green-800" };
    if (name.includes("invoice") || type === "invoice") return { text: "INV", color: "bg-blue-100 text-blue-800" };
    if (name.includes("ppa") || type === "ppa") return { text: "PPA", color: "bg-purple-100 text-purple-800" };
    return { text: "DOC", color: "bg-gray-100 text-gray-800" };
  };

  const badge = getBadge();
  const isMismatch = type !== badge.text.toLowerCase().replace("term", "termsheet");

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
        <span className="text-sm text-gray-700 truncate">{file.name}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.color}`}>
          {badge.text}
        </span>
      </div>
      {isMismatch && (
        <div className="flex items-center gap-1" title="Warning: File name may not match section">
          <AlertCircle className="w-4 h-4 text-yellow-600" aria-label="Mismatch" />
        </div>
      )}
    </div>
  );
};

const DocumentSection = ({ title, files, onAddFiles, onRemoveFile, type }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      onAddFiles([file]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3 p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gradient-to-br from-gray-50 to-white hover:border-blue-400 transition">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          {type === "proof" && <span className="text-xs font-bold text-green-600">[PoS]</span>}
          {type === "invoice" && <span className="text-xs font-bold text-blue-600">[INV]</span>}
          {type === "ppa" && <span className="text-xs font-bold text-purple-600">[PPA]</span>}
          {type === "termsheet" && <span className="text-xs font-bold text-orange-600">[TERM]</span>}
          {title}
        </h3>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition"
        >
          <Plus className="w-4 h-4" /> {files.length > 0 ? "Replace" : "Add File"}
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="space-y-2">
        {files.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No file uploaded</p>
        ) : (
          <div key={0}>
            <FileItem file={files[0]} type={type} />
            <button
              onClick={() => onRemoveFile(0)}
              className="mt-2 text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Toast = ({ toast, onClose }: any) => {
  const icons: any = {
    default: <X className="w-5 h-5" />,
    destructive: <X className="w-5 h-5 text-red-600" />,
    success: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-600" />,
  };
  const bgColors: any = {
    default: "bg-white border",
    destructive: "bg-red-50 border-red-200",
    success: "bg-green-50 border-green-200",
    warning: "bg-yellow-50 border-yellow-200",
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom">
      <div className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border ${bgColors[toast.variant]} max-w-sm`}>
        <div className={toast.variant === "destructive" ? "text-red-600" : toast.variant === "success" ? "text-green-600" : toast.variant === "warning" ? "text-yellow-600" : "text-blue-600"}>
          {icons[toast.variant]}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{toast.title}</p>
          <p className="text-xs text-gray-600 mt-1">{toast.description}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default function PlausibilityCheckPage() {
  const [step, setStep] = useState(1);
  const [selectedPlantId, setSelectedPlantId] = useState("");
  const [uploads, setUploads] = useState<Record<string, { 
    proof: File[]; 
    invoice: File[]; 
    ppa: File[]; 
    termsheet: File[] 
  }>>({});
  const [ocrResults, setOcrResults] = useState<any>({});
  const [nftResults, setNftResults] = useState<NFTResults | null>(null);
  const [plausibilityResult, setPlausibilityResult] = useState<PlausibilityResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [mintCompleted, setMintCompleted] = useState(false);
  const router = useRouter();
  const { toast, showToast } = useToast();

  const initPlant = (id: string) => {
    if (!uploads[id]) {
      setUploads((prev) => ({
        ...prev,
        [id]: { proof: [], invoice: [], ppa: [], termsheet: [] },
      }));
    }
  };

  const handlePlantChange = (id: string) => {
    setSelectedPlantId(id);
    initPlant(id);
  };

  const addFiles = (type: "proof" | "invoice" | "ppa" | "termsheet", files: File[]) => {
    const file = files[0];
    const name = file.name.toLowerCase();

    if (type === "termsheet" && !name.includes("termsheet") && !name.includes("term")) {
      showToast({ title: "Possible Mismatch", description: "File should contain 'termsheet'", variant: "warning" });
    }

    setUploads((prev) => ({
      ...prev,
      [selectedPlantId]: {
        ...prev[selectedPlantId],
        [type]: [file],
      },
    }));
  };

  const removeFile = (type: "proof" | "invoice" | "ppa" | "termsheet") => {
    setUploads((prev) => ({
      ...prev,
      [selectedPlantId]: {
        ...prev[selectedPlantId],
        [type]: [],
      },
    }));
  };

  const runOCR = async () => {
    setIsVerifying(true);
    const results: any = {};
    const current = uploads[selectedPlantId];

      const processFile = async (file: File, type: "pos" | "invoice" | "ppa" | "termsheet") => {
      const form = new FormData();
      form.append("file", file);
      const endpoint = type;
      const res = await fetch(`${process.env.OCR_SERVICE_URL}/api/v1/ocr/${endpoint}`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (data.status === "success") results[type] = data.data;
    };

    const tasks = [];
    if (current.proof.length) tasks.push(processFile(current.proof[0], "pos"));
    if (current.invoice.length) tasks.push(processFile(current.invoice[0], "invoice"));
    if (current.ppa.length) tasks.push(processFile(current.ppa[0], "ppa"));
    if (current.termsheet.length) tasks.push(processFile(current.termsheet[0], "termsheet"));

    await Promise.all(tasks);
    setOcrResults(results);
    setIsVerifying(false);
  };

  const mintNFT = async () => {
    setIsMinting(true);
    const form = new FormData();
    form.append("plantId", selectedPlantId);
    form.append("ocrData", JSON.stringify(ocrResults));

    const current = uploads[selectedPlantId];
    if (current.proof.length) form.append("proof", current.proof[0]);
    if (current.invoice.length) form.append("invoice", current.invoice[0]);
    if (current.ppa.length) form.append("ppa", current.ppa[0]);
    if (current.termsheet.length) form.append("termsheet", current.termsheet[0]);

    try {
      const res = await fetch("/api/mint-nft", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Mint failed");

      const results: NFTResults = { proof: [], invoice: [], ppa: [], termsheet: [] };
      for (const [type, cids] of Object.entries(data.cids || {})) {
        const serials = data.serials?.[type] || [];
        (cids as string[]).forEach((cid: string, i: number) => {
          results[type as keyof NFTResults].push({
            cid,
            serial: serials[i] || "N/A",
          });
        });
      }

      setNftResults(results);
      setMintCompleted(true);
      showToast({ title: "NFTs Minted!", description: "4/4 → Correct Collections", variant: "success" });
    } catch (err: any) {
      showToast({ title: "Mint Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsMinting(false);
    }
  };

  const buildPlausibilityInput = () => {
    const clean = (obj: any) => {
      const { raw_text, structured_text, llm_refined, ...rest } = obj;
      return rest;
    };

    const input: any = {
      "pos": {},
      "termsheet": {},
      "ppa": {},
      "invoice": {},
      "plant_id": selectedPlantId,
    };

    if (ocrResults.pos) input.pos = clean(ocrResults.pos);
    if (ocrResults.termsheet) input.termsheet = clean(ocrResults.termsheet);
    if (ocrResults.ppa) input.ppa = clean(ocrResults.ppa);
    if (ocrResults.invoice) input.invoice = clean(ocrResults.invoice);

    console.log("PLAUSIBILITY INPUT →", input);

    return input;
  };

  const runPlausibilityCheck = async () => {
    setIsChecking(true);
    const input = buildPlausibilityInput();

    try {
      const res = await fetch(`${process.env.PLAUSIBILITY_SERVICE_URL}/api/v1/plausibility/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const result: PlausibilityResult = await res.json();
      console.log("PLAUSIBILITY RESULT →", result);

      setPlausibilityResult(result);

      // SEND TO HCS WITH NFT DATA
      await sendToHCS(result, input, nftResults!);

      showToast({
        title: result.is_valid ? "Verification PASSED" : "Verification FAILED",
        description: result.is_valid ? "All checks passed!" : "Some checks failed",
        variant: result.is_valid ? "success" : "destructive",
      });
    } catch (err: any) {
      showToast({ title: "Check Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsChecking(false);
    }
  };

  const sendToHCS = async (result: PlausibilityResult, input: any, nftResults: NFTResults) => {
    const fallbackHash = Buffer.from(JSON.stringify(input)).toString("base64").slice(0, 64);
    const sealHash = result.seal_hash || `fallback_${fallbackHash}`;

    const documents: Record<string, { cid: string; serial: string }> = {};
    Object.entries(nftResults).forEach(([type, items]) => {
      if (items.length > 0) {
        documents[type] = { cid: items[0].cid, serial: items[0].serial };
      }
    });

    const payload = {
      event: "PLAUSIBILITY_CHECK",
      seal_hash: sealHash,
      plant_id: selectedPlantId,
      validity_date: result.invoice_expiry_date || "N/A",
      timestamp: result.hcs_data?.timestamp || new Date().toISOString(),
      is_valid: result.is_valid,
      checks_passed: result.checks?.filter(c => c.passed).length || 0,
      checks_total: result.checks?.length || 0,
      documents,
    };

    try {
      const res = await fetch("/api/hcs-trace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        console.log("HCS TRACE WITH DOCS SENT →", payload);
      } else {
        console.error("HCS trace failed:", await res.text());
      }
    } catch (err) {
      console.error("HCS trace error:", err);
    }
  };

  const current = selectedPlantId ? uploads[selectedPlantId] : null;

  const downloadOCR = (type: string, data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedPlantId}_${type}_ocr.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTokenId = (type: string) => {
    return type === "proof" ? "7108305" :
           type === "invoice" ? "7108304" :
           type === "ppa" ? "7108301" :
           type === "termsheet" ? "7131752" :
           "N/A";
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Progress Bar */}
          <div className="flex justify-center mb-12">
            {["Upload", "OCR", "Mint", "Plausibility"].map((label, i) => (
              <div key={i} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-md transition-all ${
                  step > i + 1 ? "bg-green-600" :
                  step === i + 1 ? "bg-blue-600 scale-110" : "bg-gray-300"
                }`}>
                  {step > i + 1 ? <CheckCircle2 className="w-6 h-6" /> : i + 1}
                </div>
                <div className="ml-3 text-sm font-medium text-gray-700 hidden sm:block">{label}</div>
                {i < 3 && <div className={`w-20 h-1 mx-6 transition-all ${step > i + 1 ? "bg-green-600" : "bg-gray-300"}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
              <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Upload Documents</h1>
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Plant</label>
                <Select value={selectedPlantId} onChange={handlePlantChange} options={mockUserPlants} placeholder="Choose a plant..." />
              </div>

              {current && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DocumentSection title="Proof of Sustainability (PoS)" files={current.proof} type="proof" onAddFiles={(f:any) => addFiles("proof", f)} onRemoveFile={() => removeFile("proof")} />
                  <DocumentSection title="Invoice" files={current.invoice} type="invoice" onAddFiles={(f:any) => addFiles("invoice", f)} onRemoveFile={() => removeFile("invoice")} />
                  <DocumentSection title="Power Purchase Agreement (PPA)" files={current.ppa} type="ppa" onAddFiles={(f:any) => addFiles("ppa", f)} onRemoveFile={() => removeFile("ppa")} />
                  <DocumentSection title="Term Sheet" files={current.termsheet} type="termsheet" onAddFiles={(f:any) => addFiles("termsheet", f)} onRemoveFile={() => removeFile("termsheet")} />
                </div>
              )}

              <div className="mt-10 flex justify-end">
                <button
                  onClick={() => {
                    const count = Object.values(current || {}).reduce((a, b) => a + b.length, 0);
                    if (!selectedPlantId || count === 0) {
                      showToast({ title: "Missing Data", description: "Upload at least one document.", variant: "destructive" });
                      return;
                    }
                    setStep(2);
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 shadow-lg transition transform hover:scale-105"
                >
                  Next: Run OCR
                </button>
              </div>
            </div>
          )}

          {/* Step 2: OCR */}
          {step === 2 && (
            <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">OCR Results</h2>

              {isVerifying ? (
                <div className="text-center py-16">
                  <Loader2 className="w-16 h-16 animate-spin mx-auto text-blue-600" />
                  <p className="mt-6 text-lg text-gray-600">Extracting data...</p>
                </div>
              ) : Object.keys(ocrResults).length === 0 ? (
                <div className="text-center py-16">
                  <button onClick={runOCR} className="px-10 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg text-lg font-semibold hover:from-green-700 hover:to-green-800 shadow-lg transition transform hover:scale-105">
                    Run OCR Now
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(ocrResults).map(([type, data]: [string, any]) => (
                    <div key={type} className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold capitalize text-gray-800">
                          {type === "pos" ? "Proof of Sustainability" :
                           type === "invoice" ? "Invoice" :
                           type === "ppa" ? "PPA" :
                           "Term Sheet"}
                        </h3>
                        <button onClick={() => downloadOCR(type, data)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                          <Download className="w-4 h-4" /> JSON
                        </button>
                      </div>
                      <pre className="text-xs overflow-auto bg-white p-4 rounded-lg border border-gray-200 max-h-96">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </div>
                  ))}

                  <div className="flex justify-end pt-6">
                    <button onClick={() => setStep(3)} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 shadow-lg transition">
                      Next: Mint NFTs
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Mint */}
          {step === 3 && (
            <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Mint NFTs</h2>

              {isMinting ? (
                <div className="text-center py-16">
                  <Loader2 className="w-16 h-16 animate-spin mx-auto text-purple-600" />
                  <p className="mt-6 text-lg text-gray-600">Minting on Hedera...</p>
                </div>
              ) : nftResults && mintCompleted ? (
                <div className="space-y-10">
                  <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-3" />
                    <p className="text-xl font-bold text-green-800">All 4 NFTs Minted!</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {Object.entries(nftResults).map(([key, results]: [string, NFTResult[]]) => (
                      results.length > 0 && (
                        <div key={key} className="space-y-4">
                          <h4 className="font-bold text-lg capitalize text-center text-gray-800">
                            {key === "proof" ? "PoS" :
                             key === "invoice" ? "Invoice" :
                             key === "ppa" ? "PPA" :
                             "Term Sheet"}
                          </h4>
                          {results.map((item, i) => (
                            <div key={i} className="space-y-3">
                              <a href={`https://ipfs.io/ipfs/${item.cid}`} target="_blank" rel="noopener noreferrer" className="block p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition text-center">
                                <Eye className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                <span className="font-medium text-blue-900">View PDF</span>
                              </a>
                              <a 
                                href={`https://hashscan.io/testnet/token/0.0.${getTokenId(key)}/${item.serial}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="block p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition text-center"
                              >
                                <ExternalLink className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                                <span className="font-medium text-purple-900">View NFT</span>
                              </a>
                            </div>
                          ))}
                        </div>
                      )
                    ))}
                  </div>

                  <div className="flex justify-center pt-6">
                    <button onClick={() => setStep(4)} className="px-10 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-bold text-lg hover:from-orange-700 hover:to-red-700 shadow-lg transition transform hover:scale-105">
                      Run Plausibility Check
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <button onClick={mintNFT} className="px-12 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-xl font-bold hover:from-purple-700 hover:to-pink-700 shadow-xl transition transform hover:scale-105">
                    Mint All 4 NFTs
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Plausibility Check */}
          {step === 4 && (
            <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Plausibility Check</h2>

              {isChecking ? (
                <div className="text-center py-16">
                  <Loader2 className="w-16 h-16 animate-spin mx-auto text-orange-600" />
                  <p className="mt-6 text-lg text-gray-600">Running plausibility checks...</p>
                </div>
              ) : !plausibilityResult ? (
                <div className="text-center py-16">
                  <button onClick={runPlausibilityCheck} className="px-12 py-5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl text-xl font-bold hover:from-orange-700 hover:to-red-700 shadow-xl transition transform hover:scale-105">
                    Run Plausibility Check
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className={`text-center p-6 rounded-xl ${plausibilityResult.is_valid ? "bg-green-50" : "bg-red-50"}`}>
                    <CheckCircle2 className={`w-16 h-16 mx-auto mb-3 ${plausibilityResult.is_valid ? "text-green-600" : "text-red-600"}`} />
                    <p className={`text-2xl font-bold ${plausibilityResult.is_valid ? "text-green-800" : "text-red-800"}`}>
                      {plausibilityResult.is_valid ? "Verification PASSED" : "Verification FAILED"}
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Check</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                          <th className="px-4 py-3 font-semibold">Expected</th>
                          <th className="px-4 py-3 font-semibold">Actual</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plausibilityResult.checks.map((check, i) => (
                          <tr key={i} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{check.check_name}</td>
                            <td className="px-4 py-3">
                              {check.passed ? (
                                <span className="flex items-center gap-1 text-green-600 font-medium">
                                  <CheckCircle2 className="w-4 h-4" /> Pass
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-red-600 font-medium">
                                  <X className="w-4 h-4" /> Fail
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-600">{check.expected}</td>
                            <td className="px-4 py-3 text-gray-600">{check.actual}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="font-bold text-lg mb-3">Proof Summary</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{plausibilityResult.proof}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {toast && <Toast toast={toast} onClose={() => {}} />}
    </>
  );
}