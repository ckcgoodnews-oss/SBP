import React from 'react';

export function DataTable<T extends Record<string, unknown>>({ rows, columns }: { rows: T[]; columns: string[] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead><tr>{columns.map(c => <th key={c} style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: 8 }}>{c}</th>)}</tr></thead>
        <tbody>
          {rows.length === 0 ? <tr><td colSpan={columns.length} style={{ padding: 12 }}>No records found.</td></tr> : rows.map((row, i) => (
            <tr key={String(row.id ?? i)}>{columns.map(c => <td key={c} style={{ borderBottom: '1px solid #f3f4f6', padding: 8 }}>{String(row[c] ?? '')}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
