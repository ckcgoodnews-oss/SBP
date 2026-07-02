'use client';

import { useEffect, useState } from 'react';
import { fetchApiRows } from '@/lib/api/client';
import { EmptyCard, ErrorCard, LoadingCard } from '@/components/LiveState';
import { IamTable } from '@/components/IamTable';

type Row = Record<string, unknown>;

export default function PermissionsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApiRows<Row>('/api/admin/iam/permissions')
      .then(setRows)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="main">
      <h1>Granular Permissions</h1>
      <p>Module-by-module permissions. Role-permission assignment UI is the next hardening step.</p>
      {loading && <LoadingCard />}
      {error && <ErrorCard message={error} />}
      {!loading && !error && rows.length === 0 && <EmptyCard />}
      {rows.length > 0 && <IamTable headers={['Module','Action','Permission','Description']} cells={['module_key','action_key','display_name','description']} rows={rows} />}
    </main>
  );
}
