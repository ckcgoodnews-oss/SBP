export function useTenantId(): string {
  const tenantId = localStorage.getItem('active_tenant_id');
  if (!tenantId) {
    throw new Error('No active_tenant_id found in localStorage. Set this after tenant selection/login.');
  }
  return tenantId;
}
