import React from 'react';

export interface AdminTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
}

export function AdminTable<T>({ columns, rows, emptyText = 'No records found.' }: { columns: AdminTableColumn<T>[]; rows: T[]; emptyText?: string }) {
  if (!rows.length) return <div style={{ color: '#6b7280', padding: 16 }}>{emptyText}</div>;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr>
            {columns.map((c) => <th key={c.key} style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: '10px 8px' }}>{c.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((c) => <td key={c.key} style={{ borderBottom: '1px solid #f3f4f6', padding: '10px 8px' }}>{c.render(row)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
