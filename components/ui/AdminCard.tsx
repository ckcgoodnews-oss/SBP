import React from 'react';
export function AdminCard({title,children}:{title?:string;children:React.ReactNode}) {
  return <section style={{border:'1px solid #e5e7eb',borderRadius:12,padding:16,background:'white',marginBottom:16}}>{title && <h2 style={{marginTop:0}}>{title}</h2>}{children}</section>;
}
