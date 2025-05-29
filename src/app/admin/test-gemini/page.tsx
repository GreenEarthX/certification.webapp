'use client';

import { useState } from 'react';

export default function TestGeminiPage() {
  const [prompt, setPrompt] = useState('');
  const [fileText, setFileText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setFileText(text);
  };

  const handleSend = async () => {
    setLoading(true);
    setResult('');
    try {
      const fullPrompt = `${prompt}\n\n--- File Content ---\n${fileText}`;
      const res = await fetch('/api/admin/test-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: fullPrompt })
      });

      const raw = await res.text(); // no JSON.parse
      setResult(raw || 'No response text');

    } catch (err) {
      console.error('Error:', err);
      setResult('Error calling Gemini API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">🔬 Test Gemini API with Prompt & File</h1>

      <input
        type="file"
        accept=".txt"
        className="mb-4"
        onChange={handleFileChange}
      />

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Write your prompt here..."
        className="w-full border p-2 mb-4 h-24"
      />

      <button
        onClick={handleSend}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Sending...' : 'Send to Gemini'}
      </button>

      {result && (
        <pre className="mt-6 p-4 bg-gray-100 border rounded whitespace-pre-wrap">
          {result}
        </pre>
      )}
    </div>
  );
}
