import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Crown, RefreshCw, Send, Users } from 'lucide-react';

const JUNIOR_COURSE_ID = 'course-junior-ai-academy-01';

export function JuniorAcademyManagement() {
  const [teams, setTeams] = useState<any[]>([]);
  const [learners, setLearners] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [leaderChoice, setLeaderChoice] = useState<Record<string,string>>({});

  async function refresh() {
    setBusy(true);
    try {
      const [teamsRes, learnersRes] = await Promise.all([
        fetch(`/api/junior-admin/${JUNIOR_COURSE_ID}/teams`),
        fetch('/api/learners')
      ]);
      const teamsData = await teamsRes.json();
      const learnersData = await learnersRes.json();
      if (!teamsRes.ok) throw new Error(teamsData.error || 'Could not load Junior Academy teams.');
      if (!learnersRes.ok) throw new Error(learnersData.error || 'Could not load learners.');
      setTeams(teamsData.teams || []);
      setLearners(Array.isArray(learnersData) ? learnersData : []);
      const choices: Record<string,string> = {};
      (teamsData.teams || []).forEach((team:any)=>choices[team.id]=team.currentLeaderId);
      setLeaderChoice(choices);
    } catch (e:any) { setMessage(e.message); } finally { setBusy(false); }
  }

  useEffect(() => { refresh(); }, []);

  async function autoForm() {
    setBusy(true); setMessage('');
    try {
      const r = await fetch(`/api/junior-admin/${JUNIOR_COURSE_ID}/auto-form`, { method:'POST' });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setMessage(`Created ${data.created} new studio team(s). Learners already assigned were left unchanged.`);
      await refresh();
    } catch(e:any) { setMessage(e.message); } finally { setBusy(false); }
  }

  async function rotateLeader(team:any) {
    const next = leaderChoice[team.id];
    if (!next) return;
    const weekRaw = window.prompt('Which week does the new leader start? (1–16)', team.leadershipHistory?.length < 2 ? '6' : '11');
    if (!weekRaw) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/junior-admin/teams/${team.id}/leader`, {
        method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({leaderId:next,startWeek:Number(weekRaw)})
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setMessage('Team leadership updated. Remind the outgoing leader to complete a handover.');
      await refresh();
    } catch(e:any) { setMessage(e.message); } finally { setBusy(false); }
  }

  async function review(submission:any, status:'Needs Changes'|'Approved') {
    const strong = window.prompt('⭐ Strong — what did the team do well?', submission.reviews?.at(-1)?.strong || '') ?? '';
    const improve = window.prompt('🔧 Improve — what should they fix?', status === 'Approved' ? 'No required changes.' : submission.reviews?.at(-1)?.improve || '') ?? '';
    const next = window.prompt('🚀 Next — what should they focus on next?', submission.reviews?.at(-1)?.next || '') ?? '';
    const teamwork = Number(window.prompt('Teamwork rating 1–4', '3') || 3);
    const responsibility = Number(window.prompt('Responsibility / project management rating 1–4', '3') || 3);
    const learning = Number(window.prompt('Skill / understanding rating 1–4', '3') || 3);
    const quality = Number(window.prompt('Quality / accuracy rating 1–4', '3') || 3);
    const safety = Number(window.prompt('Safety / ethics rating 1–4', '3') || 3);
    setBusy(true);
    try {
      const r = await fetch(`/api/junior-admin/submissions/${submission.id}/review`, {
        method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({
          status, strong, improve, next, reviewedBy:'V79 Instructor',
          rubric:{learning,quality,teamwork,responsibility,safety}
        })
      });
      const data=await r.json();
      if(!r.ok) throw new Error(data.error);
      setMessage(status === 'Approved' ? 'Weekly Studio Check-In approved.' : 'Feedback returned to the team for revision.');
      await refresh();
    } catch(e:any) {setMessage(e.message);} finally {setBusy(false);}
  }

  const pending = useMemo(() => teams.flatMap(t => (t.submissions || []).filter((s:any)=>['Submitted','Under Review','Needs Changes'].includes(s.status))), [teams]);

  return <section className="max-w-7xl mx-auto p-5 sm:p-8 space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><Users className="text-indigo-600 mb-3" size={32}/><h1 className="text-3xl font-bold">Junior Academy Studio Teams</h1><p className="text-slate-500 mt-2">Teams of three, leadership rotation, weekly review, project accountability and collaboration.</p></div>
      <div className="flex gap-2"><button disabled={busy} onClick={refresh} className="p-3 border rounded-xl"><RefreshCw size={17}/></button><button disabled={busy} onClick={autoForm} className="academy-primary">Auto-form teams of 3</button></div>
    </div>

    {message && <p role="status" className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-indigo-900">{message}</p>}

    <div className="grid sm:grid-cols-3 gap-4">
      <div className="p-5 bg-white border rounded-xl"><p className="text-sm text-slate-500">Studio teams</p><p className="text-3xl font-bold mt-2">{teams.length}</p></div>
      <div className="p-5 bg-white border rounded-xl"><p className="text-sm text-slate-500">Pending reviews</p><p className="text-3xl font-bold mt-2">{pending.length}</p></div>
      <div className="p-5 bg-white border rounded-xl"><p className="text-sm text-slate-500">Registered learners</p><p className="text-3xl font-bold mt-2">{learners.length}</p></div>
    </div>

    <div className="space-y-5">
      {teams.map(team => <article key={team.id} className="bg-white border rounded-2xl p-5 space-y-5">
        <div className="flex flex-wrap justify-between gap-3">
          <div><h2 className="text-lg font-black">{team.name}</h2><p className="text-xs text-slate-500">{team.project?.title || 'Project idea not named yet'} • {team.project?.status || 'Idea'}</p></div>
          <div className="flex items-end gap-2"><label className="text-xs text-slate-600">Next leader<select value={leaderChoice[team.id] || ''} onChange={e=>setLeaderChoice({...leaderChoice,[team.id]:e.target.value})} className="academy-input">{team.members.map((m:any)=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label><button disabled={busy || leaderChoice[team.id]===team.currentLeaderId} onClick={()=>rotateLeader(team)} className="academy-primary"><Crown size={14} className="inline mr-1"/>Rotate</button></div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">{team.members.map((m:any)=><div key={m.id} className={`rounded-xl border p-3 ${m.id===team.currentLeaderId?'bg-amber-50 border-amber-200':'bg-slate-50'}`}><p className="font-bold text-sm">{m.name}</p><p className="text-xs text-slate-500">{team.roles[m.id]}{m.id===team.currentLeaderId?' • Current leader':''}</p></div>)}</div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-xl bg-slate-50 p-4"><h3 className="font-bold text-sm">Task board</h3><p className="text-xs text-slate-600 mt-2">To Do: {team.tasks.filter((t:any)=>t.status==='To Do').length} • Doing: {team.tasks.filter((t:any)=>t.status==='Doing').length} • Done: {team.tasks.filter((t:any)=>t.status==='Done').length}</p></div>
          <div className="rounded-xl bg-slate-50 p-4"><h3 className="font-bold text-sm">Open risks / Uh-Ohs</h3><p className="text-xs text-slate-600 mt-2">{team.risks.filter((r:any)=>r.status==='Open').length} open</p></div>
        </div>

        <div>
          <h3 className="font-bold text-sm mb-2">Weekly submissions</h3>
          <div className="space-y-2">{(team.submissions || []).length===0 && <p className="text-xs text-slate-500">No Studio Check-Ins submitted yet.</p>}
            {(team.submissions || []).map((s:any)=><div key={s.id} className="rounded-xl border p-4 flex flex-wrap gap-3 justify-between items-center">
              <div><p className="font-bold text-sm">Mission {s.missionNumber} <span className="text-xs font-normal text-slate-500">• revision {s.revision}</span></p><p className="text-xs text-slate-500">{s.status} • {s.artifactText?.slice(0,120) || 'No description'}{s.artifactText?.length>120?'…':''}</p></div>
              <div className="flex gap-2">{s.status!=='Approved' && <button disabled={busy} onClick={()=>review(s,'Needs Changes')} className="px-3 py-2 rounded-lg border text-xs font-semibold text-amber-700">Needs changes</button>}<button disabled={busy} onClick={()=>review(s,'Approved')} className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold"><CheckCircle2 size={14} className="inline mr-1"/>Approve</button></div>
            </div>)}
          </div>
        </div>
      </article>)}
    </div>
  </section>;
}
