// src/app/plant/[id]/history/page.tsx
import { notFound } from "next/navigation";

interface HCSMessage {
  consensus_timestamp: string;
  message: string; // Base64-encoded JSON
  sequence_number: number;
  topic_id: string;
}

interface ParsedMessage {
  event: string;
  plant_id: string;
  seal_hash?: string;
  validity_date?: string;
  is_valid?: boolean;
  timestamp: string;
  // Add other fields as needed (e.g., checks_passed)
}

async function fetchTopicMessages(topicId: string, limit: number = 100): Promise<HCSMessage[]> {
  const url = `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages?order=desc&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Mirror Node error: ${res.status}`);
  const data = await res.json();
  return data.messages || [];
}

function parseMessage(msg: HCSMessage): ParsedMessage | null {
  try {
    const decoded = Buffer.from(msg.message, "base64").toString("utf-8");
    const parsed = JSON.parse(decoded);
    return parsed;
  } catch (e) {
    console.error("Failed to parse message:", e);
    return null;
  }
}

export default async function PlantHistory({ params }: { params: { id: string } }) {
  const { id: plantId } = params;
  if (!plantId) notFound();

  const topicId = process.env.NEXT_PUBLIC_HCS_TOPIC_ID || "0.0.7108913"; // From .env

  let messages: ParsedMessage[] = [];
  try {
    const rawMessages = await fetchTopicMessages(topicId);
    messages = rawMessages
      .map(parseMessage)
      .filter((msg): msg is ParsedMessage => msg !== null && msg.plant_id === plantId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Newest first
  } catch (error) {
    console.error("Failed to fetch history:", error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Plant History: {plantId}
        </h1>

        {messages.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p>No history found for this plant.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-green-500">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{msg.event}</h3>
                  <span className="text-sm text-gray-500">{new Date(msg.timestamp).toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Plant ID:</strong> {msg.plant_id}</p>
                    {msg.seal_hash && <p><strong>Seal Hash:</strong> {msg.seal_hash.slice(0, 16)}...</p>}
                    {msg.validity_date && <p><strong>Validity:</strong> {msg.validity_date}</p>}
                  </div>
                  <div>
                    <p><strong>Status:</strong> {msg.is_valid ? "Valid ✅" : "Invalid ❌"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}