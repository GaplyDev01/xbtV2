# XBT CoinGecko API Proxy with Vercel Edge Functions

This directory contains Edge Functions that proxy requests to the CoinGecko API.

## Implemented Endpoints

- `/api/coingecko/global` - Get global crypto market data
- `/api/coingecko/coins/markets` - Get market data for coins
- `/api/coingecko/coins/top_gainers_losers` - Get top gaining and losing coins

## Deployment

These API endpoints are deployed as Vercel Edge Functions. To deploy:

1. Make sure you have the Vercel CLI installed:
   ```
   npm install -g vercel
   ```

2. Set up your CoinGecko API key as an environment variable in Vercel:
   ```
   vercel env add COINGECKO_API_KEY
   ```

3. Deploy to Vercel:
   ```
   vercel
   ```

4. For production deployment:
   ```
   vercel --prod
   ```

## How It Works

Each endpoint is implemented as a Vercel Edge Function that:

1. Receives the request
2. Extracts query parameters
3. Makes a request to the CoinGecko API
4. Returns the response with appropriate CORS headers

The Edge Functions run at the edge of the network (closer to users) for lower latency.

## Configuration

The `vercel.json` file in the project root configures the Edge Functions with:

- Runtime specification (vercel-edge)
- Memory allocation (128 MB)
- Route mappings

## Error Handling

All endpoints include proper error handling to:

- Return appropriate HTTP status codes
- Include descriptive error messages
- Handle rate limiting
- Set CORS headers for cross-origin requests 