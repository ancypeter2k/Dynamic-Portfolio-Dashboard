# Dynamic Portfolio Dashboard

A **full‑stack portfolio analytics dashboard** that reads stock holdings from an Excel file and presents clean, useful insights through a modern web UI.

This project is built as an **assessment case study**, with a focus on clean architecture, strong data validation, and a resilient user experience even under failure scenarios.

---

## What the Project Does

* Reads stock holdings from an **Excel (.xlsx)** file
* Enriches data with **CMP, P/E, earnings, and revenue** (with safe fallbacks)
* Calculates:

  * Total investment
  * Current value
  * Gain / loss
  * Overall return
  * Sector‑wise allocation
* Displays everything in a **Next.js dashboard** with:

  * Summary cards
  * Charts
  * Filters
  * Table view
  * CSV export

---

## Tech Stack

### Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS

### Backend

* Node.js
* Express
* TypeScript

### Data Source

* Excel file (`portfolio.xlsx`)
* Yahoo / Google‑style finance services (best‑effort, optional)

---

## High‑Level Architecture

```
Excel (.xlsx)
   ↓
Backend (Node + Express)
   - Read & validate Excel
   - Enrich with market data
   - Calculate totals & charts
   - Expose REST APIs
   ↓
Frontend (Next.js)
   - Fetch APIs
   - Handle loading & errors
   - Render charts, cards & tables
```

The **backend handles all heavy computation**. The frontend only renders final, clean data.

---

## Backend Overview (`backend/`)

### Responsibilities

* Read and clean Excel data
* Enrich stocks with CMP, P/E, and earnings
* Calculate summaries, charts, and sector data
* Serve typed REST APIs

### Key Files

* `src/index.ts` – Express app setup and health check
* `src/routes/portfolio.ts` – All portfolio-related APIs
* `src/utils/readExcel.ts` – Excel parsing and validation
* `src/services/` – Yahoo / Google finance services
* `src/types/` – Shared backend types

### API Endpoints

* `GET /health` – Backend health status
* `GET /api/portfolio` – Full portfolio list
* `GET /api/portfolio/summary` – Totals and returns
* `GET /api/portfolio/charts` – Chart data
* `GET /api/portfolio/sectors` – Sector breakdown
* `GET /api/portfolio/table` – Filtered table data

---

## Frontend Overview (`frontend/`)

### Responsibilities

* Fetch data from backend APIs
* Handle loading and error states
* Render the dashboard UI

### Key Files

* `src/app/page.tsx` – Main dashboard orchestration
* `src/components/` – Reusable UI components

  * Summary cards
  * Charts
  * Filters
  * Table
  * Sector summary
* `src/types.ts` – Frontend data types

> **Design principle:** One page for data orchestration, many small UI components.

---

## Data Flow

1. Excel rows are read from `portfolio.xlsx`
2. Invalid or summary rows are skipped
3. Numeric values are cleaned and normalised
4. Optional market data is fetched safely
5. Backend calculates:

   * Investment totals
   * Gain / loss
   * Returns
   * Sector‑wise data
6. Frontend renders the final result

If any step fails, the application **continues to work with partial data**.

---

## Error Handling

* Backend never crashes on malformed Excel rows
* External API failures gracefully fall back to Excel values
* Frontend provides:

  * Loading states
  * Clear error messages
  * Empty‑state UI when data is unavailable
* A health check runs before main API calls

---

## Local Setup

### Prerequisites

* Node.js
* npm

### Backend Setup

```bash
cd backend
npm install
cp env.example .env
npm run dev
```

Place `portfolio.xlsx` inside `backend/data/`.

### Frontend Setup

```bash
cd frontend
npm install
cp env.example .env.local
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Project Structure

```
8byteai/
  backend/
    src/
    data/
  frontend/
    src/
```

---

## Author

**Ancy Peter**
Full‑Stack Developer (MERN / Next.js)
