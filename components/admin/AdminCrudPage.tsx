'use client';
import React from 'react';
import { AdminCard } from '@/components/ui/AdminCard';
import { AdminTable } from '@/components/ui/AdminTable';
import { AdminButton } from '@/components/ui/AdminButton';

export function AdminCrudPage({title,apiPath}:{title:string;apiPath:string}) {
  const [rows,setRows]=React.useState<Record<string,unknown>[]>([]);
  const [loading,setLoading]=React.useState(true);
  const [error,setError]=React.useState('');
  async function load(){
    setLoading(true); setError('');
    try{ const r=await fetch(apiPath,{cache:'no-store'}); const j=await r.json(); if(!r.ok) throw new Error(j.error || 'Request failed'); setRows(j.data || []); }
    catch(e:any){ setError(e.message); }
    finally{ setLoading(false); }
  }
  React.useEffect(()=>{load();},[apiPath]);
  return <main style={{padding:24}}><h1>{title}</h1><AdminCard><AdminButton onClick={load}>Refresh</AdminButton></AdminCard>{error && <AdminCard title="Error"><pre>{error}</pre></AdminCard>}{loading ? <p>Loading...</p> : <AdminTable rows={rows}/>}</main>;
}
