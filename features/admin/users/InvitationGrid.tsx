'use client';

import React from 'react';
import AdminEmptyState from './AdminEmptyState';
import AdminLoadingState from './AdminLoadingState';
import AdminSectionHeader from './AdminSectionHeader';
import AdminStatusBadge from './AdminStatusBadge';
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

  function renderStatus(invitation: IamInvitation) {
    if (isExpired(invitation) && invitation.status === 'pending') {
      return <AdminStatusBadge label="Expired" tone="red" />;
    }

    if (invitation.status === 'pending') {
      return <AdminStatusBadge label="Pending" tone="yellow" />;
    }

    if (invitation.status === 'accepted') {
      return <AdminStatusBadge label="Accepted" tone="green" />;
    }

    if (invitation.status === 'cancelled') {
      return <AdminStatusBadge label="Cancelled" tone="gray" />;
    }

    return <AdminStatusBadge label={invitation.status || 'Unknown'} tone="gray" />;
  }

  return (
    <section style={{ marginTop: 28 }}>
      <AdminSectionHeader
        title="Pending Invitations"
        description="Track user invitations, expiration, and onboarding status."
      />

      <div style={tableWrap}>
        {loading ? (
          <AdminLoadingState label="Loading invitations..." />
        ) : invitations.length === 0 ? (
          <AdminEmptyState
            title="No invitations found"
            message="No invitations match the current search or filter."
          />
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
                  <Td>{renderStatus(invitation)}</Td>
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