'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { adminService } from '@/lib/iam/adminService';

export default function LocationsPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  useEffect(() => { adminService.listLocations().then(data => setRows(data as Record<string, unknown>[])); }, []);
  return <div><h1>Service Locations</h1><Card><DataTable rows={rows} columns={['name','address','city','state','created_at']} /></Card></div>;
}
