# Cross-State Ad Compliance Agent

A production-ready **Next.js (App Router)** single-page application for evaluating alcohol advertising copy against simplified, state-specific compliance rules for **Utah** and **Nevada**. The UI is built with **Tailwind CSS** (dark theme) and powered by **OpenAI** (`gpt-4o-mini`) via a server-side API route.

Deploy-ready for [Vercel](https://vercel.com).

---

## Features

- **Script analyzer** — Paste ad copy or load one of three built-in demo scenarios, then run an AI compliance check.
- **Live verdicts** — Side-by-side Utah and Nevada cards with `APPROVED` / `REJECTED` status, badges, and AI explanations.
- **Interactive map** — Conceptual 5×10 U.S. grid; click Utah or Nevada to view that state’s rule in the detail panel.
- **Strict JSON API** — `POST /api/analyze` returns a typed response enforced by a deterministic system prompt.
- **Vercel-ready** — Standard Next.js build; set `OPENAI_API_KEY` in the Vercel project dashboard.

---

## Compliance rules

The AI applies exactly two rules (no other jurisdictions):

| State  | Rule | Approved when | Rejected when |
|--------|------|---------------|---------------|
| **Nevada** | **21+ explicit** | Script contains the exact text `21+` | `21+` is missing anywhere |
| **Utah** | **No party words** | Script has none of the banned lifestyle terms | Script contains any of: `party`, `beach`, `club`, `friends`, `nightlife`, `fun` (case-insensitive) |

### Demo scenarios

| Scenario | Expected outcome |
|----------|------------------|
| **1 – Fully compliant** | Utah ✅ Nevada ✅ |
| **2 – Nevada only** | Utah ❌ Nevada ✅ |
| **3 – Total failure** | Utah ❌ Nevada ❌ |

Scripts are defined in [`src/app/data.ts`](src/app/data.ts).

---

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 3](https://tailwindcss.com/)
- [OpenAI Node SDK](https://github.com/openai/openai-node)

---

## Prerequisites

- **Node.js** 18.18+ (recommended: 20+)
- **npm** (or pnpm / yarn)
- An [OpenAI API key](https://platform.openai.com/api-keys)

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/adriensenghor/ad-compliance-ai-agent.git
cd ad-compliance-ai-agent
npm install
```

### 2. Configure environment variables

Create `.env.local` in the project root:

```env
OPENAI_API_KEY=sk-your-key-here
```

> **Security:** Never commit `.env.local` or expose your API key in client-side code. The key is only read on the server in the API route.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Production build (optional)

```bash
npm run build
npm start
```

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key used by `/api/analyze` |

For local development, use `.env.local`. On Vercel, add the same variable under **Project → Settings → Environment Variables**.

---

## API

### `POST /api/analyze`

Evaluates an alcohol ad script against Utah and Nevada rules.

**Request**

```http
POST /api/analyze
Content-Type: application/json

{
  "script": "Your ad copy here..."
}
```

**Success response** `200`

```json
{
  "utah": {
    "status": "APPROVED",
    "explanation": "..."
  },
  "nevada": {
    "status": "REJECTED",
    "explanation": "..."
  }
}
```

**Error responses**

| Status | Cause |
|--------|--------|
| `400` | Missing or invalid `script` |
| `500` | Missing `OPENAI_API_KEY` or unexpected server error |
| `502` | OpenAI returned invalid or unparseable JSON |

---

## Project structure

```
ad-compliance-ai-agent/
├── src/
│   └── app/
│       ├── api/
│       │   └── analyze/
│       │       └── route.ts    # OpenAI compliance endpoint
│       ├── data.ts             # Rules, scenarios, TypeScript types
│       ├── globals.css         # Tailwind + base styles
│       ├── layout.tsx          # Root layout
│       └── page.tsx            # Dashboard UI
├── next.config.mjs
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── package.json
```

---

## Deploy on Vercel

1. Push this repository to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Add environment variable: `OPENAI_API_KEY`.
4. Deploy (framework preset: **Next.js**).

Vercel will run `npm run build` automatically. No extra configuration is required.

---

## npm scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm start` | Run production server (after build) |
| `npm run lint` | Run ESLint |

---

## How it works

1. The browser sends the script to `POST /api/analyze`.
2. The API route initializes the official OpenAI client with `process.env.OPENAI_API_KEY`.
3. A strict system prompt encodes the Nevada and Utah rules and requires a JSON object matching `ComplianceResponse`.
4. The model (`gpt-4o-mini`, `temperature: 0`, `response_format: json_object`) returns structured verdicts.
5. The dashboard renders Utah and Nevada cards and updates the rule panel when you click states on the map.

---

## License

ISC
