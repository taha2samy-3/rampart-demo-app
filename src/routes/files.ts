import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export const filesRouter = Router();

// Demo download endpoint (Intentional Path Traversal test case for Semgrep)
filesRouter.get('/download', (req: Request, res: Response) => {
  const fileName = req.query.file as string;
  if (!fileName) {
    return res.status(400).json({ error: 'File name required' });
  }

  // Vulnerable pattern: unvalidated path concatenation
  const filePath = path.join('/tmp/storage', fileName);

  try {
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    return res.status(404).json({ error: 'File not found' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to access file', message: err.message });
  }
});
