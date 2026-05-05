import express from 'express';
import { buildLlmsTxt, buildLlmsFullTxt } from '../../src/lib/aeo.mjs';

export const llmsRouter = express.Router();

llmsRouter.get('/llms.txt', async (req, res) => {
  try {
    const content = await buildLlmsTxt();
    res.set({
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    }).send(content);
  } catch (err) {
    res.status(500).send('# Error generating llms.txt');
  }
});

llmsRouter.get('/llms-full.txt', async (req, res) => {
  try {
    const content = await buildLlmsFullTxt();
    res.set({
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    }).send(content);
  } catch (err) {
    res.status(500).send('Error generating llms-full.txt');
  }
});
