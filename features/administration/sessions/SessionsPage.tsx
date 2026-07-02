'use client';
import React,{useEffect,useState}from'react';
import {CrudTable} from '@/components/admin/CrudTable';
import {adminDelete,adminList,adminUpdate} from '@/lib/enterprise-admin/api';
import type {IamSession} from '@/types/enterprise-admin';
export default function SessionsPage(){const[rows,setRows]=useState<IamSession[]>([]);const[error,setError]=useState('');const load=async()=>setRows(await adminList<IamSession>('sessions'));useEffect(()=>{load().catch(e=>setError(e.message));},[]);return <main style={{padding:24}}><h1>Active Sessions</h1>{error&&<p style={{color:'crimson'}}>{error}</p>}<CrudTable rows={rows} columns={[{key:'tenant_user_id',label:'Tenant User'},{key:'ip_address',label:'IP'},{key:'user_agent',label:'User Agent'},{key:'status',label:'Status'},{key:'created_at',label:'Created'},{key:'revoked_at',label:'Revoked'}]} onEdit={async r=>{await adminUpdate('sessions',r.id,{status:'revoked',revoked_at:new Date().toISOString()});await load();}} onDelete={async r=>{if(confirm('Revoke this session?')){await adminDelete('sessions',r.id);await load();}}}/></main>}
