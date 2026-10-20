import { Router, Request, Response, NextFunction } from 'express';
import { getPresenceSnapshot } from '../controllers/notificationWebSocket';
import { getSystemMetrics } from '../controllers/metricsController';
import { getActivityReport } from '../controllers/sessionAnalytics';

const router = Router();

/**
 * Guard for server-to-server admin calls (e.g. the Aurora website dashboard).
 * Authenticates with a shared secret in the Authorization header rather than a
 * user JWT, since the caller is a trusted backend, not an app user.
 *   Authorization: Bearer <ADMIN_PRESENCE_TOKEN>
 */
const requireAdminToken = (req: Request, res: Response, next: NextFunction): void => {
  const expected = process.env.ADMIN_PRESENCE_TOKEN;
  if (!expected) {
    res.status(503).json({ success: false, message: 'Admin presence not configured' });
    return;
  }

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || token !== expected) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  next();
};

/** Live presence snapshot: how many users are online and on which screen. */
router.get('/presence', requireAdminToken, (_req: Request, res: Response) => {
  res.json({ success: true, data: getPresenceSnapshot() });
});

/** Live backend load: memory, CPU, event-loop lag and open WS connections. */
router.get('/metrics', requireAdminToken, (_req: Request, res: Response) => {
  res.json({ success: true, data: getSystemMetrics() });
});

/**
 * Historical activity over the last N hours (default 24, max 168/7d): unique
 * users over time + a per-user breakdown of screens visited. No time-spent.
 */
router.get('/activity', requireAdminToken, async (req: Request, res: Response) => {
  const raw = parseInt(String(req.query.hours ?? '24'), 10);
  const hours = Math.min(Math.max(Number.isFinite(raw) ? raw : 24, 1), 168);
  try {
    res.json({ success: true, data: await getActivityReport(hours) });
  } catch (err) {
    console.error('Activity report failed:', err);
    res.status(500).json({ success: false, message: 'Failed to build activity report' });
  }
});

export default router;
