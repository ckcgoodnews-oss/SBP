import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { PermissionAction } from '../types/iam';
import { usePermission } from '../hooks/usePermission';

export function RequirePermission({ module, action, tenantId, children }: { module: string; action: PermissionAction; tenantId?: string | null; children: ReactNode }) {
  const { allowed, loading } = usePermission(module, action, tenantId);
  if (loading) return <div className="p-6">Checking access...</div>;
  if (!allowed) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}
