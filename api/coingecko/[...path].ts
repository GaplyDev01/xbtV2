import { corsHeaders } from './_utils';

export const config = {
  runtime: 'edge'
};

export default async function handler(req: Request) {
  // Extract the requested path for the response message
  const url = new URL(req.url);
  const path = url.pathname.replace('/api/coingecko', '');

  // Return a simple response
  return new Response(
    JSON.stringify({
      status: 'not_found',
      path: path,
      message: `The endpoint "${path}" is not available in this simplified version.`,
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