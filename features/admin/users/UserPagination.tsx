'use client';

import React from 'react';

type Props = {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
};

export default function UserPagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(totalCount, page * pageSize);

  return (
    <section style={wrap} aria-label="User table pagination">
      <div style={{ color: '#64748b', fontSize: 13 }}>
        Showing {start}-{end} of {totalCount}
      </div>

      <div style={buttonGroup}>
        <button type="button" style={button} disabled={page <= 1} onClick={() => onPageChange(1)}>
          First
        </button>

        <button type="button" style={button} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </button>

        <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
          Page {page} of {totalPages}
        </span>

        <button type="button" style={button} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </button>

        <button type="button" style={button} disabled={page >= totalPages} onClick={() => onPageChange(totalPages)}>
          Last
        </button>
      </div>
    </section>
  );
}

const wrap: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'center',
  flexWrap: 'wrap',
  marginTop: 12,
  marginBottom: 24,
};

const buttonGroup: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap',
};

const button: React.CSSProperties = {
  background: 'white',
  color: '#0f172a',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: '7px 10px',
  cursor: 'pointer',
};