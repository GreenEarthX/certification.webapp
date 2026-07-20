// src/lib/ipfs.ts
export async function uploadToPinata(data: ArrayBuffer | Uint8Array, filename: string): Promise<string> {
  // Convert ANY input to Buffer safely
  const buffer = Buffer.from(data instanceof Uint8Array ? data : new Uint8Array(data));

  const blob = new Blob([buffer], {
    type: filename.endsWith(".json") ? "application/json" : "application/pdf",
  });

  const form = new FormData();
  form.append("file", blob, filename);

  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataApiSecret = process.env.PINATA_API_SECRET;

  if (!pinataApiKey || !pinataApiSecret) {
    throw new Error("Pinata API keys missing in .env.local");
  }

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      pinata_api_key: pinataApiKey,
      pinata_secret_api_key: pinataApiSecret,
    },
    body: form,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinata upload failed: ${res.status} ${err}`);
  }

  const result = await res.json();
  return result.IpfsHash;
}