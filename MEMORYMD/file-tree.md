# File Tree

## API Structure

```
xbt/
├── api/                           # Vercel API endpoints
│   ├── README.md                  # Documentation for API endpoints
│   └── coingecko/                 # CoinGecko API proxy endpoints
│       ├── _utils.ts              # Utility functions for API requests
│       ├── global.ts              # Global market data endpoint
│       └── coins/                 # Coin-specific endpoints
│           ├── markets.ts         # Markets data endpoint
│           └── top_gainers_losers/# Top gainers and losers endpoint
│               └── index.ts       # Implementation of top gainers/losers
├── vercel.json                    # Vercel configuration
└── MEMORYMD/                      # Project documentation
    ├── task-log.md                # Task tracking and progress
    └── file-tree.md               # Project structure (this file)
```

## API Endpoints Overview

### CoinGecko API Proxy

The API implements a proxy to the CoinGecko API with the following endpoints:

| Endpoint | Function | Description |
|----------|----------|-------------|
| `/api/coingecko/global` | `global.ts` | Retrieves global cryptocurrency market data |
| `/api/coingecko/coins/markets` | `coins/markets.ts` | Gets market data for multiple cryptocurrencies |
| `/api/coingecko/coins/top_gainers_losers` | `coins/top_gainers_losers/index.ts` | Provides lists of top gaining and losing cryptocurrencies |

### Implementation Details

All endpoints are implemented as Vercel Edge Functions for improved performance and lower latency. Key implementation features include:

- **Utility Module**: The `_utils.ts` file contains shared functions for making API requests, handling errors, and managing CORS headers
- **Error Handling**: All endpoints include comprehensive error handling with appropriate status codes
- **Parameter Forwarding**: Query parameters from the original request are forwarded to the CoinGecko API
- **CORS Support**: All responses include proper CORS headers for cross-origin access
- **Caching**: HTTP cache headers are set for improved performance 