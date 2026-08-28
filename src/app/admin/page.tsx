'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { JOURNEY_BY_ID } from '@/content/journeys';
import { EXPERIENCES } from '@/content/experiences';
import { signOut } from '@/lib/auth';
import {
  isAdmin, getOverview, getFunnel, getConceptDifficulty, getByAgeBand,
  getRecentActivity, getStudents, describeEvent,
  type Overview, type FunnelRow, type ConceptRow, type BandRow,
  type ActivityRow, type StudentRow,
} from '@/lib/admin';
import styles from './admin.module.css';

const REFRESH_MS = 15_000;

function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${Math.floor(s)}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

/** Journey title for an event's related_id, which may be a journey or an
 *  experience id depending on the event type. */
function labelFor(relatedId: string | null): string | undefined {
  if (!relatedId) return undefined;
  const j = JOURNEY_BY_ID.get(relatedId);
  if (j) return j.title;
  return EXPERIENCES.find((e) => e.id === relatedId)?.title;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [ov, setOv] = useState<Overview | null>(null);
  const [funnel, setFunnel] = useState<FunnelRow[]>([]);
  const [concepts, setConcepts] = useState<ConceptRow[]>([]);
  const [bands, setBands] = useState<BandRow[]>([]);
  const [feed, setFeed] = useState<ActivityRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [selected, setSelected] = useState<StudentRow | null>(null);

  const load = useCallback(async () => {
    const [o, f, c, b, a, s] = await Promise.all([
      getOverview(), getFunnel(), getConceptDifficulty(),
      getByAgeBand(), getRecentActivity(40), getStudents(),
    ]);
    setOv(o); setFunnel(f); setConcepts(c); setBands(b); setFeed(a); setStudents(s);
  }, []);

  useEffect(() => {
    (async () => {
      if (!(await isAdmin())) { router.replace('/admin/login'); return; }
      await load();
      setReady(true);
    })();
  }, [router, load]);

  /* Near-real-time by polling. Deliberately not a websocket subscription:
     these are aggregates across every student, so they have to be recomputed
     server-side regardless, and a 15s poll is far simpler to reason about
     than invalidating six different aggregates on every row change. */
  useEffect(() => {
    if (!ready) return;
    const t = setInterval(load, REFRESH_MS);
    return () => clearInterval(t);
  }, [ready, load]);

  if (!ready) return <main className={styles.wrap} />;

  const noData = (ov?.total_students ?? 0) === 0;

  if (selected) {
    return (
      <main className={styles.wrap}>
        <button className={styles.back} onClick={() => setSelected(null)}>← All students</button>
        <div className={styles.top}>
          <div>
            <div className={styles.brand}>{selected.full_name}</div>
            <div className={styles.sub}>@{selected.username}</div>
          </div>
        </div>
        <div className={styles.detail}>
          <div className={styles.kv}><span>Age</span><b>{selected.age} <span className={styles.pill}>{selected.age_band}</span></b></div>
          <div className={styles.kv}><span>Contact ({selected.contact_method})</span><b>{selected.contact_value}</b></div>
          <div className={styles.kv}><span>Experiences completed</span><b>{selected.completed} / {EXPERIENCES.length}</b></div>
          <div className={styles.kv}><span>Course completion</span><b>{selected.completion_pct}%</b></div>
          <div className={styles.kv}><span>Joined</span><b>{new Date(selected.created_at).toLocaleDateString('en-IN')}</b></div>
          <div className={styles.kv}><span>Last active</span><b>{timeAgo(selected.last_active_at)} ago</b></div>
        </div>
        <div className={styles.panel}>
          <div className={styles.panelH}>Their activity</div>
          <div className={styles.feed}>
            {feed.filter((e) => e.username === selected.username).slice(0, 20).map((e) => (
              <div key={e.id} className={styles.feedRow}>
                <span>{describeEvent(e, labelFor(e.related_id))}</span>
                <span className={styles.feedTime}>{timeAgo(e.created_at)}</span>
              </div>
            ))}
            {feed.filter((e) => e.username === selected.username).length === 0 && (
              <div className={styles.feedRow}><span>No recorded activity yet.</span></div>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.wrap}>
      <div className={styles.top}>
        <div>
          <div className={styles.brand}>MoneyOrbit</div>
          <div className={styles.sub}>Admin · refreshes every {REFRESH_MS / 1000}s</div>
        </div>
        <button className={styles.link} onClick={async () => { await signOut(); router.replace('/admin/login'); }}>
          Sign out
        </button>
      </div>

      {noData ? (
        <div className={styles.empty}>
          No students have signed up yet, so there is nothing to measure.<br />
          These numbers stay empty until real accounts exist — they are never seeded or simulated.
        </div>
      ) : (
        <>
          <div className={styles.cards}>
            <div className={styles.card}><div className={styles.cardN}>{ov!.total_students}</div><div className={styles.cardL}>Students</div></div>
            <div className={styles.card}><div className={styles.cardN}>{ov!.started_students}</div><div className={styles.cardL}>Started the course</div></div>
            <div className={styles.card}><div className={styles.cardN}>{ov!.completed_students}</div><div className={styles.cardL}>Finished all 11</div></div>
            <div className={styles.card}><div className={styles.cardN}>{ov!.avg_completion_pct}%</div><div className={styles.cardL}>Avg progress<br /><span style={{ color: 'var(--ink-35)' }}>all students</span></div></div>
            <div className={styles.card}><div className={styles.cardN}>{ov!.avg_completion_pct_starters}%</div><div className={styles.cardL}>Avg progress<br /><span style={{ color: 'var(--ink-35)' }}>who started</span></div></div>
            <div className={styles.card}><div className={styles.cardN}>{ov!.active_7d}</div><div className={styles.cardL}>Active this week</div></div>
            <div className={styles.card}><div className={styles.cardN}>{ov!.new_7d}</div><div className={styles.cardL}>New this week</div></div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.panel}>
              <div className={styles.panelH}>Where students stop</div>
              <div className={styles.panelS}>Started vs finished, per journey, in course order.</div>
              <table className={styles.table}>
                <thead><tr><th>Journey</th><th className={styles.num}>Started</th><th className={styles.num}>Done</th><th style={{ width: 90 }}>Drop-off</th></tr></thead>
                <tbody>
                  {funnel.map((f) => (
                    <tr key={f.journey_id}>
                      <td>{f.order_index}. {f.title}</td>
                      <td className={styles.num}>{f.started}</td>
                      <td className={styles.num}>{f.completed}</td>
                      <td>
                        <div className={styles.bar}>
                          <div className={`${styles.barFill}${f.drop_off_pct > 50 ? ' ' + styles.warn : ''}`}
                               style={{ width: `${f.drop_off_pct}%` }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelH}>Hardest concepts</div>
              <div className={styles.panelS}>Core concepts students reach but do not reach &ldquo;understood&rdquo; on.</div>
              {concepts.length === 0 ? (
                <div className={styles.empty}>Nobody has reached a core concept yet.</div>
              ) : (
                <table className={styles.table}>
                  <thead><tr><th>Concept</th><th className={styles.num}>Reached</th><th className={styles.num}>Understood</th></tr></thead>
                  <tbody>
                    {concepts.slice(0, 10).map((c) => (
                      <tr key={c.concept_slug}>
                        <td>{c.title}</td>
                        <td className={styles.num}>{c.reached}</td>
                        <td className={styles.num}>{c.understood_pct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelH}>By age band</div>
            <table className={styles.table}>
              <thead><tr><th>Band</th><th className={styles.num}>Students</th><th className={styles.num}>Avg completion</th></tr></thead>
              <tbody>
                {bands.map((b) => (
                  <tr key={b.band}><td>{b.band}</td><td className={styles.num}>{b.students}</td><td className={styles.num}>{b.avg_completion_pct}%</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelH}>Students</div>
            <div className={styles.panelS}>Select a student to see their detail.</div>
            <table className={styles.table}>
              <thead><tr><th>Username</th><th>Name</th><th className={styles.num}>Age</th><th className={styles.num}>Progress</th><th className={styles.num}>Last active</th></tr></thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className={styles.rowBtn} onClick={() => setSelected(s)}>
                    <td>@{s.username}</td>
                    <td>{s.full_name}</td>
                    <td className={styles.num}>{s.age}</td>
                    <td className={styles.num}>{s.completion_pct}%</td>
                    <td className={styles.num}>{timeAgo(s.last_active_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelH}>Live activity</div>
            <div className={styles.feed}>
              {feed.length === 0 && <div className={styles.feedRow}><span>Nothing recorded yet.</span></div>}
              {feed.map((e) => (
                <div key={e.id} className={styles.feedRow}>
                  <span>{describeEvent(e, labelFor(e.related_id))}</span>
                  <span className={styles.feedTime}>{timeAgo(e.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
