import type { Request, Response } from 'express';
import app from '../server.ts';

export default function handler(req: Request, res: Response) {
  // When running on Vercel, rewrites may pass "/api/..." or strip the prefix to "/..."
  // Normalize req.url so all Express route handlers registered under "/api/..." match seamlessly
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : `/${req.url}`);
  }
  return app(req, res);
}
