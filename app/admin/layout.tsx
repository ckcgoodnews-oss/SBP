import React from 'react';
import { EnterpriseAdminLayout } from '@/components/layout/EnterpriseAdminLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <EnterpriseAdminLayout>{children}</EnterpriseAdminLayout>;
}
