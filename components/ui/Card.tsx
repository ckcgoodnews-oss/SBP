import React from 'react';

export function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}>
      {title ? <h2 style={{ marginTop: 0, fontSize: 18 }}>{title}</h2> : null}
      {children}
    </section>
  );
}
