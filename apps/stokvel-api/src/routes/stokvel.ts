import { toMemberId, toStokvelId } from '@seyva/types';
import { ContributionCreateSchema } from '@seyva/validation';
import { Hono } from 'hono';
import { logger } from '../lib/logger.js';
import type { createAuthMiddleware } from '../middleware/auth.js';
import type { createStokvelRepository } from '../repository/stokvel.js';

export function createStokvelRouter(
  stokvelRepo: ReturnType<typeof createStokvelRepository>,
  authMiddleware: ReturnType<typeof createAuthMiddleware>,
) {
  const router = new Hono();

  router.get('/:stokvelId', authMiddleware, (c) => {
    const stokvel = stokvelRepo.findById(toStokvelId(c.req.param('stokvelId')));
    if (!stokvel) return c.json({ error: 'not_found' }, 404);
    return c.json(stokvel);
  });

  router.get('/:stokvelId/members', authMiddleware, (c) => {
    const members = stokvelRepo.findMembers(toStokvelId(c.req.param('stokvelId')));
    return c.json(members);
  });

  router.get('/:stokvelId/contributions', authMiddleware, (c) => {
    const contributions = stokvelRepo.findContributions(toStokvelId(c.req.param('stokvelId')), {
      month: c.req.query('month'),
      memberId: c.req.query('memberId'),
    });
    return c.json(contributions);
  });

  router.get('/:stokvelId/balance', authMiddleware, (c) => {
    const balance = stokvelRepo.findBalance(toStokvelId(c.req.param('stokvelId')));
    if (!balance) return c.json({ error: 'not_found' }, 404);
    return c.json(balance);
  });

  router.post('/:stokvelId/contributions', authMiddleware, async (c) => {
    const requestId = c.get('requestId');
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'invalid_body' }, 400);
    }

    const parsed = ContributionCreateSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'validation_failed', details: parsed.error.issues }, 422);
    }

    const stokvelId = toStokvelId(c.req.param('stokvelId'));
    const contribution = {
      id: crypto.randomUUID(),
      memberId: toMemberId(parsed.data.memberId),
      stokvelId,
      amount: parsed.data.amount,
      month: parsed.data.month,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };

    stokvelRepo.addContribution(contribution);
    logger.info('contribution_created', { requestId, contributionId: contribution.id });

    return c.json(contribution, 201);
  });

  return router;
}
