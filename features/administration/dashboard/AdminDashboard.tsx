'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { adminService } from '@/lib/iam/adminService';

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => { adminService.dashboardCounts().then(setCounts); }, []);
  return <div><h1>Enterprise Administration</h1><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16}}>
    {Object.entries(counts).map(([k,v]) => <Card key={k} title={k}><strong style={{fontSize:28}}>{v}</strong></Card>)}
  </div></div>;
}
