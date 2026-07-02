'use client';
export function AdminTable({rows}:{rows:Record<string,unknown>[]}) {
  const keys = Array.from(new Set(rows.flatMap(r=>Object.keys(r)))).slice(0,10);
  if (!rows.length) return <p>No records found.</p>;
  return <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr>{keys.map(k=><th key={k} style={{textAlign:'left',borderBottom:'1px solid #ddd',padding:8}}>{k}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={String(r.id ?? i)}>{keys.map(k=><td key={k} style={{borderBottom:'1px solid #eee',padding:8}}>{String(r[k] ?? '')}</td>)}</tr>)}</tbody></table></div>;
}
