// src/lib/hedera.ts
import {
  Client,
  PrivateKey,
  AccountId,
  TokenMintTransaction,
  TokenId,
  Hbar,
  TopicMessageSubmitTransaction,
  TopicId,
} from "@hashgraph/sdk";

export type MintResult = {
  serial: string;
};

export async function mintNFT(
  metadata: { name: string; image: string },
  tokenIdString: string  // ← FULL TOKEN ID: "0.0.7131752"
): Promise<MintResult> {
  const network = process.env.HEDERA_NETWORK || "testnet";
  const operatorId = AccountId.fromString(process.env.OPERATOR_ACCOUNT_ID!);
  const operatorKey = PrivateKey.fromStringECDSA(process.env.OPERATOR_PRIVATE_KEY!);

  const client = Client.forName(network).setOperator(operatorId, operatorKey);

  const tokenId = TokenId.fromString(tokenIdString);

  const metadataBuffer = Buffer.from(JSON.stringify(metadata));

  if (metadataBuffer.length > 100) {
    throw new Error(`Metadata too long: ${metadataBuffer.length} bytes (max 100)`);
  }

  const mintTx = new TokenMintTransaction()
    .setTokenId(tokenId)
    .addMetadata(metadataBuffer)
    .setMaxTransactionFee(new Hbar(20));

  const mintTxSigned = await mintTx.freezeWith(client).sign(operatorKey);
  const mintTxResponse = await mintTxSigned.execute(client);
  const receipt = await mintTxResponse.getReceipt(client);
  const serial = receipt.serials[0].toString();

  // HCS Trace
  const topicId = TopicId.fromString(process.env.HCS_TOPIC_ID!);
  const documentType = getDocumentTypeFromTokenId(tokenIdString);

  const traceData = {
    event: "NFT_MINTED",
    documentType,
    collection: tokenId.toString(),
    serial,
    ipfs: metadata.image,
    timestamp: new Date().toISOString(),
  };

  const traceTx = new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(JSON.stringify(traceData))
    .setMaxTransactionFee(new Hbar(2));

  const traceTxSigned = await traceTx.freezeWith(client).sign(operatorKey);
  await traceTxSigned.execute(client);

  client.close();
  return { serial };
}

// Helper: Map token ID → document type for HCS
function getDocumentTypeFromTokenId(tokenId: string): string {
  if (tokenId === process.env.NFT_POS_COLLECTION) return "pos";
  if (tokenId === process.env.NFT_INVOICE_COLLECTION) return "invoice";
  if (tokenId === process.env.NFT_PPA_COLLECTION) return "ppa";
  if (tokenId === process.env.NFT_TERMSHEET_COLLECTION) return "termsheet";
  return "unknown";
}