import type { AuditLog } from './types';

function show(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

/** Tabla campo / antes / después con los valores guardados en el log. */
export function AuditChanges({ log }: { log: AuditLog }) {
  const before = log.old_values ?? {};
  const after = log.new_values ?? {};
  const fields = [...new Set([...Object.keys(before), ...Object.keys(after)])];

  if (fields.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin datos adicionales.</p>;
  }

  return (
    <div className="max-h-[60vh] overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="py-2 pr-3">Campo</th>
            <th className="py-2 pr-3">Antes</th>
            <th className="py-2">Después</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field} className="border-b align-top last:border-0">
              <td className="py-1.5 pr-3 font-mono text-xs">{field}</td>
              <td className="py-1.5 pr-3 break-all text-muted-foreground">{show(before[field])}</td>
              <td className="py-1.5 break-all">{show(after[field])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
