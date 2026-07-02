'use client';

export function PortalTable({
  headers,
  rows,
  cells
}: {
  headers: string[];
  rows: Record<string, unknown>[];
  cells: string[];
}) {
  return (
    <table>
      <thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={String(row.id || row.work_order_id || index)}>
            {cells.map((cell) => (
              <td key={cell}>{row[cell] === null || row[cell] === undefined || row[cell] === '' ? '—' : String(row[cell])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
