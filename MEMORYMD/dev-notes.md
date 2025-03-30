# Development Notes

## Vercel Edge Functions Implementation - 2024-03-30

### Overview

Implemented Vercel Edge Functions to proxy requests to the CoinGecko API, resolving 404 errors for critical endpoints:
- `/api/coingecko/global`
- `/api/coingecko/coins/markets`
- `/api/coingecko/coins/top_gainers_losers`

### Technical Implementation

#### API Proxy Architecture

The implementation follows a proxy pattern:
1. Client makes request to Vercel Edge Function
2. Edge Function extracts parameters and forwards request to CoinGecko API
3. Edge Function receives response, applies CORS headers, and returns to client

This provides several benefits:
- Hides API key from client
- Enables caching at the edge
- Simplifies client-side code
- Provides unified error handling

#### Edge Function Configuration

```json
{
  "version": 2,
  "functions": {
    "api/coingecko/**/*.ts": {
      "runtime": "vercel-edge",
      "memory": 128
    }
  }
}
```

#### Performance Considerations

- **Memory Allocation**: 128MB per function for optimal cost/performance
- **Caching Strategy**: 
  - Global data: 60s cache, 120s stale-while-revalidate
  - Market data: 30s cache, 60s stale-while-revalidate
  - Top movers: 60s cache, 120s stale-while-revalidate
- **Error Handling**: Exponential backoff via axios-retry in the client

#### Special Implementation Notes

1. **Top Gainers/Losers Logic**:
   - CoinGecko doesn't have a direct endpoint for top gainers/losers
   - Implementation fetches market data and sorts client-side
   - Uses appropriate price change percentage fields based on timeframe

2. **CORS Implementation**:
   - All endpoints include proper CORS headers
   - OPTIONS requests are handled for preflight checks
   - Access-Control-Allow-Origin set to '*' for development

3. **API Key Management**:
   - API key stored as environment variable
   - Falls back to public key if not available (for development only)

### Deployment Instructions

1. Install Vercel CLI
   ```bash
   npm install -g vercel
   ```

2. Add API key to Vercel environment
   ```bash
   vercel env add COINGECKO_API_KEY
   ```

3. Deploy to Vercel
   ```bash
   vercel
   ```

4. For production deployment
   ```bash
   vercel --prod
   ```

### Monitoring and Maintenance

- Monitor CoinGecko API for changes in endpoints or response structure
- Watch for rate limiting issues (429 errors)
- Periodically review cache TTLs for performance optimization
- Consider implementing a fallback data source for high availability 