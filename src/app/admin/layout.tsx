'use client';

import React from 'react';
import { EnterpriseAdminLayout } from '@/shared/layout/EnterpriseAdminLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <EnterpriseAdminLayout>{children}</EnterpriseAdminLayout>;
}
