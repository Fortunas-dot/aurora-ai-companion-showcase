import AppSession from '../models/AppSession';
import User from '../models/User';

export interface ActivityUser {
  userId: string;
  username?: string;
  displayName?: string;
  email?: string;
  avatar?: string;
  /** Number of app sessions in the window. */
  sessions: number;
  /** Total screen views logged in the window. */
  visits: number;
  /** Screens visited, most-visited first. */
  screens: { screen: string; count: number }[];
  lastScreen?: string;
  lastSeenAt: string;
}

export interface ActivityReport {
  generatedAt: string;
  windowHours: number;
  /** Unique active users per time bucket (for the history chart). */
  buckets: { t: string; users: number }[];
  totalUniqueUsers: number;
  totalSessions: number;
  users: ActivityUser[];
}

/**
 * Historical app activity over the last `hours`, built from stored sessions.
 *
 * "How many users" is derived from reliable point-in-time events (session
 * starts + screen visits), NOT from session duration — mobile WebSocket
 * connect/disconnect is too unreliable to measure time-spent.
 */
export const getActivityReport = async (hours: number): Promise<ActivityReport> => {
  const now = Date.now();
  const windowMs = hours * 60 * 60 * 1000;
  const since = new Date(now - windowMs);

  // Hourly buckets for short windows, daily for long ones.
  const bucketMs = hours <= 48 ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const bucketCount = Math.ceil(windowMs / bucketMs);
  const startBucket = now - bucketCount * bucketMs;

  const sessions = await AppSession.find({
    $or: [{ startedAt: { $gte: since } }, { lastSeenAt: { $gte: since } }],
  })
    .select('user startedAt lastSeenAt lastScreen screens')
    .lean();

  const bucketSets: Set<string>[] = Array.from({ length: bucketCount }, () => new Set<string>());
  const byUser = new Map<
    string,
    { sessions: number; visits: number; screens: Map<string, number>; lastScreen?: string; lastSeenAt: number }
  >();

  const markBucket = (uid: string, ts: number) => {
    if (ts < startBucket || ts > now) return;
    const i = Math.floor((ts - startBucket) / bucketMs);
    if (i >= 0 && i < bucketCount) bucketSets[i].add(uid);
  };

  for (const s of sessions) {
    const uid = String(s.user);

    // Per-user aggregation.
    let e = byUser.get(uid);
    if (!e) {
      e = { sessions: 0, visits: 0, screens: new Map(), lastSeenAt: 0 };
      byUser.set(uid, e);
    }
    e.sessions += 1;

    // Activity markers for the history chart + screen counts.
    markBucket(uid, new Date(s.startedAt).getTime());
    for (const v of s.screens || []) {
      const at = new Date(v.at).getTime();
      markBucket(uid, at);
      e.visits += 1;
      e.screens.set(v.screen, (e.screens.get(v.screen) || 0) + 1);
    }

    const seen = new Date(s.lastSeenAt).getTime();
    if (seen > e.lastSeenAt) {
      e.lastSeenAt = seen;
      e.lastScreen = s.lastScreen || undefined;
    }
  }

  // Resolve user identities in one query.
  const ids = [...byUser.keys()];
  const users = await User.find({ _id: { $in: ids } })
    .select('username displayName email avatar')
    .lean();
  const uMap = new Map(users.map((u) => [String(u._id), u as any]));

  const userList: ActivityUser[] = ids
    .map((uid) => {
      const e = byUser.get(uid)!;
      const u = uMap.get(uid);
      return {
        userId: uid,
        username: u?.username,
        displayName: u?.displayName,
        email: u?.email,
        avatar: u?.avatar,
        sessions: e.sessions,
        visits: e.visits,
        screens: [...e.screens.entries()]
          .map(([screen, count]) => ({ screen, count }))
          .sort((a, b) => b.count - a.count),
        lastScreen: e.lastScreen,
        lastSeenAt: new Date(e.lastSeenAt).toISOString(),
      };
    })
    // Most recently active first.
    .sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime());

  return {
    generatedAt: new Date(now).toISOString(),
    windowHours: hours,
    buckets: bucketSets.map((set, i) => ({
      t: new Date(startBucket + i * bucketMs).toISOString(),
      users: set.size,
    })),
    totalUniqueUsers: ids.length,
    totalSessions: sessions.length,
    users: userList,
  };
};
