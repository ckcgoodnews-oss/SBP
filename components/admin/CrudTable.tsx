'use client';

import React from 'react';

export type CrudColumn<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
};

export function CrudTable<T extends { id?: string }>({
  rows,
  columns,
  onEdit,
  onDelete,
}: {
  rows: T[];
  columns: CrudColumn<T>[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}) {
  return (
    <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 12 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr style={{ background: '#f9fafb' }}>
            {columns.map((c) => (
              <th key={String(c.key)} style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb', fontSize: 13 }}>
                {c.label}
              </th>
            ))}
            <th style={{ textAlign: 'right', padding: 12, borderBottom: '1px solid #e5e7eb', fontSize: 13 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id ?? index}>
              {columns.map((c) => (
                <td key={String(c.key)} style={{ padding: 12, borderBottom: '1px solid #f3f4f6', fontSize: 14 }}>
                  {c.render ? c.render(row) : String((row as Record<string, unknown>)[String(c.key)] ?? '')}
                </td>
              ))}
              <td style={{ padding: 12, borderBottom: '1px solid #f3f4f6', textAlign: 'right', whiteSpace: 'nowrap' }}>
                {onEdit && <button onClick={() => onEdit(row)} style={{ marginRight: 8 }}>Edit</button>}
                {onDelete && <button onClick={() => onDelete(row)}>Delete</button>}
              </td>
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td colSpan={columns.length + 1} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
