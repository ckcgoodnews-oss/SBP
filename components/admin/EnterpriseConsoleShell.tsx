import Link from 'next/link';
import type { ReactNode } from 'react';

const nav = [
  ['Console','/admin/console'], ['CRM','/admin/crm'], ['Dispatch','/admin/dispatch'], ['Inventory','/admin/inventory'],
  ['Accounting','/admin/accounting'], ['Reporting','/admin/reporting'], ['Security','/admin/security']
];

export default function EnterpriseConsoleShell({ title, description, children }: { title:string; description?:string; children:ReactNode }) {
  return <main style={{padding:24, maxWidth:1400, margin:'0 auto'}}>
    <header style={{display:'flex', justifyContent:'space-between', gap:16, alignItems:'flex-start', marginBottom:20}}>
      <div><h1 style={{fontSize:30, fontWeight:800, margin:0}}>{title}</h1>{description && <p style={{color:'#64748b', marginTop:8}}>{description}</p>}</div>
      <nav style={{display:'flex', flexWrap:'wrap', gap:8}}>{nav.map(([label,href])=><Link key={href} href={href} style={{padding:'8px 12px', border:'1px solid #e2e8f0', borderRadius:10, textDecoration:'none'}}>{label}</Link>)}</nav>
    </header>
    {children}
  </main>
}
