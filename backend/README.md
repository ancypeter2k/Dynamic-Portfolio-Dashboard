# Portfolio Dashboard Backend API

TypeScript backend API for the Portfolio Dashboard application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the TypeScript code:
```bash
npm run build
```

3. Start the server:
```bash
npm start
```

## Development

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/portfolio` - Get all portfolio data
- `GET /api/portfolio/charts` - Get chart data (pie and line charts)
- `GET /api/portfolio/table` - Get table data with optional filters (query params: search, exchange, status)
- `GET /api/portfolio/summary` - Get summary statistics
- `GET /api/portfolio/sectors` - Get sector-wise aggregated data

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Main server file
│   ├── routes/
│   │   └── portfolio.ts      # Portfolio routes
│   ├── services/
│   │   ├── yahooService.ts  # Yahoo Finance API service
│   │   └── googleService.ts  # Google Finance API service
│   ├── utils/
│   │   └── readExcel.ts      # Excel file reader
│   └── types/
│       ├── index.ts          # Type definitions
│       └── globals.d.ts      # Global declarations
├── data/
│   └── portfolio.xlsx        # Portfolio data file
├── dist/                     # Compiled JavaScript (generated)
└── tsconfig.json             # TypeScript configuration
```

