import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardCheck, Crown, Handshake, ListChecks, RefreshCw, Send, ShieldCheck, Users } from 'lucide-react';

type Member = { id: string; name: string; email?: string };
type Task = { id: string; title: string; ownerId: string; status: 'To Do' | 'Doing' | 'Done'; dueWeek: number };
type Risk = { id: string; title: string; level: 'Low' | 'Medium' | 'High'; prevention: string; backupPlan: string; ownerId: string; status: 'Open' | 'Handled' };
type Submission = {
  id: string;
  missionNumber: number;
  artifactText: string;
  artifactUrls: string[];
  leaderReport: { planned: string; finished: string; help: string };
  riskUpdate: string;
  individualReflections: Record<string, { helped: string; learned: string; next: string; savedAt: string }>;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Needs Changes' | 'Approved';
  revision: number;
  reviews: Array<{ id: string; status: string; rubric: Record<string, number>; strong: string; improve: string; next: string; reviewedAt: string }>;
};

type Team = {
  id: string;
  name: string;
  memberIds: string[];
  currentLeaderId: string;
  roles: Record<string, 'Leader' | 'Builder' | 'Checker'>;
  charter: string;
  decisionRule: string;
  conflictAgreement: string;
  project: { title: string; problem: string; audience: string; description: string; status: string };
  tasks: Task[];
  risks: Risk[];
  members: Member[];
  submissions: Submission[];
};

interface Props {
  courseId: string;
  missionNumber: number;
  learnerId: string | null;
}

const emptyLeader = { planned: '', finished: '', help: '' };

export function JuniorTeamStudio({ courseId, missionNumber, learnerId }: Props) {
  const [team, setTeam] = useState<Team | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskOwner, setTaskOwner] = useState('');
  const [riskTitle, setRiskTitle] = useState('');
  const [riskOwner, setRiskOwner] = useState('');
  const [artifactText, setArtifactText] = useState('');
  const [artifactUrl, setArtifactUrl] = useState('');
  const [leaderReport, setLeaderReport] = useState(emptyLeader);
  const [riskUpdate, setRiskUpdate] = useState('');
  const [reflection, setReflection] = useState({ helped: '', learned: '', next: '' });
  const [conflict, setConflict] = useState({ happened: '', feelings: '', calmStep: '', agreement: '', nextTime: '' });

  const submission = useMemo(() => team?.submissions?.find(s => s.missionNumber === missionNumber), [team, missionNumber]);
  const isLeader = Boolean(team && learnerId && team.currentLeaderId === learnerId);

  async function refresh() {
    if (!learnerId) return;
    const response = await fetch(`/api/learner/junior/${courseId}/team`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not load your studio team.');
    setTeam(data.team || null);
  }

  useEffect(() => {
    refresh().catch(e => setMessage(e.message));
  }, [courseId, learnerId]);

  useEffect(() => {
    if (!submission || !learnerId) return;
    setArtifactText(submission.artifactText || '');
    setArtifactUrl(submission.artifactUrls?.[0] || '');
    setLeaderReport(submission.leaderReport || emptyLeader);
    setRiskUpdate(submission.riskUpdate || '');
    setReflection(submission.individualReflections?.[learnerId] || { helped: '', learned: '', next: '' });
  }, [submission?.id, submission?.revision, learnerId]);

  async function saveTasks(tasks: Task[]) {
    setBusy(true);
    try {
      const response = await fetch(`/api/learner/junior/${courseId}/tasks`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tasks })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setTeam(current => current ? { ...current, tasks: data.tasks } : current);
      setMessage('Task board saved.');
    } catch (e: any) { setMessage(e.message); } finally { setBusy(false); }
  }

  async function addTask() {
    if (!team || !taskTitle.trim()) return;
    const ownerId = taskOwner || learnerId || team.memberIds[0];
    await saveTasks([...(team.tasks || []), { id: crypto.randomUUID(), title: taskTitle.trim(), ownerId, status: 'To Do', dueWeek: missionNumber }]);
    setTaskTitle('');
  }

  async function moveTask(id: string, status: Task['status']) {
    if (!team) return;
    await saveTasks(team.tasks.map(t => t.id === id ? { ...t, status } : t));
  }

  async function saveRisks(risks: Risk[]) {
    setBusy(true);
    try {
      const response = await fetch(`/api/learner/junior/${courseId}/risks`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ risks })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setTeam(current => current ? { ...current, risks: data.risks } : current);
      setMessage('Risk / Uh-Oh plan saved.');
    } catch (e: any) { setMessage(e.message); } finally { setBusy(false); }
  }

  async function addRisk() {
    if (!team || !riskTitle.trim()) return;
    const ownerId = riskOwner || learnerId || team.memberIds[0];
    await saveRisks([...(team.risks || []), {
      id: crypto.randomUUID(), title: riskTitle.trim(), level: 'Low', prevention: '', backupPlan: '', ownerId, status: 'Open'
    }]);
    setRiskTitle('');
  }

  async function saveTeamPlan() {
    if (!team) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/learner/junior/${courseId}/team`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          charter: team.charter,
          decisionRule: team.decisionRule,
          conflictAgreement: team.conflictAgreement,
          project: team.project
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setTeam(data.team);
      setMessage('Team Charter and project plan saved.');
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveReflection() {
    setBusy(true);
    try {
      const response = await fetch(`/api/learner/junior/${courseId}/reflections/${missionNumber}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reflection)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage('Your individual reflection is saved.');
      await refresh();
    } catch (e: any) { setMessage(e.message); } finally { setBusy(false); }
  }

  async function submitCheckIn() {
    setBusy(true);
    try {
      const response = await fetch(`/api/learner/junior/${courseId}/submissions/${missionNumber}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artifactText,
          artifactUrls: artifactUrl.trim() ? [artifactUrl.trim()] : [],
          leaderReport,
          riskUpdate
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage('Weekly Studio Check-In submitted for instructor review.');
      await refresh();
    } catch (e: any) { setMessage(e.message); } finally { setBusy(false); }
  }

  async function saveConflictReflection() {
    setBusy(true);
    try {
      const response = await fetch(`/api/learner/junior/${courseId}/conflicts`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...conflict, week: missionNumber })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setConflict({ happened: '', feelings: '', calmStep: '', agreement: '', nextTime: '' });
      setMessage('CALM Fix-It reflection saved for your instructor.');
    } catch (e: any) { setMessage(e.message); } finally { setBusy(false); }
  }

  if (!learnerId) {
    return <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-sm text-indigo-900">Sign in to join your AI Studio Team and submit weekly work.</section>;
  }

  if (!team) {
    return <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"><Users className="mb-2" />Your instructor has not assigned you to a team yet.</section>;
  }

  const nameFor = (id: string) => team.members.find(m => m.id === id)?.name || 'Team member';
  const latestReview = submission?.reviews?.[submission.reviews.length - 1];

  return (
    <section className="space-y-5 rounded-3xl border border-indigo-100 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-indigo-700"><Users size={19}/><span className="text-xs font-black uppercase tracking-wider">AI Studio Team</span></div>
          <h2 className="mt-1 text-xl font-black text-slate-900">{team.name}</h2>
          <p className="text-xs text-slate-500">Mission {missionNumber} • Plan → Do → Check → Submit → Review → Improve</p>
        </div>
        <button onClick={() => refresh().catch(e => setMessage(e.message))} className="rounded-xl border px-3 py-2 text-xs font-semibold"><RefreshCw size={14} className="inline mr-1"/>Refresh</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {team.members.map(member => (
          <div key={member.id} className={`rounded-2xl border p-4 ${member.id === team.currentLeaderId ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
            <div className="flex items-center gap-2">{member.id === team.currentLeaderId && <Crown size={16} className="text-amber-600"/>}<span className="font-bold text-sm">{member.name}</span></div>
            <p className="mt-1 text-xs text-slate-500">{team.roles[member.id] || 'Team member'}</p>
          </div>
        ))}
      </div>

      {message && <p role="status" className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs text-indigo-900">{message}</p>}

      <details open={missionNumber === 1} className="rounded-2xl border border-slate-200 p-4">
        <summary className="cursor-pointer font-bold flex items-center gap-2"><ClipboardCheck size={17}/>Team Charter & Project Plan</summary>
        <p className="mt-2 text-xs text-slate-500">Build this together in Mission 1, then update it when your project becomes clearer.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-600">Project title
            <input value={team.project.title} onChange={e=>setTeam({...team,project:{...team.project,title:e.target.value}})} placeholder="What are we making?" className="academy-input mt-1 w-full"/>
          </label>
          <label className="text-xs font-semibold text-slate-600">Audience
            <input value={team.project.audience} onChange={e=>setTeam({...team,project:{...team.project,audience:e.target.value}})} placeholder="Who is it for?" className="academy-input mt-1 w-full"/>
          </label>
          <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Problem / opportunity
            <textarea value={team.project.problem} onChange={e=>setTeam({...team,project:{...team.project,problem:e.target.value}})} placeholder="What are we helping, teaching, improving or creating?" className="academy-input mt-1 min-h-20 w-full"/>
          </label>
          <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Project description
            <textarea value={team.project.description} onChange={e=>setTeam({...team,project:{...team.project,description:e.target.value}})} placeholder="Describe the idea in your own words." className="academy-input mt-1 min-h-20 w-full"/>
          </label>
          <label className="text-xs font-semibold text-slate-600">Project stage
            <select value={team.project.status} onChange={e=>setTeam({...team,project:{...team.project,status:e.target.value}})} className="academy-input mt-1 w-full">
              <option>Idea</option><option>Planning</option><option>Building</option><option>Testing</option><option>Final</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Our Team Charter
            <textarea value={team.charter} onChange={e=>setTeam({...team,charter:e.target.value})} placeholder="How will we share work, include everyone and keep our promises?" className="academy-input mt-1 min-h-24 w-full"/>
          </label>
          <label className="text-xs font-semibold text-slate-600">How we make decisions
            <textarea value={team.decisionRule} onChange={e=>setTeam({...team,decisionRule:e.target.value})} className="academy-input mt-1 min-h-20 w-full"/>
          </label>
          <label className="text-xs font-semibold text-slate-600">How we handle disagreement
            <textarea value={team.conflictAgreement} onChange={e=>setTeam({...team,conflictAgreement:e.target.value})} className="academy-input mt-1 min-h-20 w-full"/>
          </label>
        </div>
        <button disabled={busy} onClick={saveTeamPlan} className="academy-primary mt-3">Save Team Plan</button>
      </details>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
          <h3 className="font-bold flex items-center gap-2"><ListChecks size={17}/>Task Board</h3>
          <div className="grid grid-cols-3 gap-2">
            {(['To Do','Doing','Done'] as const).map(status => (
              <div key={status} className="rounded-xl bg-slate-50 p-2 min-h-24">
                <p className="text-[11px] font-black uppercase text-slate-500">{status}</p>
                <div className="mt-2 space-y-2">
                  {team.tasks.filter(t => t.status === status).map(task => (
                    <div key={task.id} className="rounded-lg border bg-white p-2 text-xs">
                      <p className="font-semibold">{task.title}</p>
                      <p className="text-[10px] text-slate-400">{nameFor(task.ownerId)}</p>
                      <select value={task.status} onChange={e => moveTask(task.id, e.target.value as Task['status'])} className="mt-1 w-full rounded border p-1 text-[10px]">
                        <option>To Do</option><option>Doing</option><option>Done</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} placeholder="Add a team task" className="academy-input flex-1"/>
            <select value={taskOwner} onChange={e=>setTaskOwner(e.target.value)} className="academy-input">
              <option value="">Me</option>{team.members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <button disabled={busy || !taskTitle.trim()} onClick={addTask} className="academy-primary">Add</button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
          <h3 className="font-bold flex items-center gap-2"><AlertTriangle size={17}/>Risk / Uh-Oh Plan</h3>
          {team.risks.length === 0 && <p className="text-xs text-slate-500">Ask: What could go wrong? How can we stop it? Who can help?</p>}
          <div className="space-y-3">
            {team.risks.map(risk => <div key={risk.id} className="rounded-xl bg-slate-50 p-3 text-xs space-y-2">
              <div className="flex flex-wrap gap-2 items-center justify-between"><b>{risk.title}</b>
                <div className="flex gap-2">
                  <select value={risk.level} onChange={e=>setTeam({...team,risks:team.risks.map(r=>r.id===risk.id?{...r,level:e.target.value as Risk['level']}:r)})} className="rounded border p-1 text-[10px]">
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                  <select value={risk.status} onChange={e=>setTeam({...team,risks:team.risks.map(r=>r.id===risk.id?{...r,status:e.target.value as Risk['status']}:r)})} className="rounded border p-1 text-[10px]">
                    <option>Open</option><option>Handled</option>
                  </select>
                </div>
              </div>
              <label className="block text-[10px] font-bold text-slate-500">Prevention
                <input value={risk.prevention} onChange={e=>setTeam({...team,risks:team.risks.map(r=>r.id===risk.id?{...r,prevention:e.target.value}:r)})} placeholder="How can we stop this?" className="academy-input mt-1 w-full"/>
              </label>
              <label className="block text-[10px] font-bold text-slate-500">Backup plan
                <input value={risk.backupPlan} onChange={e=>setTeam({...team,risks:team.risks.map(r=>r.id===risk.id?{...r,backupPlan:e.target.value}:r)})} placeholder="What will we do if it happens?" className="academy-input mt-1 w-full"/>
              </label>
              <label className="block text-[10px] font-bold text-slate-500">Owner
                <select value={risk.ownerId} onChange={e=>setTeam({...team,risks:team.risks.map(r=>r.id===risk.id?{...r,ownerId:e.target.value}:r)})} className="academy-input mt-1 w-full">
                  {team.members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </label>
            </div>)}
          </div>
          {team.risks.length > 0 && <button disabled={busy} onClick={()=>saveRisks(team.risks)} className="academy-primary">Save Risk Plans</button>}
          <div className="flex gap-2">
            <input value={riskTitle} onChange={e=>setRiskTitle(e.target.value)} placeholder="Add a risk / Uh-Oh" className="academy-input flex-1"/>
            <select value={riskOwner} onChange={e=>setRiskOwner(e.target.value)} className="academy-input">
              <option value="">Me</option>{team.members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <button disabled={busy || !riskTitle.trim()} onClick={addRisk} className="academy-primary">Add</button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
        <h3 className="font-bold flex items-center gap-2"><CheckCircle2 size={17}/>My Weekly Reflection</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          <textarea value={reflection.helped} onChange={e=>setReflection({...reflection,helped:e.target.value})} placeholder="What did I help with?" className="academy-input min-h-24"/>
          <textarea value={reflection.learned} onChange={e=>setReflection({...reflection,learned:e.target.value})} placeholder="What did I learn?" className="academy-input min-h-24"/>
          <textarea value={reflection.next} onChange={e=>setReflection({...reflection,next:e.target.value})} placeholder="What will I do next?" className="academy-input min-h-24"/>
        </div>
        <button disabled={busy} onClick={saveReflection} className="academy-primary">Save My Reflection</button>
      </div>

      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-3">
        <div className="flex flex-wrap justify-between gap-2">
          <h3 className="font-bold flex items-center gap-2"><Send size={17}/>Weekly Studio Check-In</h3>
          <span className="rounded-full bg-white border px-3 py-1 text-xs font-bold">{submission?.status || 'Draft'}</span>
        </div>
        {!isLeader && <p className="text-xs text-indigo-900">Your Team Leader, <b>{nameFor(team.currentLeaderId)}</b>, submits the team Check-In. You still need to save your individual reflection.</p>}
        {isLeader && <>
          <textarea value={artifactText} onChange={e=>setArtifactText(e.target.value)} placeholder="Describe this week's deliverable and where it belongs in the final project." className="academy-input min-h-24"/>
          <input value={artifactUrl} onChange={e=>setArtifactUrl(e.target.value)} placeholder="Optional shareable link to the team's work" className="academy-input"/>
          <div className="grid gap-2 sm:grid-cols-3">
            <textarea value={leaderReport.planned} onChange={e=>setLeaderReport({...leaderReport,planned:e.target.value})} placeholder="What did we plan?" className="academy-input min-h-20"/>
            <textarea value={leaderReport.finished} onChange={e=>setLeaderReport({...leaderReport,finished:e.target.value})} placeholder="What did we finish?" className="academy-input min-h-20"/>
            <textarea value={leaderReport.help} onChange={e=>setLeaderReport({...leaderReport,help:e.target.value})} placeholder="What do we need help with?" className="academy-input min-h-20"/>
          </div>
          <textarea value={riskUpdate} onChange={e=>setRiskUpdate(e.target.value)} placeholder="Risk / Uh-Oh update: what might stop us, and what is our backup plan?" className="academy-input min-h-20"/>
          <button disabled={busy || ['Under Review','Approved'].includes(submission?.status || '')} onClick={submitCheckIn} className="academy-primary">Submit for Instructor Review</button>
        </>}
        {latestReview && <div className="rounded-xl border bg-white p-4 text-xs space-y-2">
          <p className="font-black uppercase text-indigo-700">Instructor feedback</p>
          <p><b>⭐ Strong:</b> {latestReview.strong || '—'}</p>
          <p><b>🔧 Improve:</b> {latestReview.improve || '—'}</p>
          <p><b>🚀 Next:</b> {latestReview.next || '—'}</p>
        </div>}
      </div>

      <details className="rounded-2xl border border-violet-200 bg-violet-50/40 p-4">
        <summary className="cursor-pointer font-bold flex items-center gap-2"><Handshake size={17}/>CALM Conflict Fix-It Card</summary>
        <p className="mt-2 text-xs text-slate-600"><b>C</b>ool down → <b>A</b>sk & listen → <b>L</b>ook for fair choices → <b>M</b>ake an agreement. Tell an adult immediately about bullying, threats, unsafe behavior, discrimination, repeated exclusion or privacy problems.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <textarea value={conflict.happened} onChange={e=>setConflict({...conflict,happened:e.target.value})} placeholder="What happened?" className="academy-input"/>
          <textarea value={conflict.feelings} onChange={e=>setConflict({...conflict,feelings:e.target.value})} placeholder="How did everyone feel?" className="academy-input"/>
          <textarea value={conflict.calmStep} onChange={e=>setConflict({...conflict,calmStep:e.target.value})} placeholder="Which CALM step helped?" className="academy-input"/>
          <textarea value={conflict.agreement} onChange={e=>setConflict({...conflict,agreement:e.target.value})} placeholder="What did we agree?" className="academy-input"/>
          <textarea value={conflict.nextTime} onChange={e=>setConflict({...conflict,nextTime:e.target.value})} placeholder="What will we do better next time?" className="academy-input sm:col-span-2"/>
        </div>
        <button disabled={busy || !conflict.happened.trim()} onClick={saveConflictReflection} className="mt-3 academy-primary">Save Fix-It Reflection</button>
      </details>

      <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 flex gap-2"><ShieldCheck size={15} className="shrink-0"/>Your team workspace is for learning and project collaboration. Do not put passwords, home addresses, private phone numbers or other sensitive information in submissions.</div>
    </section>
  );
}
