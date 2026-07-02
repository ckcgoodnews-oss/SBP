'use client';

import { useEffect, useState } from 'react';
import { fetchApiRows } from '@/lib/api/client';
import { ErrorCard, LoadingCard } from '@/components/LiveState';

type Row = Record<string, unknown>;

export default function TechnicianPortalPage() {
  const [jobs, setJobs] = useState<Row[]>([]);
  const [notes, setNotes] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetchApiRows<Row>('/api/technician/jobs?tenant_slug=demo-company'),
      fetchApiRows<Row>('/api/technician/job-notes?tenant_slug=demo-company')
    ])
      .then(([jobRows, noteRows]) => { setJobs(jobRows); setNotes(noteRows); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="main">
      <h1>Technician Portal</h1>
      <p>Live demo technician portal.</p>
      {loading && <LoadingCard />}
      {error && <ErrorCard message={error} />}
      {!loading && !error && (
        <section className="grid">
          <a className="card" href="/technician/jobs"><h2>Assigned Jobs</h2><p>{jobs.length}</p></a>
          <a className="card" href="/technician/notes"><h2>Job Notes</h2><p>{notes.length}</p></a>
          <a className="card" href="/technician/jobs/complete"><h2>Complete Job</h2><p>Submit completion</p></a>
        </section>
      )}
    </main>
  );
}
