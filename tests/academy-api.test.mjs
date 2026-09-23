import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import net from 'node:net';
const root=process.cwd(); const directory=mkdtempSync(path.join(os.tmpdir(),'v79-academy-test-'));
const socket=net.createServer(); await new Promise(r=>socket.listen(0,'127.0.0.1',r)); const port=socket.address().port;await new Promise(r=>socket.close(r));
const child=spawn(process.execPath,[path.join(root,'dist/server.cjs')],{cwd:directory,env:{...process.env,NODE_ENV:'production',PORT:String(port),ADMIN_PASSWORD:'isolated-test-password-123'},stdio:'ignore'});
const base=`http://127.0.0.1:${port}`;
async function api(route,{method='GET',cookie='',body,status=200,headers={}}={}) {
  const response=await fetch(base+route,{method,headers:{...(cookie?{Cookie:cookie}:{}),...headers,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
  const data=await response.json();assert.equal(response.status,status,`${method} ${route}: ${JSON.stringify(data)}`);return {data,cookie:response.headers.get('set-cookie')?.split(';')[0]};
}
try {
  for(let i=0;i<100;i++){try{await fetch(base+'/api/learner/session');break;}catch{await new Promise(r=>setTimeout(r,100));}}
  const guest=await api('/api/learner/session');assert.equal(guest.data.user,null);
  const catalog=(await api('/api/public/courses')).data;assert.ok(catalog.length>=2);assert.ok(catalog.every(c=>!c.programme));
  await api('/api/courses',{status:401});
  const login=await api('/api/admin/login',{method:'POST',body:{password:'isolated-test-password-123'}});
  const changed=await api('/api/admin/change-password',{method:'POST',cookie:login.cookie,body:{currentPassword:'isolated-test-password-123',newPassword:'updated-test-password-456'}});
  const admin=changed.cookie || (await api('/api/admin/login',{method:'POST',body:{password:'updated-test-password-456'}})).cookie;
  const free=catalog[0];
  const freeModules=(await api(`/api/public/courses/${free.id}/modules`)).data;
  const freeLessons=(await api(`/api/public/modules/${freeModules[0].id}/lessons`)).data;
  assert.ok(freeLessons[0].lessonContent);
  const account=await api('/api/learner/register',{method:'POST',body:{email:'learner@example.test',name:'Test Learner',password:'learner-password-123'}});const learner=account.cookie;
  await api('/api/learner/login',{method:'POST',body:{email:'learner@example.test',password:'incorrect-password'},status:401});
  await api(`/api/learner/enroll/${free.id}`,{method:'POST',cookie:learner});
  await api(`/api/learner/progress/${free.id}`,{method:'PUT',cookie:learner,body:{completedLessons:{[freeLessons[0].id]:true,'foreign-lesson':true},programmeState:{examAttempts:[{passed:true,score:100}],certificateId:'FAKE'}}});
  const progress=(await api(`/api/learner/progress/${free.id}`,{cookie:learner})).data;
  assert.equal(progress.completedLessons['foreign-lesson'],undefined);assert.equal(progress.programmeState.examAttempts.length,0);assert.equal(progress.programmeState.certificateId,undefined);
  await api(`/api/learner/certificate/${free.id}`,{method:'POST',cookie:learner,status:409});
  const source = JSON.parse(readFileSync(path.join(directory,'data/store.json'),'utf8'));
  const programme = source.courses.find(c=>c.programme);
  const publicProgramme = (await api(`/api/public/courses/by-slug/${programme.id}`)).data;
  assert.ok(publicProgramme.programme.finalExam.questions.every(q=>q.correctAnswer===''));
  await api(`/api/learner/exam/${programme.id}`,{method:'POST',cookie:learner,body:{answers:{}},status:409});
  const lessons = source.lessons.filter(l=>l.courseId===programme.id);
  const assignments = source.assignments.filter(a=>a.courseId===programme.id);
  await api(`/api/learner/progress/${programme.id}`,{method:'PUT',cookie:learner,body:{completedLessons:Object.fromEntries(lessons.map(l=>[l.id,true])),assignmentSubmissions:Object.fromEntries(assignments.map(a=>[a.id,{text:'Completed practical activity response'}]))}});
  const quiz=source.quizzes.find(q=>lessons.some(l=>l.id===q.lessonId));
  const publicQuiz=(await api(`/api/public/lessons/${quiz.lessonId}/quiz`)).data;
  assert.ok(publicQuiz.questions.every(q=>q.correctAnswer===undefined));
  const quizResult=(await api(`/api/public/lessons/${quiz.lessonId}/quiz/submit`,{method:'POST',body:{answers:Object.fromEntries(quiz.questions.map(q=>[q.id,typeof q.correctAnswer==='number'?q.options[q.correctAnswer]:q.correctAnswer]))}})).data;
  assert.equal(quizResult.score,100);
  const passed=(await api(`/api/learner/exam/${programme.id}`,{method:'POST',cookie:learner,body:{answers:Object.fromEntries(programme.programme.finalExam.questions.map(q=>[q.id,q.correctAnswer]))}})).data;
  assert.equal(passed.attempt.score,100);
  const certificate=(await api(`/api/learner/certificate/${programme.id}`,{method:'POST',cookie:learner})).data;
  assert.equal(certificate.name,'Test Learner'); assert.ok(certificate.id.startsWith('V79-'));
  const premium=(await api('/api/courses',{method:'POST',cookie:admin,status:201,body:{title:'Subscription test',status:'Published',pricingType:'subscription',category:'Test Application'}})).data;
  const pricedPublished=(await api(`/api/courses/${premium.id}`,{method:'PUT',cookie:admin,body:{pricingType:'subscription',price:24.5,status:'Published'}})).data;
  assert.equal(pricedPublished.pricingType,'subscription');assert.equal(pricedPublished.price,24.5);
  const freePublished=(await api(`/api/courses/${premium.id}`,{method:'PUT',cookie:admin,body:{pricingType:'free',price:999,status:'Published'}})).data;
  assert.equal(freePublished.pricingType,'free');assert.equal(freePublished.price,0);
  const repricedPublished=(await api(`/api/courses/${premium.id}`,{method:'PUT',cookie:admin,body:{pricingType:'subscription',price:49.99,status:'Published'}})).data;
  assert.equal(repricedPublished.pricingType,'subscription');assert.equal(repricedPublished.price,49.99);
  const mod=(await api(`/api/courses/${premium.id}/modules`,{method:'POST',cookie:admin,status:201,body:{title:'Module'}})).data;
  const lesson=(await api(`/api/modules/${mod.id}/lessons`,{method:'POST',cookie:admin,status:201,body:{title:'Welcome',lessonContent:'PROTECTED_CONTENT'}})).data;
  const locked=(await api(`/api/public/modules/${mod.id}/lessons`)).data;
  assert.equal(locked[0].lessonContent,undefined);assert.equal(locked[0].locked,true);
  await api(`/api/public/lessons/${lesson.id}/content-blocks`,{status:403});
  await api(`/api/public/courses/${premium.id}/assignments`,{status:403});
  await api(`/api/learner/enroll/${premium.id}`,{method:'POST',cookie:learner,status:403});
  await api('/api/learner/checkout',{method:'POST',cookie:learner,status:503});
  await api(`/api/learners/${account.data.user.id}/membership`,{method:'PUT',cookie:admin,body:{status:'active',expiresAt:'2000-01-01'},status:400});
  await api(`/api/learners/${account.data.user.id}/membership`,{method:'PUT',cookie:admin,body:{status:'active',expiresAt:new Date(Date.now()+86400000).toISOString()}});
  await api(`/api/learner/enroll/${premium.id}`,{method:'POST',cookie:learner});
  assert.equal((await api(`/api/public/modules/${mod.id}/lessons`,{cookie:learner})).data[0].lessonContent,'PROTECTED_CONTENT');

  // Junior Academy: team-of-three, project planning, risks, weekly review and revision.
  const junior=source.courses.find(c=>c.id==='course-junior-ai-academy-01');assert.ok(junior);
  const mate2=await api('/api/learner/register',{method:'POST',body:{email:'mate2@example.test',name:'Team Mate Two',password:'mate-two-password-123'}});
  const mate3=await api('/api/learner/register',{method:'POST',body:{email:'mate3@example.test',name:'Team Mate Three',password:'mate-three-password-123'}});
  for (const person of [mate2,mate3]) {
    await api(`/api/learners/${person.data.user.id}/membership`,{method:'PUT',cookie:admin,body:{status:'active',expiresAt:new Date(Date.now()+86400000).toISOString()}});
  }
  await api(`/api/learner/enroll/${junior.id}`,{method:'POST',cookie:learner});
  await api(`/api/learner/enroll/${junior.id}`,{method:'POST',cookie:mate2.cookie});
  await api(`/api/learner/enroll/${junior.id}`,{method:'POST',cookie:mate3.cookie});
  const formed=(await api(`/api/junior-admin/${junior.id}/auto-form`,{method:'POST',cookie:admin})).data;
  assert.equal(formed.created,1);assert.equal(formed.teams[0].memberIds.length,3);assert.equal(formed.unassigned.length,0);
  const cookieById=new Map([[account.data.user.id,learner],[mate2.data.user.id,mate2.cookie],[mate3.data.user.id,mate3.cookie]]);
  const leaderId=formed.teams[0].currentLeaderId;const leaderCookie=cookieById.get(leaderId);assert.ok(leaderCookie);
  const nonLeaderId=formed.teams[0].memberIds.find(id=>id!==leaderId);const nonLeaderCookie=cookieById.get(nonLeaderId);assert.ok(nonLeaderCookie);
  const team=(await api(`/api/learner/junior/${junior.id}/team`,{cookie:leaderCookie})).data.team;
  assert.equal(team.members.length,3);
  await api(`/api/learner/junior/${junior.id}/team`,{method:'PUT',cookie:leaderCookie,body:{charter:'We include everyone and tell the team early if we are stuck.',decisionRule:'Listen first, then choose fairly.',conflictAgreement:'Use CALM and ask an adult for unsafe situations.',project:{title:'Reef Helper',problem:'Help children learn how to protect reefs.',audience:'Primary school children',description:'A short multimedia reef-awareness campaign.',status:'Planning'}}});
  await api(`/api/learner/junior/${junior.id}/tasks`,{method:'PUT',cookie:leaderCookie,body:{tasks:[{title:'Research reef facts',ownerId:leaderId,status:'Doing',dueWeek:1}]}});
  await api(`/api/learner/junior/${junior.id}/risks`,{method:'PUT',cookie:leaderCookie,body:{risks:[{title:'We might use an unverified fact',level:'Medium',prevention:'Check two trusted sources',backupPlan:'Remove the claim until verified',ownerId:leaderId,status:'Open'}]}});
  for (const [id,cookie] of cookieById) {
    await api(`/api/learner/junior/${junior.id}/reflections/1`,{method:'PUT',cookie,body:{helped:`Contribution by ${id}`,learned:'AI results need human checking.',next:'Complete my assigned task.'}});
  }
  await api(`/api/learner/junior/${junior.id}/submissions/1`,{method:'POST',cookie:nonLeaderCookie,status:403,body:{artifactText:'Should be rejected'}});
  let checkIn=(await api(`/api/learner/junior/${junior.id}/submissions/1`,{method:'POST',cookie:leaderCookie,body:{artifactText:'Mission 1 charter and project plan completed.',leaderReport:{planned:'Form our team and choose a project.',finished:'Charter and project idea.',help:'We need feedback on scope.'},riskUpdate:'Our first risk is checking reef facts.'}})).data.submission;
  assert.equal(checkIn.status,'Submitted');assert.equal(checkIn.revision,1);assert.equal(Object.keys(checkIn.individualReflections).length,3);
  checkIn=(await api(`/api/junior-admin/submissions/${checkIn.id}/review`,{method:'PUT',cookie:admin,body:{status:'Needs Changes',strong:'Clear purpose.',improve:'Make the audience more specific.',next:'Revise and resubmit.',rubric:{learning:3,quality:3,teamwork:4,responsibility:3,safety:4}}})).data.submission;
  assert.equal(checkIn.status,'Needs Changes');
  checkIn=(await api(`/api/learner/junior/${junior.id}/submissions/1`,{method:'POST',cookie:leaderCookie,body:{artifactText:'Mission 1 revised for primary school reef learners.',leaderReport:{planned:'Revise audience.',finished:'Audience revised.',help:'None.'},riskUpdate:'Fact-check task remains open.'}})).data.submission;
  assert.equal(checkIn.revision,2);
  checkIn=(await api(`/api/junior-admin/submissions/${checkIn.id}/review`,{method:'PUT',cookie:admin,body:{status:'Approved',strong:'Revision addressed the feedback.',improve:'No required changes.',next:'Move to the Prompt Bank.',rubric:{learning:4,quality:4,teamwork:4,responsibility:4,safety:4}}})).data.submission;
  assert.equal(checkIn.status,'Approved');
  await api(`/api/learner/junior/${junior.id}/conflicts`,{method:'POST',cookie:mate2.cookie,body:{week:1,happened:'We wanted different project names.',feelings:'Both ideas mattered.',calmStep:'Look for fair choices',agreement:'Combine the strongest words.',nextTime:'Listen fully before voting.'},status:201});
  const conflictRows=(await api(`/api/junior-admin/${junior.id}/conflicts`,{cookie:admin})).data.conflictReflections;
  assert.equal(conflictRows.length,1);
  await api(`/api/learner/certificate/${junior.id}`,{method:'POST',cookie:leaderCookie,status:409});
  await api(`/api/learners/${account.data.user.id}/membership`,{method:'PUT',cookie:admin,body:{status:'inactive'}});
  await api(`/api/public/lessons/${lesson.id}/quiz`,{cookie:learner,status:403});
  await api(`/api/courses/${premium.id}`,{method:'DELETE',cookie:admin});
  await api(`/api/public/courses/by-slug/${premium.id}`,{status:404});
  const stored=JSON.parse(readFileSync(path.join(directory,'data/store.json'),'utf8'));
  assert.equal(stored.modules.some(m=>m.courseId===premium.id),false);assert.equal(stored.lessons.some(l=>l.courseId===premium.id),false);
  await api('/api/admin/reset-password',{method:'POST',body:{token:'V79-RECOVERY-KEY-2026',newPassword:'replacement-password'},status:401});
  const recovery=(await api('/api/admin/recovery-info')).data;assert.equal(JSON.stringify(recovery).includes('V79-RECOVERY-KEY-2026'),false);
  await api('/api/learner/logout',{method:'POST',cookie:learner});await api(`/api/learner/progress/${free.id}`,{cookie:learner,status:401});
  console.log('✓ Academy API: accounts, enrolment, protected content, membership grant/revoke/expiry, progress validation, certificate checks, deletion, recovery and logout passed');
} finally {child.kill();await new Promise(r=>child.once('exit',r));rmSync(directory,{recursive:true,force:true});}
