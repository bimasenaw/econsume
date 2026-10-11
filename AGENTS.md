# AGENTS.md — EcoConsume AI Project Guide

This file provides context, commands, and conventions for AI assistants working in this repository.

## 1. Project Overview
**EcoConsume AI** is an **empirical-first** household consumption & waste tracker with transparent product data.
- **Goal**: Track real consumption/purchases, measure waste output, guide sorting, and surface *real* product
  eco-data — **never fabricated predictions**. Insufficient data must be shown as "data belum cukup".
- **Framework**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + React Context (no database).

## 2. Key Commands
- `npm run dev`: Start Next.js development server
- `npm run build`: Build production bundle
- `npm run start`: Start production server
- `npm run lint`: Run ESLint checks
- `npm run typecheck`: Run TypeScript type check (`tsc --noEmit`)

## 3. Tech Stack & Architecture
- **Frontend**: Next.js 14 App Router (`src/app`), TypeScript, Tailwind CSS, Lucide React, Plus Jakarta Sans
- **State Management**: Client React Context (`src/context/AppContext.tsx`) + LocalStorage
- **Barcode & AI**:
  - `html5-qrcode` powers the camera barcode scanner (`src/components/BarcodeScanner.tsx`)
  - **Open Food Facts** (`src/lib/openfoodfacts.ts`) provides real product data & Eco-Score (no API key)
  - Gemini Vision (`src/lib/gemini.ts`) is limited to **reading** product type/packaging from photos
- **Empirical tracking**: `src/lib/tracking.ts` computes consumption rate from purchase history and
  waste summary from logs. Reference constants + citations live in `src/data/reference.ts`.
- **PWA**: `public/sw.js` + `public/offline.html` + `src/components/ServiceWorkerRegister.tsx`
- **Backend API Routes**:
  - `GET /api/products?source=off&q=` → Open Food Facts search; `source=curated` → local sample catalog
  - `GET/POST /api/eco-score?barcode=` → real product data + Eco-Score from OFF
  - `POST /api/predict-consumption` → consumption rate from purchase history (empirical)
  - `POST /api/ai-detect` → rule-based SIH estimate (manual measured input)
  - `POST /api/gemini-detect` → Gemini reads packaging photo
  - `GET /api/recommendations` → ranking for the curated sample catalog
- **Data**: `src/data/seedData.ts` (30 sample products + initial logs). No database — state in LocalStorage.

## 4. Key Algorithms & Formulas (ALL empirical / cited)
1. **Empirical consumption rate** (`src/lib/tracking.ts`):
   - `rate = Σ purchased qty ÷ observed span (days)`; requires ≥ 2 purchases and ≥ 14 days, else `insufficient`.
   - `daysRemaining = ⌊currentStock ÷ rate⌋` — only when `sufficient === true`.

2. **Waste summary** (`src/lib/tracking.ts` + `src/data/reference.ts`):
   - `kg = Σ (qty × UNIT_TO_KG)`, `CO₂e = Σ (kg × factor)`, `perCapita = kg ÷ household ÷ days`.
   - Factors: Poore & Nemecek (2018) for food; ADEME (indicative) for materials.
   - National benchmark: SIPSN KLHK total ÷ BPS population ÷ 365.

3. **Curated catalog Eco-Score** (sample items only):
   `EcoScore = (0.25·Carbon + 0.20·Sourcing + 0.20·Packaging + 0.20·Cert + 0.15·Transparency) × 100`
   - A (80–100), B (65–79), C (50–64), D (35–49), E (<35). Real products use OFF's `ecoscore_grade`.

## 5. Conventions (IMPORTANT)
- **No fabricated numbers.** Every displayed metric must trace to user logs or a cited factor.
- When data is missing, show an explicit "belum cukup / belum tersedia" state.
- Reference constants must include `source` + `sourceUrl`.
- UI palette: Emerald `#10B981`, Cream `#FEF3C7`, Slate text. Rounded 16px (`rounded-2xl`/`rounded-xl`).
- Mobile-first, accessible (labels, `role="alert"`, cursor-pointer, visible focus, reduced-motion).
