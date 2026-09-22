import app from '../server';

// Export the Express app directly for Vercel Serverless Function execution
export default function handler(req: any, res: any) {
  return app(req, res);
}
