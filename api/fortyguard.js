// api/fortyguard.js — Vercel Serverless Function
// Secure proxy: FortyGuard API key ONLY from env, never client-side.
// Supports BOTH endpoints:
//   POST /api/fortyguard?endpoint=heat-intelligence  → { location }
//   POST /api/fortyguard?endpoint=heatmap            → { polygon_aoi, date_time, ... }

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const FG_BASE = 'https://api.fortyguard.com/v1';

export default async function handler(req, res) {
  // ── Preflight ──────────────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: true, message: 'Method not allowed' });
  }

  // ── API key guard ──────────────────────────────────────────────────────
  const apiKey = process.env.FORTYGUARD_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: true,
      message: 'FORTYGUARD_API_KEY is not set in Vercel Environment Variables.',
    });
  }

  const endpoint = req.query?.endpoint ?? 'heat-intelligence';
  const body = req.body ?? {};

  // ── Route to correct FortyGuard endpoint ──────────────────────────────
  let fgUrl;
  let payload;

  if (endpoint === 'heatmap') {
    const { polygon_aoi, date_time, granularity = 100, analytic_type, threshold, direction } = body;
    if (!polygon_aoi || !date_time) {
      return res.status(400).json({
        error: true,
        message: 'heatmap endpoint requires polygon_aoi and date_time.',
      });
    }
    fgUrl = `${FG_BASE}/heatmap`;
    payload = {
      polygon_aoi,
      date_time,
      granularity,
      ...(analytic_type !== undefined && { analytic_type }),
      ...(threshold    !== undefined && { threshold }),
      ...(direction                  && { direction }),
    };
  } else {
    // heat-intelligence — city name lookup
    const { location } = body;
    if (!location || typeof location !== 'string' || !location.trim()) {
      return res.status(400).json({
        error: true,
        message: 'heat-intelligence endpoint requires { location: "City, Country" }.',
      });
    }
    fgUrl = `${FG_BASE}/heat-intelligence`;
    payload = { location: location.trim() };
  }

  // ── Proxy to FortyGuard ────────────────────────────────────────────────
  try {
    const upstream = await fetch(fgUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,          // FortyGuard's documented header
      },
      body: JSON.stringify(payload),
    });

    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: true, message: `FortyGuard returned non-JSON: ${text.slice(0, 200)}` };
    }

    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(upstream.status).json(data);

  } catch (err) {
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(502).json({
      error: true,
      message: 'Unable to reach FortyGuard API.',
      detail: err instanceof Error ? err.message : 'Unknown upstream error',
    });
  }
}
