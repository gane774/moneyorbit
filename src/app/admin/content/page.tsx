'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AGE_BANDS, type AgeBand } from '@/content/types';
import { EXPERIENCES, variantFor } from '@/content/experiences';
import { JOURNEY_BY_ID } from '@/content/journeys';
import { isAdmin } from '@/lib/admin';
import { validateScreenCopy } from '@/lib/validateCopy';
import { listVersions, saveDraft, publish, unpublish, getPublished, type VersionRow } from '@/lib/cms';
import styles from '../admin.module.css';

/**
 * Content editor (Section 32). Edits copy and simulation params as structured
 * data, so changing what a lesson SAYS never requires touching what it DOES.
 *
 * The JSON is shown directly rather than wrapped in per-field inputs. That is
 * deliberate for this pass: the copy shape differs per mechanic (a committing
 * Decide screen has no options, a Feedback verdict may carry a timeline), and
 * a fixed form would quietly prevent editing whole categories of experience.
 * Validation is what makes this safe, not the input widget.
 */
export default function ContentAdmin() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [expId, setExpId] = useState('e01');
  const [band, setBand] = useState<AgeBand>('15-16');
  const [text, setText] = useState('');
  const [paramsText, setParamsText] = useState('');
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [errs, setErrs] = useState<string[]>([]);

  const exp = EXPERIENCES.find((e) => e.id === expId)!;
  const compiled = variantFor(exp, band);

  const refresh = useCallback(async () => {
    setVersions(await listVersions(expId));
    setIsLive(Boolean(await getPublished(expId, band)));
  }, [expId, band]);

  useEffect(() => {
    (async () => {
      if (!(await isAdmin())) { router.replace('/admin/login'); return; }
      setReady(true);
    })();
  }, [router]);

  /* Load the compiled copy as the starting point. Editing begins from what is
     actually shipping, so an author is never staring at an empty box. */
  useEffect(() => {
    if (!ready) return;
    setMsg(null); setErrs([]);
    setText(compiled ? JSON.stringify(compiled.copy, null, 2) : '');
    setParamsText(compiled ? JSON.stringify(compiled.params, null, 2) : '{}');
    void refresh();
  }, [ready, expId, band, compiled, refresh]);

  if (!ready) return <main className={styles.wrap} />;

  const parse = (): { copy?: unknown; params?: unknown; error?: string } => {
    try {
      const copy = JSON.parse(text);
      const params = paramsText.trim() ? JSON.parse(paramsText) : {};
      return { copy, params };
    } catch (e) {
      return { error: `JSON is not valid: ${(e as Error).message}` };
    }
  };

  const check = () => {
    const p = parse();
    if (p.error) { setErrs([p.error]); setMsg(null); return null; }
    const v = validateScreenCopy(p.copy);
    setErrs(v.errors);
    return v.ok ? p : null;
  };

  const onSave = async () => {
    const p = check();
    if (!p) { setMsg('Fix the problems below before saving.'); return; }
    const r = await saveDraft(expId, band, p.copy, p.params);
    setMsg(r.ok ? `Saved as draft v${r.version}.` : `Could not save: ${r.error}`);
    await refresh();
  };

  const onPublish = async (v: VersionRow) => {
    const r = await publish(v);
    setMsg(r.ok ? `Published v${v.version_number}. Students see it on their next lesson load.` : r.error);
    await refresh();
  };

  const onUnpublish = async () => {
    const r = await unpublish(expId, band);
    setMsg(r.ok ? 'Reverted to the built-in version.' : `Could not revert: ${r.error}`);
    await refresh();
  };

  const noVariant = !compiled;

  return (
    <main className={styles.wrap}>
      <div className={styles.top}>
        <div>
          <div className={styles.brand}>Content</div>
          <div className={styles.sub}>Draft · Preview · Publish</div>
        </div>
        <button className={styles.link} onClick={() => router.push('/admin')}>← Dashboard</button>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        <select value={expId} onChange={(e) => setExpId(e.target.value)}
                style={{ padding: '9px 11px', borderRadius: 9, border: '1px solid var(--ink-12)', background: 'var(--paper)', fontFamily: 'inherit', fontSize: 13 }}>
          {EXPERIENCES.map((e) => (
            <option key={e.id} value={e.id}>
              {JOURNEY_BY_ID.get(e.journeyId)?.orderIndex}. {e.title}
            </option>
          ))}
        </select>
        <select value={band} onChange={(e) => setBand(e.target.value as AgeBand)}
                style={{ padding: '9px 11px', borderRadius: 9, border: '1px solid var(--ink-12)', background: 'var(--paper)', fontFamily: 'inherit', fontSize: 13 }}>
          {AGE_BANDS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <span className={styles.pill} style={{ alignSelf: 'center' }}>
          {isLive ? 'CMS version live' : 'built-in version live'}
        </span>
        {isLive && (
          <button className={styles.link} onClick={onUnpublish} style={{ alignSelf: 'center' }}>
            Revert to built-in
          </button>
        )}
      </div>

      {noVariant ? (
        <div className={styles.empty}>
          {exp.title} has no {band} variant — it is not offered to that age band.
        </div>
      ) : (
        <div className={styles.grid2}>
          <div>
            <div className={styles.panelH}>Copy</div>
            <div className={styles.panelS}>The six screens. Validated before it can be published.</div>
            <textarea
              value={text} onChange={(e) => { setText(e.target.value); setMsg(null); }}
              spellCheck={false}
              style={{
                width: '100%', height: 420, fontFamily: 'var(--font-mono)', fontSize: 12,
                lineHeight: 1.5, padding: 12, borderRadius: 10, border: '1px solid var(--ink-12)',
                background: 'var(--paper)', resize: 'vertical', color: 'var(--ink)',
              }}
            />
            <div className={styles.panelH} style={{ marginTop: 16 }}>Simulation parameters</div>
            <div className={styles.panelS}>Retune the numbers without touching the engine (Section 33).</div>
            <textarea
              value={paramsText} onChange={(e) => { setParamsText(e.target.value); setMsg(null); }}
              spellCheck={false}
              style={{
                width: '100%', height: 160, fontFamily: 'var(--font-mono)', fontSize: 12,
                lineHeight: 1.5, padding: 12, borderRadius: 10, border: '1px solid var(--ink-12)',
                background: 'var(--paper)', resize: 'vertical', color: 'var(--ink)',
              }}
            />

            <div style={{ display: 'flex', gap: 9, marginTop: 14, flexWrap: 'wrap' }}>
              <button className="btn" style={{ maxWidth: 190 }} onClick={onSave}>Save as draft</button>
              <button className="btn ghost" style={{ maxWidth: 150 }} onClick={() => { if (check()) setMsg('Valid — safe to publish.'); }}>
                Validate
              </button>
            </div>

            {msg && <p style={{ marginTop: 12, fontSize: 13.5 }}>{msg}</p>}
            {errs.length > 0 && (
              <ul style={{ marginTop: 10, paddingLeft: 18, color: 'var(--danger)', fontSize: 13, lineHeight: 1.6 }}>
                {errs.map((e) => <li key={e}>{e}</li>)}
              </ul>
            )}
          </div>

          <div>
            <div className={styles.panelH}>Versions</div>
            <div className={styles.panelS}>Every save is kept, so a bad publish can be rolled back.</div>
            {versions.length === 0 ? (
              <div className={styles.empty}>No drafts yet. The built-in version is live.</div>
            ) : (
              <table className={styles.table}>
                <thead><tr><th>Ver</th><th>Band</th><th>Status</th><th>Saved</th><th /></tr></thead>
                <tbody>
                  {versions.map((v) => (
                    <tr key={v.id}>
                      <td>v{v.version_number}</td>
                      <td>{v.payload?.band ?? '—'}</td>
                      <td>{v.status === 'published' ? <b>live</b> : v.status}</td>
                      <td>{new Date(v.created_at).toLocaleDateString('en-IN')}</td>
                      <td>
                        {v.status !== 'published' && (
                          <button className={styles.link} onClick={() => onPublish(v)}>Publish</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
