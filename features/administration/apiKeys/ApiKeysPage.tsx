'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { adminService } from '@/lib/iam/adminService';

export default function ApiKeysPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  useEffect(() => { adminService.listApiKeys().then(data => setRows(data as Record<string, unknown>[])); }, []);
  return <div><h1>API Keys</h1><Card><DataTable rows={rows} columns={['name','status','last_used_at','created_at']} /></Card></div>;
}
