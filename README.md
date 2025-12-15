# 8byteai – Dynamic Portfolio Dashboard (Full Stack)

## 1. Overview

This project is a **full‑stack portfolio analytics dashboard** that:
- Reads holdings from an **Excel (.xlsx)** file.
- Enriches them with **market and fundamentals data** (CMP, P/E, earnings).
- Computes **investment, gain/loss, returns, sector breakdown, and revenue**.
- Presents everything in a **modern Next.js UI** with charts, filters, tables and CSV export.

The stack:
- **Frontend**: Next.js App Router, TypeScript, Tailwind CSS.
- **Backend**: Node.js, Express, TypeScript.
- **Data**: Excel (`portfolio.xlsx`), Yahoo/Google‑style fundamentals.

### Technical Document (Short Summary)

- **Unofficial / unstable financial APIs**: Solved by treating Excel as the primary data source and wrapping all external calls in typed services with strong error handling and graceful fallbacks.
- **Performance with many stocks**: Solved by doing heavy computation on the backend and using `Promise.all` for parallel requests so the UI only renders final DTOs.
- **Messy Excel input**: Solved via a strict filtering/validation pipeline that skips invalid rows and normalises all numeric fields before calculations.
- **Robust UX under failures**: Solved with explicit loading/error states, a `/health` pre‑check, and backend routes that return partial but consistent data instead of crashing.
- **Clean, extensible structure**: Solved by splitting backend into routes/services/utils/types and frontend into one orchestrating page plus focused UI components, all in TypeScript.

---

## 2. Architecture (Section‑wise)

### 2.1 Backend Architecture (`backend/`)

- **Entry point**
  - `src/index.ts`: Express app bootstrap, CORS, JSON parsing, health check, mounts portfolio routes.

- **Routes / Interfaces**
  - `src/routes/portfolio.ts`:
    - `GET /api/portfolio` – full enriched list (backwards‑compat).
    - `GET /api/portfolio/charts` – top‑N for pie & gain/loss charts.
    - `GET /api/portfolio/summary` – aggregated totals & return.
    - `GET /api/portfolio/table` – table data with query filters.
    - `GET /api/portfolio/sectors` – sector‑wise aggregation.

- **Domain & Logic**
  - **Excel reading**: `src/utils/readExcel.ts`
    - Reads `data/portfolio.xlsx` and returns rows as `ExcelRow`.
  - **Core portfolio logic** inside `getEnrichedPortfolioData()` in `portfolio.ts`:
    - Filters out non‑stock rows.
    - Maps Excel columns to `StockData`.
    - Enriches with fundamentals via services.
    - Computes portfolio percentage.

- **External services (Infrastructure)**
  - `src/services/yahooService.ts`: CMP and market data (Yahoo‑style).
  - `src/services/googleService.ts`: P/E and earnings (Google‑style / mocked).

- **Types**
  - `src/types/index.ts`:
    - `StockData`, `ExcelRow`, `ChartResponse`, `SummaryResponse`, `SectorData`, `SectorMap`.
  - `src/types/globals.d.ts`: global declarations.

Backend is deliberately structured so **Express routes are thin**, and heavy logic lives in helpers/services and strongly typed models, following **SRP** and moving towards a **clean architecture** style.

### 2.2 Frontend Architecture (`frontend/`)

- **App shell**
  - `src/app/layout.tsx`: global HTML shell and layout.
  - `src/app/globals.css`: Tailwind + global styles.
  - `src/app/icon.tsx`: custom 💰 favicon icon.
  - `src/app/page.tsx`: main dashboard page (`PortfolioDashboard`).

- **Core page logic (`page.tsx`)**
  - Central orchestrator for:
    - Fetching data from backend (summary, charts, sectors, table).
    - Managing loading, error, filters, last‑updated timestamp.
    - CSV export.
  - Uses **axios** and environment variable `NEXT_PUBLIC_API_URL`.

- **UI Components (pure, presentation‑focused)**
  - `SummaryCards.tsx`: top KPI cards (investment, value, gain/loss, revenue, overall return).
  - `PortfolioCharts.tsx`: SVG‑based **pie chart** (top 8 holdings) and **line chart** (top 5 gains/losses).
  - `SearchFilters.tsx`: search, exchange, status filters + CSV download button.
  - `PortfolioTable.tsx`: tabular holdings display.
  - `SectorSummary.tsx`: sector‑wise allocation and performance.

- **Shared types**
  - `src/types.ts`: frontend versions of `StockData`, `FilterState`, chart and sector DTOs.

Separation of concerns:
- **Data orchestration** in `page.tsx`.
- **Pure UI** in `components/*`.
- **Cross‑cutting types** in `types.ts`.

---

## 3. Data & Business Logic (End‑to‑End)

### 3.1 Excel → Domain Model

- File: `backend/data/portfolio.xlsx`.
- Parsed via `readExcel()`:
  - Reads raw rows, preserving columns like:
    - `__EMPTY_1`: stock name (Particulars).
    - `__EMPTY_2`: purchase price.
    - `__EMPTY_3`: quantity.
    - `__EMPTY_4`: investment.
    - `__EMPTY_6`: symbol.
    - `__EMPTY_7`: CMP / sector.
    - `__EMPTY_8`: present value.
    - `__EMPTY_9`: gain/loss.
    - `__EMPTY_12`: P/E.
    - `__EMPTY_13`: earnings.
    - `Core Fundamentals`: revenue.

### 3.2 Validation & Filtering (Backend)

In `getEnrichedPortfolioData()`:
- **Row filtering**
  - Skip rows where:
    - `stock['__EMPTY_1']` is empty.
    - Name equals "Particulars" or "Financial Sector" (header/summary rows).
    - `__EMPTY_4` (Investment) is not a positive number.
- **Type validation**
  - Numeric columns cast to `number` with safe fallbacks (`|| 0`).
  - CMP:
    - Handles number or string.
    - Parses string using `parseFloat` with fallback 0.
- **Fallback on errors**
  - If per‑stock enrichment fails:
    - Log error and return a minimally valid `StockData` row.

### 3.3 Enrichment with Fundamentals

- **P/E & Earnings**
  - First prefer values embedded in Excel (`__EMPTY_12`, `__EMPTY_13`).
  - If missing/zero:
    - Build API symbol (append `.NS` if no exchange suffix).
    - Call `getFundamentals(symbolForAPI)` from `googleService`.
    - Normalise:
      - P/E: parse string, treat `"N/A"` as 0.
      - Earnings: strip currency symbol/whitespace (e.g. `₹`) before parsing.
- **CMP**
  - Primarily read from Excel `__EMPTY_7` (for speed and stability).
  - If used, Yahoo service maps symbol to live CMP.

### 3.4 Aggregations & Derived Metrics

- **Per‑stock**
  - `investment`: from Excel.
  - `presentValue`: from Excel.
  - `gainLoss`: from Excel.
  - `portfolioPercent`: computed as:
    \[
      \text{investment} / \text{totalInvestment} \times 100
    \]

- **Summary (`/summary`)**
  - Iterates all `StockData`:
    - `totalInvestment` (sum of `investment`).
    - `currentValue` (sum of `presentValue`).
    - `totalGainLoss` (sum of `gainLoss`).
    - `totalGain` (sum of positive `gainLoss`).
    - `totalLoss` (sum of absolute negative `gainLoss`).
  - **Revenue**:
    - Re‑reads Excel, filters valid rows with `Core Fundamentals` numeric.
    - Sums `Core Fundamentals` as `totalRevenue`.
  - **Overall return**:
    \[
      \text{overallReturn} = (\text{totalGainLoss} / \text{totalInvestment}) \times 100
    \]

- **Charts (`/charts`)**
  - **Pie chart (Top 8 by investment)**:
    - Sort descending by `investment`.
    - Take top 8, calculate share of top‑sum as `percent`.
    - Attach pre‑defined colour palette.
  - **Line chart (Top 5 gain/loss)**:
    - Sort by absolute `gainLoss`.
    - Prefer a mix of:
      - Up to 3 top gains.
      - Up to 3 top losses.
    - Fallback: top 5 by absolute `gainLoss` if only gains or only losses.

- **Sector summary (`/sectors`)**
  - Builds a `SectorMap` keyed by sector name:
    - `investment`, `presentValue`, `gainLoss`, `count`.
  - Produces `SectorData[]`:
    - `returnPercent = gainLoss / investment * 100`.
  - Sorted descending by investment.

- **Table filters (`/table`)**
  - Query params:
    - `search`: text in `name` or `symbol` (case‑insensitive).
    - `exchange`: `'NSE'`, `'BSE'`, or `'All Exchanges'`.
    - `status`: `'Gain' | 'Loss' | 'Neutral' | 'All Statuses'`.
  - Filters applied sequentially on in‑memory `StockData[]`.

---

## 4. Validation, Error Handling & UX Guarantees

### 4.1 Backend Validation & Error Handling

- **Input data validation**
  - Excel rows filtered for:
    - Valid stock name.
    - Positive numeric investment.
    - Presence of required numeric columns (when used).
- **Service‑level validation**
  - Fundamentals API:
    - Safely handles `"N/A"` and malformed numeric strings.
    - Catches and logs API failures (per symbol).
  - CMP and other numeric fields:
    - Typed as `number` with robust parsing.
- **Route‑level guarantees**
  - All `/api/portfolio/*` routes:
    - Wrap logic in `try/catch`.
    - On error, log server‑side and respond with:
      - `500` status.
      - JSON payload: `{ error, details }`.
    - Never throw raw errors to the client.

### 4.2 Frontend Validation & UX

- **Connectivity checks**
  - `page.tsx` calls `/health` before fetching main data.
  - If backend is unreachable, shows a clear error:
    - "Cannot connect to backend at …"

- **Data loading & error states**
  - `loading` flag: shows a "Loading portfolio data…" message.
  - `error` state:
    - Displays descriptive error text above the dashboard.
    - Clears data arrays to avoid stale UI.
  - Fallback cards/sections:
    - If no data, shows a "No Portfolio Data Available" card.

- **Filters & table validation**
  - Filters are typed as `FilterState` and default to `null` (no filter).
  - Filter requests:
    - Use `axios` with `params`.
    - Errors during filter fetch are logged but do not crash the page.

- **CSV export**
  - Export uses the current `tableData` only.
  - Wraps file creation in `try/catch` and logs any failure.

---

## 5. Setup & Environment

### 5.1 Prerequisites

- Node.js **18+**
- npm
- An Excel file at `backend/data/portfolio.xlsx` with the expected columns.

### 5.2 Environment Variables

- **Backend** (`backend/env.example` → `.env`):
  - `PORT=8000`
  - `ALLOWED_ORIGINS=http://localhost:3000`
  - `YAHOO_FINANCE_BASE_URL=` (optional)
  - `GOOGLE_FINANCE_BASE_URL=` (optional)

- **Frontend** (`frontend/env.example` → `.env.local`):
  - `NEXT_PUBLIC_API_URL=http://localhost:8000`

All `.env*` files are **git‑ignored**; only the examples are committed.

### 5.3 Install & Run

- **Backend**
  - `cd backend`
  - `npm install`
  - Copy `env.example` → `.env` and adjust.
  - Place `portfolio.xlsx` in `backend/data/`.
  - `npm run build` (if configured) or `npm run dev` / `npm start` (depending on `package.json`).

- **Frontend**
  - `cd frontend`
  - `npm install`
  - Copy `env.example` → `.env.local` and adjust `NEXT_PUBLIC_API_URL`.
  - `npm run dev`
  - Open `http://localhost:3000`.

---

## 6. API Reference (Backend)

Base URL (local): `http://localhost:8000`

- **Health**
  - `GET /health` → `{ status: 'ok' }`.

- **Portfolio data**
  - `GET /api/portfolio`  
    - Full `StockData[]` with all enriched fields.
  - `GET /api/portfolio/charts`  
    - Returns:
      - `pieChart`: top 8 by investment.
      - `lineChart`: up to 5 mixed top gains/losses.
  - `GET /api/portfolio/summary`  
    - Returns `SummaryResponse` with totals, revenue, overall return, and `isGain`.
  - `GET /api/portfolio/sectors`  
    - Returns `SectorData[]` with investment, presentValue, gainLoss, count, returnPercent, sorted by investment.
  - `GET /api/portfolio/table?search=&exchange=&status=`  
    - Filtered `StockData[]` per query parameters.

All endpoints return typed JSON responses consumed directly by the Next.js frontend.

---

## 7. Technical Document – Challenges & Solutions

### 7.1 Working with Unofficial / Fragile Financial APIs

- **Challenge**  
  - Yahoo and Google Finance don’t expose stable, official APIs. Response formats and rate limits can change without notice.
- **Solution**  
  - Designed the backend so **Excel is the primary data source** for CMP, P/E, and earnings, with external calls as best‑effort enrichment.
  - Wrapped all API calls in **service modules** with:
    - Strict typing.
    - Normalisation of `"N/A"` / malformed values.
    - Graceful fallback to Excel data on failure.

### 7.2 Keeping the Dashboard Fast with Multiple Stocks

- **Challenge**  
  - Naively calling external APIs sequentially for each stock would make the page slow and flaky.
- **Solution**  
  - Use `Promise.all` for **parallel API requests** where needed.
  - Push as much computation as possible into the backend:
    - Single aggregation pass per request.
    - Frontend only renders final DTOs.

### 7.3 Cleaning & Validating Semi‑Structured Excel Data

- **Challenge**  
  - Excel contains headers, sector totals, and human‑entered mistakes; direct ingestion would break calculations.
- **Solution**  
  - Introduced a **strict filtering pipeline**:
    - Remove header/summary rows by name.
    - Require numeric, positive investment before including a row.
    - Enforce numeric casting for all calculated fields with safe fallbacks.

### 7.4 Robust UX Under Backend or Data Failures

- **Challenge**  
  - Network issues, API failures, or malformed Excel rows should not break the dashboard.
- **Solution**  
  - Clear separation of states on the frontend (`loading`, `error`, empty data).
  - Health check before fetching main data to provide **actionable error messages**.
  - Backend returns partial but consistent datasets where possible and includes `details` in error payloads for debugging.

### 7.5 Clean, Extensible Architecture Under Time Constraints

- **Challenge**  
  - Need to keep the codebase small and readable while still respecting **SOLID** ideas and enabling future extension.
- **Solution**  
  - Split backend into **routes, services, utils, and types** instead of a single monolith file.
  - Split frontend into a **single orchestrating page** plus **pure UI components**.
  - Used TypeScript everywhere to make future refactors safer.

---

## 8. Project Structure (High Level)

```text
8byteai/
  backend/
    data/              # Excel input
    src/
      index.ts         # Express bootstrap
      routes/
        portfolio.ts   # All portfolio endpoints & main orchestration
      services/
        yahooService.ts
        googleService.ts
      utils/
        readExcel.ts
      types/
        index.ts
        globals.d.ts
    dist/              # Compiled JS (ignored by git)

  frontend/
    src/
      app/
        layout.tsx
        page.tsx       # PortfolioDashboard
        globals.css
        icon.tsx
      components/
        SummaryCards.tsx
        PortfolioCharts.tsx
        SearchFilters.tsx
        PortfolioTable.tsx
        SectorSummary.tsx
      types.ts
    public/
      tailwind.css
```

---

## 9. Author & License

- **Author**: Ancy Peter – Full‑Stack Developer (MERN / Next.js)
- **Purpose**: Educational / assessment case study.

This project is provided **for learning and demonstration** purposes only.

