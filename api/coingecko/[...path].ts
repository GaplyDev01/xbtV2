import { corsHeaders, handleOptions } from './_utils';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }

  // Extract the requested path for the error message
  const url = new URL(req.url);
  const path = url.pathname.replace('/api/coingecko', '');

  // Return a friendly error message
  return new Response(
    JSON.stringify({
      error: 'We ran out of SOL',
      message: `The requested endpoint "${path}" is not available. Please check the API documentation.`,
      status: 404,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 404,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json',
      },
    }
  );
} 