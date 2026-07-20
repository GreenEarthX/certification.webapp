// src/app/api/mint-nft/route.ts
import { uploadToPinata } from "@/lib/ipfs";
import { mintNFT } from "@/lib/hedera";

type DocumentType = "proof" | "invoice" | "ppa" | "termsheet";

const TYPE_TO_TOKEN_ID: Record<DocumentType, string> = {
  proof: "0.0.7108305",     // GEX-POS
  invoice: "0.0.7108304",   // GEX-INV
  ppa: "0.0.7108301",       // GEX-PPA
  termsheet: "0.0.7131752", // GEX-TERM
};

export async function POST(req: Request) {
  const form = await req.formData();
  const plantId = form.get("plantId") as string;
  const ocrData = JSON.parse(form.get("ocrData") as string);

  const cids: Record<string, string[]> = {};
  const serials: Record<string, string[]> = {};

  for (const [key, value] of form.entries()) {
    if (key === "plantId" || key === "ocrData") continue;
    if (!(value instanceof File)) continue;

    const type = key as DocumentType;
    if (!["proof", "invoice", "ppa", "termsheet"].includes(type)) {
      console.warn(`Invalid type: ${type}`);
      continue;
    }

    const file = value;
    const fileName = file.name;

    // 1. Upload PDF
    const pdfArrayBuffer = await file.arrayBuffer();
    const pdfCid = await uploadToPinata(pdfArrayBuffer, fileName);

    // 2. Upload OCR JSON (if exists)
    let ocrCid = "";
    const ocrJson = ocrData[type];
    if (ocrJson) {
      const ocrString = JSON.stringify(ocrJson);
      ocrCid = await uploadToPinata(Buffer.from(ocrString), `${fileName.replace(".pdf", "")}_ocr.json`);
    }

    // 3. Mint NFT
    const metadata = {
      name: type.toUpperCase(),
      image: `ipfs://${pdfCid}`,
      // Optional: include OCR CID
      // description: ocrCid ? `OCR: ipfs://${ocrCid}` : undefined,
    };

    const tokenId = TYPE_TO_TOKEN_ID[type];
    const { serial } = await mintNFT(metadata, tokenId);

    // Group results
    cids[type] = cids[type] || [];
    serials[type] = serials[type] || [];
    cids[type].push(pdfCid);
    serials[type].push(serial.toString());
  }

  return Response.json({ 
    success: true,
    cids,
    serials,
  });
}