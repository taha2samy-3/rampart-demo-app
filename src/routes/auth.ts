import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config';

export const authRouter = Router();

const LoginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

authRouter.post('/login', (req: Request, res: Response) => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }

  const { username } = result.data;
  // Demo token signing
  const token = jwt.sign(
    { sub: username, role: username === 'admin' ? 'admin' : 'user' },
    config.jwtSecret,
    { expiresIn: '1h' }
  );

  return res.json({ token, type: 'Bearer' });
});

authRouter.get('/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    return res.json({ valid: true, payload });
  } catch (err: any) {
    return res.status(401).json({ error: 'Invalid token', message: err.message });
  }
});
