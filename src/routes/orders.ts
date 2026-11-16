import { Router, Request, Response } from 'express';
import { query } from '../db/client';
import _ from 'lodash';

export const ordersRouter = Router();

// Secure parameterized search
ordersRouter.get('/', async (req: Request, res: Response) => {
  const customerId = req.query.customerId as string;
  try {
    if (customerId) {
      const result = await query('SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC', [customerId]);
      return res.json({ orders: result.rows });
    }
    const result = await query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 50');
    return res.json({ orders: result.rows });
  } catch (err: any) {
    return res.status(500).json({ error: 'Database query failed', message: err.message });
  }
});

// Demo search endpoint: concatenates user input directly into SQL (Intentional SAST test case)
ordersRouter.get('/search', async (req: Request, res: Response) => {
  const term = req.query.q as string;
  if (!term) {
    return res.status(400).json({ error: 'Search term "q" is required' });
  }

  try {
    // Dynamic raw SQL query for SAST testing
    const sql = `SELECT * FROM orders WHERE order_number = '${term}' OR customer_name LIKE '%${term}%'`;
    const result = await query(sql);
    return res.json({ results: result.rows });
  } catch (err: any) {
    return res.status(500).json({ error: 'Search failed', message: err.message });
  }
});

// Demo lodash merge endpoint (Intentional prototype pollution / lodash CVE test case)
ordersRouter.post('/sanitize', (req: Request, res: Response) => {
  const source = req.body;
  const target = {};
  // Vulnerable lodash deep merge test
  _.merge(target, source);
  return res.json({ processed: target });
});
