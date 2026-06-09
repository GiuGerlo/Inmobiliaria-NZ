import { useEffect, useState } from 'react';

type Health = { ok: boolean; service: string; ts: string };

export function App() {
  const [data, setData] = useState<Health | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/health')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<Health>;
      })
      .then(setData)
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : String(e)));
  }, []);

  return (
    <main
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: 32,
        maxWidth: 720,
        margin: '0 auto',
      }}
    >
      <h1 style={{ marginBottom: 8 }}>Inmobiliaria NZ</h1>
      <p style={{ color: '#666', marginTop: 0 }}>Bootstrap — sub-proyecto A.</p>

      <section
        style={{
          marginTop: 24,
          padding: 16,
          border: '1px solid #e5e7eb',
          borderRadius: 8,
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Health check del API</h2>
        {err && (
          <pre style={{ color: 'crimson', whiteSpace: 'pre-wrap' }}>
            Error: {err}
          </pre>
        )}
        {data && (
          <p>
            API respondió: <strong>{data.ok ? 'ok' : 'fallo'}</strong> @{' '}
            <code>{data.ts}</code>
          </p>
        )}
        {!data && !err && <p>Cargando…</p>}
      </section>
    </main>
  );
}
