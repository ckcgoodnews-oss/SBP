'use client';
import React from 'react';
import { AdminCard } from '@/components/ui/AdminCard';
export default function Page(){
 const [data,setData]=React.useState<Record<string,unknown>|null>(null);
 React.useEffect(()=>{fetch('/api/admin/security').then(r=>r.json()).then(j=>setData(j.data));},[]);
 return <main style={{padding:24}}><h1>Security Dashboard</h1><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16}}>{data && Object.entries(data).map(([k,v])=><AdminCard key={k} title={k}><strong style={{fontSize:28}}>{String(v)}</strong></AdminCard>)}</div></main>;
}
