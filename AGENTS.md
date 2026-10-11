# AGENTS.md — EcoConsume AI Project Guide

This file provides context, commands, and conventions for AI assistants working in this repository.

## 1. Project Overview
**EcoConsume AI** is a full-stack household consumption predictor and eco-labeling tracking web application.
- **Goal**: Predict household item depletion dates, calculate 5-criterion Eco-Scores (A-E), generate automated smart shopping lists, recommend sustainable product alternatives, track waste, and gamify zero-waste living.
- **Framework**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + AppContext / Prisma.

## 2. Key Commands
- `npm run dev`: Start Next.js development server
- `npm run build`: Build production bundle
- `npm run start`: Start production server
- `npm run lint`: Run ESLint checks
- `npx prisma generate`: Regenerate Prisma Client schema

## 3. Tech Stack & Architecture
- **Frontend**: Next.js 14 App Router (`src/app`), TypeScript, Tailwind CSS, Lucide React icons, Recharts
- **State Management**: Client React Context (`src/context/AppContext.tsx`) with localStorage persistence fallback
- **Backend API Routes**:
  - `POST /api/predict-consumption`: Time-series moving average consumption prediction algorithm
  - `POST /api/eco-score`: Calculate 5-criterion Eco-Score & fetch Open Food Facts fallback
  - `GET /api/recommendations`: Sustainable product ranking algorithm
  - `GET /api/products`: Filterable product catalog endpoint
- **Database**: PostgreSQL with Prisma ORM (`prisma/schema.prisma`) & mock data layer (`src/data/seedData.ts`)

## 4. Key Algorithms & Formulas
1. **Eco-Score Weighted Formula**:
   $$\text{EcoScore} = (0.25 \times \text{Carbon}) + (0.20 \times \text{Sourcing}) + (0.20 \times \text{Packaging}) + (0.20 \times \text{Certifications}) + (0.15 \times \text{Transparency}) \times 100$$
   - Grade Mapping: A (80-100), B (65-79), C (50-64), D (35-49), E (<35)

2. **Consumption Prediction**:
   - $\text{Avg Daily Consumption} = \frac{\text{Quantity}}{\text{Base Lifespan Days}} \times \text{Household Scale}$
   - $\text{Days Remaining} = \lfloor \frac{\text{Current Stock}}{\text{Avg Daily Consumption}} \rfloor$
   - $\text{Predicted Empty Date} = \text{Current Date} + \text{Days Remaining}$

3. **Recommendation Ranking Score**:
   $$\text{Score} = 0.5 \times \text{EcoScoreNorm} + 0.3 \times \text{PriceScore} + 0.2 \times \text{Availability}$$

## 5. UI/UX Style Guidelines
- **Palette**: Primary Emerald (`#10B981`), Background Soft Cream (`#FEF3C7`) / White, Slate text (`#1F2937`)
- **Border Radius**: Rounded 16px (`rounded-2xl` / `rounded-xl`)
- **Design**: Mobile-first responsive with top Navbar and bottom MobileNav
