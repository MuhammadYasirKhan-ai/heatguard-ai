// api/anthropic.js — Vercel Serverless Function
// Secure proxy for Claude AI calls. ANTHROPIC_API_KEY only from env.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: true, message: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: true,
      message: 'ANTHROPIC_API_KEY is not set in Vercel Environment Variables.',
    });
  }

  const { prompt } = req.body ?? {};
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: true, message: 'Body must include { prompt: string }.' });
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,   // Increased from 500 — prevents cut-off responses
        messages: [{ role: 'user', content: prompt.trim() }],
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(upstream.status).json({
        error: true,
        message: data?.error?.message ?? `Anthropic error ${upstream.status}`,
      });
    }

    const text = (data.content ?? [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('') ?? '';

    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(200).json({ text });

  } catch (err) {
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(502).json({
      error: true,
      message: 'Unable to reach Anthropic API.',
      detail: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
