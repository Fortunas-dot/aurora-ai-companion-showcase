import mongoose, { Document, Schema, Types } from 'mongoose';

/** A single screen/route the user viewed during a session, with when. */
export interface IScreenVisit {
  screen: string;
  at: Date;
}

/**
 * One notification-WebSocket connection = one app "session", stored so the
 * admin dashboard can show historical activity: who was active, when, and
 * which screens they visited.
 *
 * NOTE: we intentionally do NOT derive time-spent / session duration from
 * this. WebSocket connect/disconnect is unreliable on mobile (the app is
 * backgrounded or killed without a clean close, reconnects split one visit
 * into several), so any "duration" would be misleading. We only use the
 * point-in-time events (session start, screen visits, last-seen), which are
 * reliable.
 */
export interface IAppSession extends Document {
  user: Types.ObjectId;
  startedAt: Date;
  lastSeenAt: Date;
  endedAt?: Date | null;
  lastScreen?: string;
  screens: IScreenVisit[];
}

const ScreenVisitSchema = new Schema<IScreenVisit>(
  {
    screen: { type: String, required: true },
    at: { type: Date, required: true },
  },
  { _id: false }
);

const AppSessionSchema = new Schema<IAppSession>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  startedAt: { type: Date, required: true, default: Date.now },
  lastSeenAt: { type: Date, required: true, default: Date.now },
  endedAt: { type: Date, default: null },
  lastScreen: { type: String },
  screens: { type: [ScreenVisitSchema], default: [] },
});

// Query sessions by recency for the dashboard windows (24h / 7d).
AppSessionSchema.index({ lastSeenAt: -1 });
// Auto-expire old sessions after 30 days to keep storage bounded.
AppSessionSchema.index({ startedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export default mongoose.model<IAppSession>('AppSession', AppSessionSchema);
