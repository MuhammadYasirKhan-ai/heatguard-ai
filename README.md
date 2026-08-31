# 🌡️ HeatGuard AI
**Urban Heat Risk Intelligence Platform**  
FortyGuard Hackathon'26 Submission

---

## What It Does
HeatGuard AI uses FortyGuard's NVIDIA-recognized Temperature API to deliver hyperlocal urban heat risk intelligence at **2m above ground, 20m² resolution** — powered by Claude AI for actionable analysis.

## Features
- Real-time heat risk analysis for any city
- AI-powered recommendations (Claude claude-sonnet-4-6)
- Vulnerable zone identification (neighborhood-level)
- 7-day AI heat forecast
- Multi-city comparison dashboard

---

## 🔐 Security Architecture

```
Browser  →  /api/fortyguard  →  FortyGuard API
Browser  →  /api/anthropic   →  Anthropic Claude API
```

**Zero API keys in client-side code.** Both proxies read credentials exclusively from Vercel Environment Variables.

---

## 🚀 Deploy to Vercel

### 1. Clone & deploy
```bash
git clone https://github.com/YOUR_USERNAME/heatguard-ai
cd heatguard-ai
vercel deploy
```

### 2. Set environment variables in Vercel Dashboard
Go to **Project → Settings → Environment Variables** and add:

| Variable | Value |
|---|---|
| `FORTYGUARD_API_KEY` | FortyGuard API key |
| `ANTHROPIC_API_KEY` | Anthropic API key |

### 3. Redeploy
```bash
vercel deploy --prod
```

---

## API Endpoints Used

| Proxy Route | Upstream |
|---|---|
| `POST /api/fortyguard` | `POST https://api.fortyguard.com/v1/heat-intelligence` |
| `POST /api/anthropic` | `POST https://api.anthropic.com/v1/messages` |

**FortyGuard request body:** `{ "location": "City, Country" }`  
**Anthropic model:** `claude-sonnet-4-6`, `max_tokens: 500`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML · CSS · Vanilla JS |
| Charts | Chart.js 4.4 |
| AI | Claude (claude-sonnet-4-6) |
| Data | FortyGuard Temperature API (LTM) |
| Backend | Vercel Serverless Functions |
| Secrets | Vercel Environment Variables |

---

## Challenge Tracks
Dashboards · Predictive Models · AI Agents

## Use Cases  
Resilient Cities · Government & Environment
