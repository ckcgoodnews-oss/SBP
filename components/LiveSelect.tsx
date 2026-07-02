'use client';

import { useEffect, useState } from 'react';
import { fetchApiRows } from '@/lib/api/client';

type Row = Record<string, unknown>;

export function LiveSelect({
  name,
  label,
  api,
  labelField,
  valueField = 'id',
  required = false
}: {
  name: string;
  label: string;
  api: string;
  labelField: string;
  valueField?: string;
  required?: boolean;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApiRows<Row>(api).then(setRows).catch((err) => setError(err.message));
  }, [api]);

  return (
    <label>
      {label}
      <select name={name} required={required}>
        <option value="">Select {label}</option>
        {rows.map((row) => (
          <option key={String(row[valueField])} value={String(row[valueField])}>
            {String(row[labelField] || row[valueField])}
          </option>
        ))}
      </select>
      {error && <small>{error}</small>}
    </label>
  );
}
