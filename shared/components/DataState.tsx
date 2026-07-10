import React from 'react';

export function DataState({ loading, error, empty, children }: { loading?: boolean; error?: string | null; empty?: boolean; children: React.ReactNode }) {
  if (loading) return <div className="p-4 text-sm text-slate-500">Loading...</div>;
  if (error) return <div className="p-4 rounded border border-red-200 bg-red-50 text-red-700">{error}</div>;
  if (empty) return <div className="p-4 text-sm text-slate-500">No records found.</div>;
  return <>{children}</>;
}
