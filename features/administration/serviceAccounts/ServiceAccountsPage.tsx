'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { adminService } from '@/lib/iam/adminService';

export default function ServiceAccountsPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  useEffect(() => { adminService.listServiceAccounts().then(data => setRows(data as Record<string, unknown>[])); }, []);
  return <div><h1>Service Accounts</h1><Card><DataTable rows={rows} columns={['name','description','status','created_at']} /></Card></div>;
}
