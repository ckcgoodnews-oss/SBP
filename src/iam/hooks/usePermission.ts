import { useEffect, useState } from 'react';
import type { PermissionAction } from '../types/iam';
import { hasPermission } from '../services/iamService';

export function usePermission(module: string, action: PermissionAction, tenantId?: string | null) {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    hasPermission(module, action, tenantId)
      .then(v => { if (alive) setAllowed(v); })
      .catch(() => { if (alive) setAllowed(false); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [module, action, tenantId]);
  return { allowed, loading };
}
