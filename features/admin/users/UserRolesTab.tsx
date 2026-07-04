'use client';

import React from 'react';
import { IamRole, TenantUser } from './UserTypes';

type Props = {
  user: TenantUser;
  roles: IamRole[];
};

export default function UserRolesTab({ user, roles }: Props) {
  return (
    <section style={section}>
      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Current Role</h3>
        <p style={{ color: '#64748b' }}>
          Current tenant user role is stored on <code>tenant_users.role</code>. Multi-role assignment through{' '}
          <code>tenant_user_role_assignments</code> will be wired in the next role sprint.
        </p>

        <div style={roleList}>
          {roles.map((role) => {
            const active = role.role_key === user.role;

            return (
              <div
                key={role.id}
                style={{
                  ...roleCard,
                  borderColor: active ? '#0f172a' : '#e2e8f0',
                  background: active ? '#f8fafc' : 'white',
                }}
              >
                <strong>{role.display_name}</strong>
                <span style={{ color: '#64748b', fontSize: 13 }}>{role.role_key}</span>
                <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 13 }}>
                  {role.description || 'No description'}
                </p>
                {active && <span style={activeBadge}>Assigned</span>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const section: React.CSSProperties = {
  marginTop: 18,
};

const card: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 14,
  background: 'white',
};

const roleList: React.CSSProperties = {
  display: 'grid',
  gap: 10,
  marginTop: 12,
};

const roleCard: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  padding: 12,
  display: 'grid',
  gap: 2,
};

const activeBadge: React.CSSProperties = {
  marginTop: 6,
  background: '#dcfce7',
  borderRadius: 999,
  padding: '2px 8px',
  fontSize: 12,
  width: 'fit-content',
};