'use client';

export function LoadingCard({ label = 'Loading live data...' }: { label?: string }) {
  return <div className="card"><p>{label}</p></div>;
}

export function ErrorCard({ message }: { message: string }) {
  return <div className="card"><h2>Data Load Error</h2><p>{message}</p></div>;
}

export function EmptyCard({ label = 'No records found.' }: { label?: string }) {
  return <div className="card"><p>{label}</p></div>;
}
