export const config = {
  runtime: 'edge'
};

export default async function handler(req: Request) {
  // Parse the request body to get the query
  const { query, timeout = false } = await req.json().catch(() => ({ query: '' }));
  
  // Set up headers for streaming response
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'X-Accel-Buffering': 'no' // Disable buffering in Nginx
  };

  // Create a text encoder
  const encoder = new TextEncoder();

  // Create a streaming response
  const stream = new ReadableStream({
    async start(controller) {
      // Send a start event
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start' })}\n\n`));
      
      try {
        // Simulate checking price - send an intermediate message
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'update', 
          content: 'Checking latest price data...' 
        })}\n\n`));
        
        // Wait 1 second to simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // If timeout flag is set, simulate a timeout
        if (timeout) {
          await new Promise(resolve => setTimeout(resolve, 30000)); // Long timeout
          return; // This would never reach the end
        }
        
        // Get simulated price data
        const priceData = {
          bitcoin: 71253.42,
          ethereum: 3836.74,
          solana: 182.45,
          timestamp: new Date().toISOString()
        };
        
        // Send price data
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'price', 
          content: `The current price of Bitcoin is $${priceData.bitcoin}`,
          data: priceData
        })}\n\n`));
        
        // Wait 1 second before sending final message
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Send a completion message
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'complete', 
          content: 'Price check complete. Anything else you need to know?' 
        })}\n\n`));
        
        // End the stream
        controller.close();
      } catch (error) {
        // Send error message
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'error', 
          content: 'An error occurred while fetching price data' 
        })}\n\n`));
        
        // End the stream
        controller.close();
      }
    }
  });

  // Return the streaming response
  return new Response(stream, { headers });
} 