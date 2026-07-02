'use client';

import { useEffect, useState } from 'react';
import { fetchApiRows, money } from '@/lib/api/client';
import { EmptyCard, ErrorCard, LoadingCard } from '@/components/LiveState';

type ReportRow = Record<string, unknown>;

const headers = ["Month", "Revenue"];
const cells = ["month", "revenue"];
const moneyCols = new Set(["revenue"]);

function formatCell(key: string, value: unknown) {
  if (moneyCols.has(key)) return money(value);
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

export default function ReportPage() {
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApiRows<ReportRow>('/api/admin/reports/revenue?tenant_slug=demo-company')
      .then(setRows)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="main">
      <h1>Revenue Report</h1>
      <p>Live Supabase-backed report for demo-company.</p>
      {loading && <LoadingCard />}
      {error && <ErrorCard message={error} />}
      {!loading && !error && rows.length === 0 && <EmptyCard />}
      {rows.length > 0 && (
        <table>
          <thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {cells.map((cell) => <td key={cell}>{formatCell(cell, row[cell])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
