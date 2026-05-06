import express from 'express';
import { buildLlmsTxt, buildLlmsFullTxt, buildAiTxt } from '../../src/lib/aeo.mjs';

export const llmsRouter = express.Router();

llmsRouter.get('/llms.txt', async (req, res) => {
  try {
    const content = await buildLlmsTxt(req);
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
    const content = await buildLlmsFullTxt(req);
    res.set({
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    }).send(content);
  } catch (err) {
    res.status(500).send('Error generating llms-full.txt');
  }
});

llmsRouter.get('/ai.txt', (req, res) => {
  try {
    const content = buildAiTxt(req);
    res.set({
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    }).send(content);
  } catch (err) {
    res.status(500).send('Error generating ai.txt');
  }
});
