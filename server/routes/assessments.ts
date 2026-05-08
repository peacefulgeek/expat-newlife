import express from 'express';
import { getAssessmentsFromJson } from '../../src/lib/db.mjs';

export const assessmentsRouter = express.Router();

// GET /api/assessments — list all assessments (summary only)
assessmentsRouter.get('/', async (req, res) => {
  try {
    const assessments = await getAssessmentsFromJson() as any[];
    // Return summary fields only (no questions/results for listing)
    const summaries = assessments.map((a: any) => ({
      slug: a.slug,
      title: a.title,
      subtitle: a.subtitle,
      meta_desc: a.meta_desc,
      hero_url: a.hero_bunny_url || a.hero_url,
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
    const assessments = await getAssessmentsFromJson() as any[];
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
