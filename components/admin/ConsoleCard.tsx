import Link from 'next/link';
import type { ConsoleModule } from '@/types/admin-console';

export default function ConsoleCard({ module }: { module: ConsoleModule }) {
  const badge = module.status === 'ready' ? 'Ready' : module.status === 'attention' ? 'Review' : 'Building';
  return <section style={{border:'1px solid #e2e8f0', borderRadius:16, padding:18, background:'white'}}>
    <div style={{display:'flex', justifyContent:'space-between', gap:12}}>
      <h2 style={{fontSize:20, margin:0}}>{module.title}</h2>
      <span style={{fontSize:12, border:'1px solid #cbd5e1', borderRadius:999, padding:'4px 8px'}}>{badge}</span>
    </div>
    <p style={{color:'#475569', minHeight:48}}>{module.description}</p>
    <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:8, marginBottom:14}}>
      {(module.metrics ?? []).map(m => <Link key={m.label} href={m.href ?? module.href} style={{border:'1px solid #e2e8f0', borderRadius:12, padding:10, textDecoration:'none'}}><strong>{m.value}</strong><br/><span style={{fontSize:12,color:'#64748b'}}>{m.label}</span></Link>)}
    </div>
    <Link href={module.href} style={{fontWeight:700}}>Open {module.title} →</Link>
  </section>
}
