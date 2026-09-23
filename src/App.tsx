import React, { lazy, Suspense } from 'react';
const AdminApp = lazy(() => import('./AdminApp'));
const Academy = lazy(() => import('./components/AcademyLandingPage').then(m => ({ default: m.AcademyLandingPage })));
const Classroom = lazy(() => import('./components/StudentPortal').then(m => ({ default: m.StudentPortal })));
export default function App() {
  const pathname = window.location.pathname;
  return <Suspense fallback={<div role="status" className="min-h-screen flex items-center justify-center bg-slate-50 text-indigo-700">Loading V79 Academy…</div>}>
    {pathname.startsWith('/academy') ? <Academy initialCourseSlug={pathname.startsWith('/academy/course/') ? pathname.slice('/academy/course/'.length) : ''}/> : pathname.startsWith('/course/') ? <Classroom courseSlug={pathname.slice('/course/'.length)}/> : <AdminApp/>}
  </Suspense>;
}
