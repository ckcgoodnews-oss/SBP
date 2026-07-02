'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { adminService } from '@/lib/iam/adminService';

export default function TenantsPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  useEffect(() => { adminService.listTenants().then(data => setRows(data as Record<string, unknown>[])); }, []);
  return <div><h1>Tenant Administration</h1><Card><DataTable rows={rows} columns={['name','slug','status','created_at']} /></Card></div>;
}
