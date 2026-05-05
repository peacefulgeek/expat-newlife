import express from 'express';
import { query } from '../../src/lib/db.mjs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Try assessments-db.json (primary) then assessments.json (legacy)
const ASSESSMENTS_PATHS = [
  path.resolve(__dirname, '../../src/data/assessments-db.json'),
  path.resolve(__dirname, '../../src/data/assessments.json'),
];

export const assessmentsRouter = express.Router();

async function getAssessmentsFromJson() {
  for (const p of ASSESSMENTS_PATHS) {
    try {
      const raw = await fs.readFile(p, 'utf8');
      const data = JSON.parse(raw);
      // Support both array and { assessments: [...] } format
      return Array.isArray(data) ? data : (data.assessments || []);
    } catch {
      continue;
    }
  }
  return [];
}

async function getAssessments() {
  try {
    const { rows } = await query(`SELECT * FROM assessments ORDER BY created_at DESC`);
    if (rows.length > 0) return rows;
    throw new Error('No rows');
  } catch {
    return getAssessmentsFromJson();
  }
}

// GET /api/assessments — list all assessments (summary only)
assessmentsRouter.get('/', async (req, res) => {
  try {
    const assessments = await getAssessments();
    // Return summary fields only (no questions/results for listing)
    const summaries = assessments.map((a: any) => ({
      slug: a.slug,
      title: a.title,
      subtitle: a.subtitle,
      meta_desc: a.meta_desc,
      hero_url: a.hero_url,
      estimated_minutes: a.estimated_minutes,
      question_count: a.question_count || (a.questions ? a.questions.length : 0),
    }));
    res.set('Cache-Control', 'public, max-age=600');
    res.json({ assessments: summaries });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

// GET /api/assessments/:slug — full assessment with questions
assessmentsRouter.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const assessments = await getAssessments();
    const assessment = assessments.find((a: any) => a.slug === slug);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    res.set('Cache-Control', 'public, max-age=600');
    res.json({ assessment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
});
