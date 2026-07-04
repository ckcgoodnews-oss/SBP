'use client';

import React from 'react';
import { IamInvitation, IamRole } from './UserTypes';

type InvitationGridProps = {
  loading: boolean;
  invitations: IamInvitation[];
  roles: IamRole[];
  onCancel: (id: string) => void;
};

function isExpired(invitation: IamInvitation) {
  if (!invitation.expires_at) return false;
  return new Date(invitation.expires_at).getTime() < Date.now();
}

function badge(label: string, tone: 'green' | 'red' | 'yellow' | 'gray' | 'blue') {
  const colors: Record<typeof tone, string> = {
    green: '#dcfce7',
    red: '#fee2e2',
    yellow: '#fef9c3',
    gray: '#f3f4f6',
    blue: '#dbeafe',
  };

  return (
    <span style={{ background: colors[tone], borderRadius: 999, padding: '2px 8px', fontSize: 12 }}>
      {label}
    </span>
  );
}

export default function InvitationGrid({
  loading,
  invitations,
  roles,
  onCancel,
}: InvitationGridProps) {
  function getRoleName(roleKey?: string | null) {
    if (!roleKey) return '—';
    return roles.find((role) => role.role_key === roleKey)?.display_name ?? roleKey;
  }

  function invitationLink(invitation: IamInvitation) {
    if (typeof window === 'undefined') return invitation.invitation_token;
    return `${window.location.origin}/login?invitation_token=${invitation.invitation_token}`;
  }

  async function copyLink(invitation: IamInvitation) {
    await navigator.clipboard.writeText(invitationLink(invitation));
  }

  return (
    <section style={{ marginTop: 28 }}>
      <div style={header}>
        <div>
          <h2 style={{ margin: 0 }}>Pending Invitations</h2>
          <p style={{ marginTop: 6, color: '#64748b' }}>
            Track user invitations, expiration, and onboarding status.
          </p>
        </div>
      </div>

      <div style={tableWrap}>
        {loading ? (
          <div style={{ padding: 24 }}>Loading invitations...</div>
        ) : (
          <table style={table}>
            <thead>
              <tr>
                <Th>User</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Expires</Th>
                <Th>Created By</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((invitation) => (
                <tr key={invitation.id}>
                  <Td>
                    <strong>{invitation.full_name || 'Unnamed Invitee'}</strong>
                    <div style={{ color: '#64748b', fontSize: 13 }}>{invitation.email}</div>
                  </Td>
                  <Td>{getRoleName(invitation.role_key)}</Td>
                  <Td>
                    {invitation.status === 'pending' && !isExpired(invitation) && badge('Pending', 'yellow')}
                    {invitation.status === 'accepted' && badge('Accepted', 'green')}
                    {invitation.status === 'cancelled' && badge('Cancelled', 'gray')}
                    {isExpired(invitation) && invitation.status === 'pending' && badge('Expired', 'red')}
                  </Td>
                  <Td>{invitation.expires_at ? new Date(invitation.expires_at).toLocaleString() : '—'}</Td>
                  <Td>{invitation.created_by_email || '—'}</Td>
                  <Td>{invitation.created_at ? new Date(invitation.created_at).toLocaleString() : '—'}</Td>
                  <Td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button style={smallButton} onClick={() => void copyLink(invitation)}>
                        Copy Link
                      </button>

                      {invitation.status === 'pending' && (
                        <button style={smallButton} onClick={() => onCancel(invitation.id)}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}

              {invitations.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
                    No invitations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={th}>{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td style={td}>{children}</td>;
}

const header: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  alignItems: 'center',
  marginBottom: 12,
};

const tableWrap: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  overflow: 'auto',
  background: 'white',
};

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 10px',
  borderBottom: '1px solid #e2e8f0',
  background: '#f8fafc',
  fontSize: 13,
};

const td: React.CSSProperties = {
  padding: '12px 10px',
  borderBottom: '1px solid #f1f5f9',
  verticalAlign: 'top',
  fontSize: 14,
};

const smallButton: React.CSSProperties = {
  background: 'white',
  color: '#0f172a',
  border: '1px solid #cbd5e1',
  borderRadius: 6,
  padding: '5px 8px',
  fontSize: 12,
  cursor: 'pointer',
};