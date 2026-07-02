'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { adminService } from '@/lib/iam/adminService';

export default function DepartmentsPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  useEffect(() => { adminService.listDepartments().then(data => setRows(data as Record<string, unknown>[])); }, []);
  return <div><h1>Departments</h1><Card><DataTable rows={rows} columns={['name','description','created_at']} /></Card></div>;
}
