import React, { useEffect, useState } from 'react';
import { Users, ShieldCheck } from 'lucide-react';
export function LearnerManagement() {
  const [learners, setLearners] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState('');
  const [expiry, setExpiry] = useState<Record<string,string>>({});
  async function refresh() { const r = await fetch('/api/learners'); if (!r.ok) throw new Error('Could not load learners.'); setLearners(await r.json()); }
  useEffect(() => { refresh().catch(e => setMessage(e.message)); }, []);
  async function membership(id:string, status:string) {
    setBusy(id); setMessage('');
    try {
      const date = expiry[id];
      const r = await fetch(`/api/learners/${id}/membership`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status, expiresAt: date ? new Date(`${date}T23:59:59`).toISOString() : undefined}) }); const data = await r.json();
      if (!r.ok) throw new Error(data.error); await refresh(); setMessage(status === 'active' ? 'Membership granted until the selected date.' : 'Membership revoked.');
    } catch(e:any) { setMessage(e.message); } finally { setBusy(''); }
  }
  async function reset(id:string) {
    const password = window.prompt('Enter a new password (at least 12 characters). Share it privately with the learner.');
    if (!password) return; setBusy(id);
    try { const r = await fetch(`/api/learners/${id}/reset-password`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({password})}); const data = await r.json(); if(!r.ok) throw new Error(data.error); setMessage('Password reset and existing learner sessions ended.'); } catch(e:any) {setMessage(e.message);} finally {setBusy('');}
  }
  return <section className="max-w-6xl mx-auto p-5 sm:p-8 space-y-6"><div><Users className="text-indigo-600 mb-3" size={32}/><h1 className="text-3xl font-bold">Learners & memberships</h1><p className="text-slate-500 mt-2">Manage learner access to subscription courses.</p></div>
    <div className="p-5 bg-indigo-50 border border-indigo-200 rounded-2xl flex gap-3"><ShieldCheck className="text-indigo-600 shrink-0"/><div><h2 className="font-bold">Stripe setup pending</h2><p className="text-sm text-slate-600 mt-1">Online checkout is disabled. Grant time-limited memberships here for authorised learners. Free courses remain available without a membership.</p></div></div>
    <div className="grid sm:grid-cols-3 gap-4">{[['Registered learners',learners.length],['Active memberships',learners.filter(l=>l.membershipStatus==='active').length],['Course enrolments',learners.reduce((n,l)=>n+l.enrolledCourseIds.length,0)]].map(([name,value])=><div key={name} className="p-5 bg-white border rounded-xl"><p className="text-sm text-slate-500">{name}</p><p className="text-3xl font-bold mt-2">{value}</p></div>)}</div>
    {message && <p role="status" className="p-4 bg-white border rounded-xl">{message}</p>}
    <input aria-label="Search learners" placeholder="Search by name or email" value={query} onChange={e=>setQuery(e.target.value)} className="academy-input"/>
    <div className="space-y-4">{learners.filter(l=>`${l.name} ${l.email}`.toLowerCase().includes(query.toLowerCase())).map(l=><article key={l.id} className="bg-white border rounded-2xl p-5 flex flex-wrap gap-5 items-center justify-between"><div><h2 className="font-bold">{l.name}</h2><p className="text-sm text-slate-500">{l.email}</p><p className="text-xs mt-2">{l.membershipStatus === 'active' ? `Active until ${new Date(l.membershipExpiresAt).toLocaleDateString()}` : 'No active membership'}</p></div><div className="flex flex-wrap items-end gap-3"><label className="text-xs text-slate-600">Membership expiry<input aria-label={`Membership expiry for ${l.name}`} type="date" value={expiry[l.id] || ''} onChange={e=>setExpiry({...expiry,[l.id]:e.target.value})} className="academy-input"/></label><button disabled={busy===l.id || !expiry[l.id]} onClick={()=>membership(l.id,'active')} className="academy-primary">Grant / extend</button><button disabled={busy===l.id} onClick={()=>membership(l.id,'inactive')} className="p-3 text-rose-700 font-semibold">Revoke</button><button disabled={busy===l.id} onClick={()=>reset(l.id)} className="p-3 text-indigo-700">Reset password</button></div></article>)}{learners.length===0 && <p className="text-center p-12 text-slate-500">Learners will appear here after creating an academy account.</p>}</div>
  </section>;
}
