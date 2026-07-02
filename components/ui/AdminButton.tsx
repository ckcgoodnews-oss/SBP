'use client';
import React from 'react';
export function AdminButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} style={{padding:'8px 12px',border:'1px solid #ccc',borderRadius:8,background:'#111827',color:'white',cursor:'pointer',...props.style}} />;
}
