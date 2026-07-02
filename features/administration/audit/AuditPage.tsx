'use client';
import React,{useEffect,useState}from'react';
import {CrudTable} from '@/components/admin/CrudTable';
import {adminList} from '@/lib/enterprise-admin/api';
import type {AuditLog} from '@/types/enterprise-admin';
export default function AuditPage(){const[rows,setRows]=useState<AuditLog[]>([]);const[error,setError]=useState('');useEffect(()=>{adminList<AuditLog>('audit-logs').then(setRows).catch(e=>setError(e.message));},[]);return <main style={{padding:24}}><h1>Audit Logs</h1>{error&&<p style={{color:'crimson'}}>{error}</p>}<CrudTable rows={rows} columns={[{key:'action',label:'Action'},{key:'entity_type',label:'Entity'},{key:'entity_id',label:'Entity ID'},{key:'actor_user_id',label:'Actor'},{key:'created_at',label:'Created'},{key:'metadata',label:'Metadata',render:(r)=>JSON.stringify(r.metadata??{})}]} /></main>}
