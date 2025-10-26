// src/app/api/hcs-trace/route.ts
import {
  Client,
  PrivateKey,
  AccountId,
  TopicMessageSubmitTransaction,
  TopicId,
  Hbar, // ← ADD THIS
} from "@hashgraph/sdk";

export async function POST(req: Request) {
  const body = await req.json();
  const { seal_hash, plant_id, validity_date, timestamp, is_valid } = body;

  const network = process.env.HEDERA_NETWORK || "testnet";
  const operatorId = AccountId.fromString(process.env.OPERATOR_ACCOUNT_ID!);
  const operatorKey = PrivateKey.fromStringECDSA(process.env.OPERATOR_PRIVATE_KEY!);
  const topicId = TopicId.fromString(process.env.HCS_TOPIC_ID!);

  const client = Client.forName(network).setOperator(operatorId, operatorKey);

  const message = JSON.stringify({
    event: "PLAUSIBILITY_CHECK",
    seal_hash,
    plant_id,
    validity_date,
    timestamp,
    is_valid,
  });

  const tx = new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(message)
    .setMaxTransactionFee(new Hbar(2)); // ← NOW WORKS

  const txSigned = await tx.freezeWith(client).sign(operatorKey);
  await txSigned.execute(client);

  client.close();
  return Response.json({ success: true });
}