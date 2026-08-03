import React, { useState, useEffect } from 'react';
import { Course, Module, Lesson } from '../types';
import { ContentBlock, ContentBlockType } from '../types/course-builder-v2';
import { 
  Plus, ChevronDown, ChevronRight, Edit3, Trash2, FileText, Video, 
  Download, HelpCircle, GripVertical, Copy, Eye, Code, Type, Image as ImageIcon, 
  Music, CheckCircle2, Save, RefreshCw, Sparkles, PlusCircle, AlertCircle, File
} from 'lucide-react';
import { QuizBuilder } from './QuizBuilder';

interface ModuleLessonManagerProps {
  course: Course;
  onOpenQuizBuilder: (lesson: Lesson) => void;
}

export function ModuleLessonManager({ course, onOpenQuizBuilder }: ModuleLessonManagerProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [lessonsMap, setLessonsMap] = useState<{ [moduleId: string]: Lesson[] }>({});
  const [expandedModules, setExpandedModules] = useState<{ [modId: string]: boolean }>({});
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Content Blocks state for the currently selected lesson
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [expandedBlocks, setExpandedBlocks] = useState<{ [blockId: string]: boolean }>({});
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);
  const [activeLessonTab, setActiveLessonTab] = useState<'blocks' | 'settings'>('blocks');

  // New Module form/modal state
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');

  // Editing Module/Lesson inline state
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState('');
  const [editingModuleDesc, setEditingModuleDesc] = useState('');

  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editingLessonTitle, setEditingLessonTitle] = useState('');
  const [editingLessonDesc, setEditingLessonDesc] = useState('');

  // Drag states
  const [draggedModuleId, setDraggedModuleId] = useState<string | null>(null);
  const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null);
  const [draggedLessonSourceModId, setDraggedLessonSourceModId] = useState<string | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);

  // Lesson status & Auto-save
  const [lessonAutoSaveStatus, setLessonAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lessonLastSavedTime, setLessonLastSavedTime] = useState<string>(new Date().toLocaleTimeString());

  // Block preview status
  const [blockPreviews, setBlockPreviews] = useState<{ [blockId: string]: boolean }>({});

  useEffect(() => {
    fetchModules();
  }, [course.id]);

  useEffect(() => {
    if (selectedLesson) {
      fetchContentBlocks(selectedLesson.id);
    } else {
      setContentBlocks([]);
    }
  }, [selectedLesson?.id]);

  const fetchModules = async () => {
    try {
      const res = await fetch(`/api/courses/${course.id}/modules`);
      const data = await res.json();
      setModules(data);

      const exp: { [id: string]: boolean } = { ...expandedModules };
      const lMap: { [id: string]: Lesson[] } = {};
      
      for (const m of data) {
        if (exp[m.id] === undefined) {
          exp[m.id] = true; // Auto-expand newly loaded modules
        }
        const lRes = await fetch(`/api/modules/${m.id}/lessons`);
        lMap[m.id] = await lRes.json();
      }
      
      setExpandedModules(exp);
      setLessonsMap(lMap);

      if (data.length > 0 && !selectedLesson) {
        // Pick the very first lesson to show by default
        const firstMod = data[0];
        if (lMap[firstMod.id]?.length > 0) {
          setSelectedLesson(lMap[firstMod.id][0]);
        }
      }
    } catch (e) {
      console.error('Error fetching modules/lessons:', e);
    }
  };

  const fetchContentBlocks = async (lessonId: string) => {
    setIsLoadingBlocks(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/content-blocks`);
      if (res.ok) {
        const data = await res.json();
        const sorted = data.sort((a: any, b: any) => (a.orderNumber || 0) - (b.orderNumber || 0));
        setContentBlocks(sorted);
        // Default collapse blocks, expand only first
        const exp: { [id: string]: boolean } = {};
        sorted.forEach((b: ContentBlock, idx: number) => {
          exp[b.id] = idx === 0;
        });
        setExpandedBlocks(exp);
      }
    } catch (e) {
      console.error('Error fetching content blocks:', e);
    } finally {
      setIsLoadingBlocks(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Module Actions
  // ---------------------------------------------------------------------------
  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    try {
      const res = await fetch(`/api/courses/${course.id}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newModuleTitle, description: newModuleDesc })
      });
      if (res.ok) {
        setNewModuleTitle('');
        setNewModuleDesc('');
        setIsAddingModule(false);
        fetchModules();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartEditingModule = (mod: Module) => {
    setEditingModuleId(mod.id);
    setEditingModuleTitle(mod.title);
    setEditingModuleDesc(mod.description || '');
  };

  const handleSaveModuleRename = async (modId: string) => {
    if (!editingModuleTitle.trim()) return;
    try {
      const res = await fetch(`/api/modules/${modId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingModuleTitle, description: editingModuleDesc })
      });
      if (res.ok) {
        setEditingModuleId(null);
        fetchModules();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicateModule = async (modId: string) => {
    setLessonAutoSaveStatus('saving');
    try {
      const res = await fetch(`/api/modules/${modId}/duplicate`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchModules();
        setLessonAutoSaveStatus('saved');
        setLessonLastSavedTime(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteModule = async (modId: string) => {
    if (!confirm('Are you sure you want to delete this module and all of its nested lessons? This cannot be undone.')) return;
    await fetch(`/api/modules/${modId}`, { method: 'DELETE' });
    fetchModules();
  };

  // ---------------------------------------------------------------------------
  // Lesson Actions
  // ---------------------------------------------------------------------------
  const handleCreateLesson = async (moduleId: string) => {
    const title = prompt('Enter Lesson Title:');
    if (!title || !title.trim()) return;
    try {
      const res = await fetch(`/api/modules/${moduleId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: 'New interactive course lesson module.',
          lessonContent: `# ${title}\n\nAdd details to your content blocks here...`,
          estimatedTime: '20 mins'
        })
      });
      if (res.ok) {
        const created = await res.json();
        await fetchModules();
        setSelectedLesson(created);
        setActiveLessonTab('blocks');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartEditingLesson = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setEditingLessonTitle(lesson.title);
    setEditingLessonDesc(lesson.description || '');
  };

  const handleSaveLessonRename = async (lessonId: string) => {
    if (!editingLessonTitle.trim()) return;
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingLessonTitle, description: editingLessonDesc })
      });
      if (res.ok) {
        setEditingLessonId(null);
        await fetchModules();
        if (selectedLesson?.id === lessonId) {
          setSelectedLesson(prev => prev ? { ...prev, title: editingLessonTitle, description: editingLessonDesc } : null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicateLesson = async (lessonId: string) => {
    setLessonAutoSaveStatus('saving');
    try {
      const res = await fetch(`/api/lessons/${lessonId}/duplicate`, {
        method: 'POST'
      });
      if (res.ok) {
        const duplicated = await res.json();
        await fetchModules();
        setSelectedLesson(duplicated);
        setLessonAutoSaveStatus('saved');
        setLessonLastSavedTime(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson? All its custom blocks and quizzes will be removed.')) return;
    await fetch(`/api/lessons/${lessonId}`, { method: 'DELETE' });
    if (selectedLesson?.id === lessonId) setSelectedLesson(null);
    fetchModules();
  };

  const handleUpdateLessonMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLesson) return;
    setLessonAutoSaveStatus('saving');
    try {
      const res = await fetch(`/api/lessons/${selectedLesson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedLesson)
      });
      if (res.ok) {
        setLessonAutoSaveStatus('saved');
        setLessonLastSavedTime(new Date().toLocaleTimeString());
        fetchModules();
      } else {
        setLessonAutoSaveStatus('unsaved');
      }
    } catch (e) {
      console.error(e);
      setLessonAutoSaveStatus('unsaved');
    }
  };

  // ---------------------------------------------------------------------------
  // Drag & Drop Handlers - Modules & Lessons reordering
  // ---------------------------------------------------------------------------
  const handleReorderModules = async (draggedId: string, targetId: string) => {
    const draggedIdx = modules.findIndex(m => m.id === draggedId);
    const targetIdx = modules.findIndex(m => m.id === targetId);
    if (draggedIdx === -1 || targetIdx === -1) return;

    const updatedModules = [...modules];
    const [removed] = updatedModules.splice(draggedIdx, 1);
    updatedModules.splice(targetIdx, 0, removed);

    // Optimistic UI state update
    setModules(updatedModules);

    try {
      const res = await fetch(`/api/courses/${course.id}/modules/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleIds: updatedModules.map(m => m.id) })
      });
      if (res.ok) {
        setLessonLastSavedTime(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error('Error reordering modules on server:', e);
    }
  };

  const handleReorderLessons = async (
    lessonId: string,
    sourceModId: string,
    targetModId: string,
    targetLessonId: string | null
  ) => {
    // Get full source list and target list
    const sourceList = [...(lessonsMap[sourceModId] || [])];
    let targetList = sourceModId === targetModId ? sourceList : [...(lessonsMap[targetModId] || [])];

    const lessonObj = sourceList.find(l => l.id === lessonId);
    if (!lessonObj) return;

    // Remove from source list
    const cleanSource = sourceList.filter(l => l.id !== lessonId);

    // Insert into target list
    let cleanTarget = targetList.filter(l => l.id !== lessonId);
    if (targetLessonId) {
      const targetIdx = cleanTarget.findIndex(l => l.id === targetLessonId);
      cleanTarget.splice(targetIdx, 0, lessonObj);
    } else {
      cleanTarget.push(lessonObj);
    }

    // Optimistically update mapping state
    const updatedMap = {
      ...lessonsMap,
      [sourceModId]: cleanSource,
    };
    if (sourceModId !== targetModId) {
      updatedMap[targetModId] = cleanTarget;
    } else {
      updatedMap[sourceModId] = cleanTarget;
    }
    setLessonsMap(updatedMap);

    try {
      // Reorder on target module
      await fetch(`/api/modules/${targetModId}/lessons/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonIds: cleanTarget.map(l => l.id) })
      });

      // If moved across modules, also reorder source module
      if (sourceModId !== targetModId) {
        await fetch(`/api/modules/${sourceModId}/lessons/reorder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonIds: cleanSource.map(l => l.id) })
        });
      }

      setLessonLastSavedTime(new Date().toLocaleTimeString());
      fetchModules();
    } catch (e) {
      console.error('Error reordering lessons:', e);
    }
  };

  // ---------------------------------------------------------------------------
  // Content Block CRUD Operations
  // ---------------------------------------------------------------------------
  const handleAddBlock = async (type: ContentBlockType) => {
    if (!selectedLesson) return;
    setLessonAutoSaveStatus('saving');

    let defaultData: any = {};
    if (type === 'Video') {
      defaultData = { videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'Interactive Video Lecture', duration: '12 mins' };
    } else if (type === 'Markdown') {
      defaultData = { markdown: '### Core Instructional Material\nWrite raw instructional details here.' };
    } else if (type === 'Rich Text') {
      defaultData = { html: '<h2>Important Formulas & Principles</h2><p>Provide a rich styled text section here.</p>' };
    } else if (type === 'Image') {
      defaultData = { imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80', altText: 'Course Visual Illustration', caption: 'Figure 1: Conceptual overview diagram.' };
    } else if (type === 'Audio') {
      defaultData = { audioUrl: '', title: 'Instructional Podcast Session', duration: '8 mins' };
    } else if (type === 'PDF') {
      defaultData = { pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'Academic Case Study PDF File' };
    } else if (type === 'Download') {
      defaultData = { name: 'Reference_Financial_Model.xlsx', url: '#', fileSize: '2.5 MB' };
    } else if (type === 'Assignment') {
      defaultData = { title: 'Practical Hands-on Exercise Challenge', description: 'Analyze the subsidiary data and model a 5-year sweep process.', maxPoints: 100 };
    } else if (type === 'Quiz') {
      defaultData = { title: 'Review Assessment Exam Quiz' };
    }

    try {
      const res = await fetch(`/api/lessons/${selectedLesson.id}/content-blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, contentData: defaultData })
      });
      if (res.ok) {
        const block = await res.json();
        setContentBlocks(prev => [...prev, block]);
        setExpandedBlocks(prev => ({ ...prev, [block.id]: true }));
        setLessonAutoSaveStatus('saved');
        setLessonLastSavedTime(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error(e);
      setLessonAutoSaveStatus('unsaved');
    }
  };

  const handleUpdateBlockData = async (blockId: string, updatedData: any) => {
    setLessonAutoSaveStatus('saving');
    try {
      const res = await fetch(`/api/content-blocks/${blockId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentData: updatedData })
      });
      if (res.ok) {
        const updated = await res.json();
        setContentBlocks(prev => prev.map(b => b.id === blockId ? updated : b));
        setLessonAutoSaveStatus('saved');
        setLessonLastSavedTime(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error('Error auto-saving block data:', e);
      setLessonAutoSaveStatus('unsaved');
    }
  };

  const handleDuplicateBlock = async (block: ContentBlock) => {
    setLessonAutoSaveStatus('saving');
    try {
      const res = await fetch(`/api/lessons/${selectedLesson?.id}/content-blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: block.type,
          contentData: { ...block.contentData, title: block.contentData.title ? `${block.contentData.title} (Copy)` : undefined }
        })
      });
      if (res.ok) {
        const created = await res.json();
        setContentBlocks(prev => [...prev, created]);
        setExpandedBlocks(prev => ({ ...prev, [created.id]: true }));
        setLessonAutoSaveStatus('saved');
        setLessonLastSavedTime(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (!confirm('Remove this content block?')) return;
    setLessonAutoSaveStatus('saving');
    try {
      const res = await fetch(`/api/content-blocks/${blockId}`, { method: 'DELETE' });
      if (res.ok) {
        setContentBlocks(prev => prev.filter(b => b.id !== blockId));
        setLessonAutoSaveStatus('saved');
        setLessonLastSavedTime(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ---------------------------------------------------------------------------
  // Content Block Drag & Drop reordering
  // ---------------------------------------------------------------------------
  const handleReorderBlocks = async (draggedId: string, targetId: string) => {
    const draggedIdx = contentBlocks.findIndex(b => b.id === draggedId);
    const targetIdx = contentBlocks.findIndex(b => b.id === targetId);
    if (draggedIdx === -1 || targetIdx === -1) return;

    const updated = [...contentBlocks];
    const [removed] = updated.splice(draggedIdx, 1);
    updated.splice(targetIdx, 0, removed);

    setContentBlocks(updated);

    try {
      const res = await fetch(`/api/lessons/${selectedLesson?.id}/content-blocks/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockIds: updated.map(b => b.id) })
      });
      if (res.ok) {
        setLessonLastSavedTime(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error('Error reordering blocks on server:', e);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT COLUMN: Curriculum Visual Drag Tree */}
      <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Course Architect</h3>
            <p className="text-[10px] text-slate-400 font-medium">Drag modules and lessons to structure curriculum.</p>
          </div>
          <button
            onClick={() => setIsAddingModule(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Module</span>
          </button>
        </div>

        {/* Create Module inline */}
        {isAddingModule && (
          <form onSubmit={handleCreateModule} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">New Module Outline</h4>
            <input
              type="text"
              placeholder="Module Title (e.g. Portfolio Hedging)"
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
              required
            />
            <textarea
              placeholder="Short learning description..."
              value={newModuleDesc}
              onChange={(e) => setNewModuleDesc(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
              rows={2}
            />
            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingModule(false)}
                className="px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Create Module
              </button>
            </div>
          </form>
        )}

        {/* Draggable Module & Lesson Hierarchy */}
        <div className="space-y-4">
          {modules.map((mod, modIdx) => (
            <div
              key={mod.id}
              draggable
              onDragStart={(e) => {
                setDraggedModuleId(mod.id);
                e.dataTransfer.setData('text/plain', `module:${mod.id}`);
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                const data = e.dataTransfer.getData('text/plain');
                if (data.startsWith('module:')) {
                  const draggedId = data.split(':')[1];
                  if (draggedId !== mod.id) {
                    handleReorderModules(draggedId, mod.id);
                  }
                } else if (data.startsWith('lesson:')) {
                  const parts = data.split(':');
                  const draggedLId = parts[1];
                  const sourceModId = parts[2];
                  handleReorderLessons(draggedLId, sourceModId, mod.id, null);
                }
                setDraggedModuleId(null);
                setDraggedLessonId(null);
              }}
              className={`border rounded-xl transition-all duration-200 bg-slate-50/50 ${
                draggedModuleId === mod.id ? 'opacity-40 scale-[0.98] border-dashed border-indigo-400' : 'border-slate-200'
              }`}
            >
              {/* Module Header card */}
              <div className="p-3.5 bg-white border-b border-slate-200 rounded-t-xl flex items-center justify-between group">
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  <div className="cursor-grab text-slate-300 hover:text-indigo-600 transition-colors p-0.5 shrink-0">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  
                  <div
                    onClick={() => setExpandedModules(prev => ({ ...prev, [mod.id]: !prev[mod.id] }))}
                    className="flex items-center space-x-1.5 cursor-pointer min-w-0 flex-1"
                  >
                    {expandedModules[mod.id] ? (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    
                    {editingModuleId === mod.id ? (
                      <div className="space-y-2 w-full pr-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingModuleTitle}
                          onChange={(e) => setEditingModuleTitle(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-900 font-bold focus:bg-white"
                          autoFocus
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSaveModuleRename(mod.id); }}
                        />
                        <input
                          type="text"
                          value={editingModuleDesc}
                          onChange={(e) => setEditingModuleDesc(e.target.value)}
                          placeholder="Module short description"
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-600 focus:bg-white"
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSaveModuleRename(mod.id); }}
                        />
                        <div className="flex space-x-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setEditingModuleId(null)}
                            className="px-2 py-1 text-[10px] bg-slate-200 rounded text-slate-700 font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveModuleRename(mod.id)}
                            className="px-2 py-1 text-[10px] bg-indigo-600 rounded text-white font-semibold cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="truncate pr-1">
                        <span className="font-extrabold text-slate-900 text-xs tracking-tight block truncate">
                          M{modIdx + 1}: {mod.title}
                        </span>
                        {mod.description && (
                          <span className="text-[10px] text-slate-400 font-medium block truncate mt-0.5 leading-normal">
                            {mod.description}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Module Quick Actions */}
                {editingModuleId !== mod.id && (
                  <div className="flex items-center space-x-1 shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCreateLesson(mod.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                      title="Add Lesson to Module"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleStartEditingModule(mod)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                      title="Rename Module"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicateModule(mod.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                      title="Duplicate Module"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteModule(mod.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                      title="Delete Module Outline"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Nested lessons (Droppable container) */}
              {expandedModules[mod.id] && (
                <div className="p-2 space-y-1.5">
                  {(lessonsMap[mod.id] || []).map((lesson, lesIdx) => (
                    <div
                      key={lesson.id}
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation();
                        setDraggedLessonId(lesson.id);
                        setDraggedLessonSourceModId(mod.id);
                        e.dataTransfer.setData('text/plain', `lesson:${lesson.id}:${mod.id}`);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const data = e.dataTransfer.getData('text/plain');
                        if (data.startsWith('lesson:')) {
                          const parts = data.split(':');
                          const draggedLId = parts[1];
                          const sourceModId = parts[2];
                          handleReorderLessons(draggedLId, sourceModId, mod.id, lesson.id);
                        }
                        setDraggedLessonId(null);
                        setDraggedLessonSourceModId(null);
                      }}
                      onClick={() => {
                        setSelectedLesson(lesson);
                        setActiveLessonTab('blocks');
                      }}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all duration-150 group/lesson ${
                        selectedLesson?.id === lesson.id
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-150'
                      } ${
                        draggedLessonId === lesson.id ? 'opacity-35 scale-[0.97]' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                        <div className={`shrink-0 cursor-grab ${selectedLesson?.id === lesson.id ? 'text-indigo-200' : 'text-slate-300'}`}>
                          <GripVertical className="w-3.5 h-3.5" />
                        </div>

                        {editingLessonId === lesson.id ? (
                          <div className="space-y-2 w-full" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editingLessonTitle}
                              onChange={(e) => setEditingLessonTitle(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-950 font-semibold focus:bg-white"
                              autoFocus
                              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveLessonRename(lesson.id); }}
                            />
                            <div className="flex justify-end space-x-1.5 pt-0.5">
                              <button
                                type="button"
                                onClick={() => setEditingLessonId(null)}
                                className="px-2 py-1 text-[10px] bg-slate-200 rounded text-slate-700 font-bold cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveLessonRename(lesson.id)}
                                className="px-2 py-1 text-[10px] bg-indigo-600 rounded text-white font-bold cursor-pointer"
                              >
                                Rename
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="truncate">
                            <span className="font-extrabold block truncate">
                              {lesIdx + 1}. {lesson.title}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Lesson Quick Actions */}
                      {editingLessonId !== lesson.id && (
                        <div className="flex items-center space-x-1 shrink-0">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 mr-1 whitespace-nowrap ${
                            selectedLesson?.id === lesson.id ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {lesson.estimatedTime || '20m'}
                          </span>

                          <div className="hidden group-hover/lesson:flex items-center space-x-0.5 shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStartEditingLesson(lesson); }}
                              className={`p-0.5 rounded transition-all ${selectedLesson?.id === lesson.id ? 'text-indigo-200 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
                              title="Rename Lesson"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDuplicateLesson(lesson.id); }}
                              className={`p-0.5 rounded transition-all ${selectedLesson?.id === lesson.id ? 'text-indigo-200 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
                              title="Duplicate Lesson"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson.id); }}
                              className={`p-0.5 rounded transition-all ${selectedLesson?.id === lesson.id ? 'text-indigo-200 hover:text-rose-100' : 'text-slate-400 hover:text-rose-600'}`}
                              title="Delete Lesson Outline"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Empty state lesson placeholder */}
                  {(!lessonsMap[mod.id] || lessonsMap[mod.id].length === 0) && (
                    <div className="text-center py-4 border border-dashed border-slate-200 rounded-lg text-[10px] text-slate-400 font-semibold bg-white">
                      No lessons inside module.
                    </div>
                  )}

                  <button
                    onClick={() => handleCreateLesson(mod.id)}
                    className="w-full py-2 border border-dashed border-slate-200 rounded-xl text-[10px] font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-400 transition-colors bg-white/50 cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add New Lesson Block</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {modules.length === 0 && (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-semibold">
              No modules created yet. Click "Add Module" outline to begin.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Visual Content Blocks Designer & Lesson Details */}
      <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs min-h-[75vh]">
        {selectedLesson ? (
          <div className="space-y-6">
            {/* Selected Lesson Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
              <div>
                <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest">Interactive Lesson Canvas</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{selectedLesson.title}</h3>
                {selectedLesson.description && <p className="text-xs text-slate-400 mt-1 font-medium">{selectedLesson.description}</p>}
              </div>

              {/* Status and Actions Row */}
              <div className="flex items-center space-x-2 shrink-0">
                {/* Save status badge */}
                <div className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg shrink-0">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    lessonAutoSaveStatus === 'saving' ? 'bg-amber-500 animate-pulse' : lessonAutoSaveStatus === 'saved' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`} />
                  <span>
                    {lessonAutoSaveStatus === 'saving' && 'Auto-saving...'}
                    {lessonAutoSaveStatus === 'saved' && `Synced (${lessonLastSavedTime})`}
                    {lessonAutoSaveStatus === 'unsaved' && 'Unsaved'}
                  </span>
                </div>

                <button
                  onClick={() => onOpenQuizBuilder(selectedLesson)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Course Quiz</span>
                </button>
              </div>
            </div>

            {/* Sub Tabs */}
            <div className="flex items-center space-x-1 border-b border-slate-100 pb-2">
              <button
                onClick={() => setActiveLessonTab('blocks')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeLessonTab === 'blocks'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-transparent text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Visual Lesson Blocks ({contentBlocks.length})</span>
              </button>
              <button
                onClick={() => setActiveLessonTab('settings')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeLessonTab === 'settings'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-transparent text-slate-500 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Metadata Settings</span>
              </button>
            </div>

            {/* TAB CONTENT: Metadata Settings */}
            {activeLessonTab === 'settings' && (
              <form onSubmit={handleUpdateLessonMetadata} className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Lesson Title</label>
                    <input
                      type="text"
                      value={selectedLesson.title}
                      onChange={(e) => setSelectedLesson({ ...selectedLesson, title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Duration</label>
                    <input
                      type="text"
                      value={selectedLesson.estimatedTime}
                      onChange={(e) => setSelectedLesson({ ...selectedLesson, estimatedTime: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Short Description</label>
                  <input
                    type="text"
                    value={selectedLesson.description || ''}
                    onChange={(e) => setSelectedLesson({ ...selectedLesson, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Fallback Video URL</label>
                    <input
                      type="text"
                      value={selectedLesson.videoUrl || ''}
                      onChange={(e) => setSelectedLesson({ ...selectedLesson, videoUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Practical Assignment Prompt</label>
                    <input
                      type="text"
                      value={selectedLesson.exercisePrompt || ''}
                      onChange={(e) => setSelectedLesson({ ...selectedLesson, exercisePrompt: e.target.value })}
                      placeholder="e.g. Build sweep model..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Save Metadata Changes
                  </button>
                </div>
              </form>
            )}

            {/* TAB CONTENT: Visual Lesson Blocks */}
            {activeLessonTab === 'blocks' && (
              <div className="space-y-6">
                {/* Blocks list (Draggable blocks inside lesson) */}
                <div className="space-y-4">
                  {isLoadingBlocks ? (
                    <div className="flex flex-col items-center justify-center py-16 space-y-2">
                      <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin" />
                      <span className="text-xs text-slate-500 font-bold">Synchronizing interactive canvas...</span>
                    </div>
                  ) : contentBlocks.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-slate-50/20 space-y-3">
                      <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
                      <h4 className="text-xs font-extrabold text-slate-700">Interactive Content Canvas is Empty</h4>
                      <p className="text-[10px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                        Add rich instructional units below like Video lectures, Markdown scripts, audio podcasts, and interactive homework challenges.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {contentBlocks.map((block, bIdx) => {
                        const isExpanded = !!expandedBlocks[block.id];
                        const isPreview = !!blockPreviews[block.id];
                        
                        return (
                          <div
                            key={block.id}
                            draggable
                            onDragStart={(e) => {
                              setDraggedBlockId(block.id);
                              e.dataTransfer.setData('text/plain', `block:${block.id}`);
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              const data = e.dataTransfer.getData('text/plain');
                              if (data.startsWith('block:')) {
                                const draggedId = data.split(':')[1];
                                if (draggedId !== block.id) {
                                  handleReorderBlocks(draggedId, block.id);
                                }
                              }
                              setDraggedBlockId(null);
                            }}
                            className={`border rounded-2xl bg-white shadow-2xs transition-all duration-200 ${
                              draggedBlockId === block.id ? 'opacity-35 scale-[0.98] border-dashed border-indigo-400' : 'border-slate-200'
                            }`}
                          >
                            {/* Block Top Header */}
                            <div className="p-3 bg-slate-50 border-b border-slate-200 rounded-t-2xl flex items-center justify-between group/block">
                              <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                                <div className="cursor-grab text-slate-300 hover:text-indigo-600 transition-colors shrink-0">
                                  <GripVertical className="w-4 h-4" />
                                </div>

                                <div
                                  onClick={() => setExpandedBlocks(prev => ({ ...prev, [block.id]: !isExpanded }))}
                                  className="flex items-center space-x-2 cursor-pointer min-w-0 flex-1"
                                >
                                  {/* Type Badge Icon */}
                                  <div className={`p-1.5 rounded-lg shrink-0 ${
                                    block.type === 'Video' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                    block.type === 'Markdown' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                                    block.type === 'Rich Text' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                    block.type === 'Image' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                    block.type === 'Audio' ? 'bg-cyan-50 text-cyan-600 border border-cyan-100' :
                                    block.type === 'PDF' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                    block.type === 'Download' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                    block.type === 'Assignment' ? 'bg-violet-50 text-violet-600 border border-violet-100' :
                                    'bg-purple-50 text-purple-600 border border-purple-100'
                                  }`}>
                                    {block.type === 'Video' && <Video className="w-3.5 h-3.5" />}
                                    {block.type === 'Markdown' && <Code className="w-3.5 h-3.5" />}
                                    {block.type === 'Rich Text' && <Type className="w-3.5 h-3.5" />}
                                    {block.type === 'Image' && <ImageIcon className="w-3.5 h-3.5" />}
                                    {block.type === 'Audio' && <Music className="w-3.5 h-3.5" />}
                                    {block.type === 'PDF' && <FileText className="w-3.5 h-3.5" />}
                                    {block.type === 'Download' && <Download className="w-3.5 h-3.5" />}
                                    {block.type === 'Assignment' && <File className="w-3.5 h-3.5" />}
                                    {block.type === 'Quiz' && <HelpCircle className="w-3.5 h-3.5" />}
                                  </div>

                                  <div className="truncate pr-4">
                                    <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-widest leading-none">
                                      Block {bIdx + 1} • {block.type}
                                    </span>
                                    <span className="text-xs font-extrabold text-slate-800 truncate block mt-1 leading-tight">
                                      {block.contentData.title || block.contentData.name || (block.type === 'Markdown' ? 'Markdown Core Script' : 'Rich Instructional Element')}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Block control buttons */}
                              <div className="flex items-center space-x-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setBlockPreviews(prev => ({ ...prev, [block.id]: !isPreview }))}
                                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                    isPreview ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                  }`}
                                  title="Toggle Live Render Preview"
                                >
                                  {isPreview ? 'Back to Editor' : 'Live Preview'}
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => handleDuplicateBlock(block)}
                                  className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
                                  title="Duplicate Content Block"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBlock(block.id)}
                                  className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                                  title="Delete Content Block"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setExpandedBlocks(prev => ({ ...prev, [block.id]: !isExpanded }))}
                                  className="p-1 rounded-md text-slate-400 hover:text-slate-700"
                                >
                                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                              </div>
                            </div>

                            {/* Block Inner Editor/Content Body */}
                            {isExpanded && (
                              <div className="p-4 border-t border-slate-100 space-y-4">
                                {isPreview ? (
                                  /* LIVE RENDER PREVIEW MODE */
                                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 prose max-w-none text-slate-850">
                                    <div className="flex items-center space-x-2 text-[9px] font-bold text-slate-400 border-b border-slate-200 pb-1.5 uppercase tracking-wider">
                                      <Eye className="w-3 h-3" />
                                      <span>Simulated Student Portal Preview (Live Render)</span>
                                    </div>
                                    
                                    {block.type === 'Video' && (
                                      <div className="space-y-2">
                                        <h4 className="font-extrabold text-sm text-slate-900">{block.contentData.title || 'Untitled Video'}</h4>
                                        <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 text-white relative">
                                          <Video className="w-12 h-12 text-slate-600 opacity-60 animate-pulse" />
                                          <span className="absolute bottom-3 right-3 text-[10px] bg-slate-900/80 px-2 py-0.5 rounded-md font-mono">
                                            {block.contentData.duration || '0:00'}
                                          </span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-mono text-center break-all">{block.contentData.videoUrl}</p>
                                      </div>
                                    )}

                                    {block.type === 'Markdown' && (
                                      <div className="text-xs space-y-2 leading-relaxed whitespace-pre-wrap">
                                        {block.contentData.markdown || 'No markdown scripted.'}
                                      </div>
                                    )}

                                    {block.type === 'Rich Text' && (
                                      <div 
                                        className="text-xs space-y-2 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: block.contentData.html || 'No text content.' }}
                                      />
                                    )}

                                    {block.type === 'Image' && (
                                      <div className="space-y-2 text-center">
                                        <img
                                          src={block.contentData.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'}
                                          alt={block.contentData.altText || 'Rendered block visual'}
                                          className="mx-auto max-h-60 rounded-xl object-cover border border-slate-200"
                                          referrerPolicy="no-referrer"
                                        />
                                        {block.contentData.caption && <p className="text-[10px] text-slate-400 italic font-medium">{block.contentData.caption}</p>}
                                      </div>
                                    )}

                                    {block.type === 'Audio' && (
                                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                            <Music className="w-5 h-5" />
                                          </div>
                                          <div>
                                            <p className="font-extrabold text-xs text-slate-800">{block.contentData.title || 'Audio podcast track'}</p>
                                            <p className="text-[9px] text-slate-400 mt-0.5 font-semibold">Playback system online</p>
                                          </div>
                                        </div>
                                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">{block.contentData.duration || '0:00'}</span>
                                      </div>
                                    )}

                                    {block.type === 'PDF' && (
                                      <div className="bg-white p-3 border border-slate-200 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center space-x-2.5">
                                          <FileText className="w-8 h-8 text-orange-600" />
                                          <div>
                                            <p className="font-extrabold text-xs text-slate-800">{block.contentData.title || 'Attached Case PDF'}</p>
                                            <p className="text-[9px] text-slate-400">PDF Reader component embedded</p>
                                          </div>
                                        </div>
                                        <button className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-[10px] cursor-pointer">View PDF Document</button>
                                      </div>
                                    )}

                                    {block.type === 'Download' && (
                                      <div className="bg-indigo-50/50 p-4 border border-indigo-100 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center space-x-3 pr-2 min-w-0">
                                          <Download className="w-5 h-5 text-indigo-600 shrink-0" />
                                          <div className="min-w-0">
                                            <p className="font-extrabold text-xs text-slate-800 truncate">{block.contentData.name || 'Resource attachment'}</p>
                                            <p className="text-[9px] text-slate-400 truncate">{block.contentData.url || '#'}</p>
                                          </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full shrink-0 font-mono">
                                          {block.contentData.fileSize || '1.0 MB'}
                                        </span>
                                      </div>
                                    )}

                                    {block.type === 'Assignment' && (
                                      <div className="p-4 bg-violet-50/50 border border-violet-100 rounded-xl space-y-2">
                                        <div className="flex items-center justify-between">
                                          <h4 className="font-extrabold text-xs text-violet-950 flex items-center gap-1">
                                            <File className="w-3.5 h-3.5 text-violet-600" />
                                            <span>Practical Homework Hand-In Challenge</span>
                                          </h4>
                                          <span className="text-[10px] font-bold bg-violet-100 text-violet-800 px-2 py-0.5 rounded-full font-mono">Max: {block.contentData.maxPoints || 100} Points</span>
                                        </div>
                                        <p className="font-extrabold text-xs text-slate-800 pt-1">{block.contentData.title || 'Homework Exercise'}</p>
                                        <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap">{block.contentData.description || 'No homework details mapped.'}</p>
                                      </div>
                                    )}

                                    {block.type === 'Quiz' && (
                                      <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl text-center space-y-2">
                                        <HelpCircle className="w-8 h-8 text-purple-600 mx-auto" />
                                        <p className="font-extrabold text-xs text-purple-900">{block.contentData.title || 'Lesson Assessment Assessment'}</p>
                                        <p className="text-[10px] text-slate-500">Interactive Student quiz module is integrated in the core student platform portal.</p>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  /* COMPREHENSIVE INTERACTIVE EDIT MODE */
                                  <div className="space-y-4">
                                    {/* Video Editor Fields */}
                                    {block.type === 'Video' && (
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="sm:col-span-2">
                                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Video URL</label>
                                          <input
                                            type="text"
                                            value={block.contentData.videoUrl || ''}
                                            onChange={(e) => handleUpdateBlockData(block.id, { ...block.contentData, videoUrl: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 mt-1 font-mono"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Title</label>
                                          <input
                                            type="text"
                                            value={block.contentData.title || ''}
                                            onChange={(e) => handleUpdateBlockData(block.id, { ...block.contentData, title: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 mt-1"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Duration (Est)</label>
                                          <input
                                            type="text"
                                            value={block.contentData.duration || ''}
                                            onChange={(e) => handleUpdateBlockData(block.id, { ...block.contentData, duration: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 mt-1"
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {/* Markdown Editor Field */}
                                    {block.type === 'Markdown' && (
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Markdown Text Content</label>
                                        <textarea
                                          value={block.contentData.markdown || ''}
                                          onChange={(e) => handleUpdateBlockData(block.id, { ...block.contentData, markdown: e.target.value })}
                                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-mono mt-1 leading-relaxed focus:bg-white focus:ring-1 focus:ring-indigo-500"
                                          rows={8}
                                        />
                                      </div>
                                    )}

                                    {/* Rich Text Editor Field */}
                                    {block.type === 'Rich Text' && (
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase">HTML Content markup</label>
                                        <textarea
                                          value={block.contentData.html || ''}
                                          onChange={(e) => handleUpdateBlockData(block.id, { ...block.contentData, html: e.target.value })}
                                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-mono mt-1 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                                          rows={6}
                                        />
                                      </div>
                                    )}

                                    {/* Image Editor Fields */}
                                    {block.type === 'Image' && (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Image URL Link</label>
                                          <input
                                            type="text"
                                            value={block.contentData.imageUrl || ''}
                                            onChange={(e) => handleUpdateBlockData(block.id, { ...block.contentData, imageUrl: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 mt-1 font-mono"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Alt Text accessibility</label>
                                          <input
                                            type="text"
                                            value={block.contentData.altText || ''}
                                            onChange={(e) => handleUpdateBlockData(block.id, { ...block.contentData, altText: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 mt-1"
                                          />
                                        </div>
                                        <div className="sm:col-span-2">
                                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Image Caption</label>
                                          <input
                                            type="text"
                                            value={block.contentData.caption || ''}
                                            onChange={(e) => handleUpdateBlockData(block.id, { ...block.contentData, caption: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 mt-1"
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {/* Audio Editor Fields */}
                                    {block.type === 'Audio' && (
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="sm:col-span-2">
                                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Audio File Link URL</label>
                                          <input
                                            type="text"
                                            value={block.contentData.audioUrl || ''}
                                            onChange={(e) => handleUpdateBlockData(block.id, { ...block.contentData, audioUrl: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 mt-1 font-mono"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Podcast/Track Title</label>
                                          <input
                                            type="text"
                                            value={block.contentData.title || ''}
                                            onChange={(e) => handleUpdateBlockData(block.id, { ...block.contentData, title: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 mt-1"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Audio Duration</label>
                                          <input
                                            type="text"
                                            value={block.contentData.duration || ''}
                                            onChange={(e) => handleUpdateBlockData(block.id, { ...block.contentData, duration: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 mt-1"
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {/* PDF Editor Fields */}
                                    {block.type === 'PDF' && (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-[10px] font-bold text-slate-500 uppercase">PDF Document Link URL</label>
                                          <input
                                            type="text"
                                            value={block.contentData.pdfUrl || ''}
                                            onChange={(e) => handleUpdateBlockData(block.id, { ...block.contentData, pdfUrl: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 mt-1 font-mono"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Document/Article Title</label>
                                          <input
                                            type="text"
                                            value={block.contentData.title || ''}
                                            onChange={(e) => handleUpdateBlockData(block.id, { ...block.contentData, title: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 mt-1"
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {/* Download Editor Fields */}
                                    {block.type === 'Download' && (
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Attachment Download File Name</label>
                                          <input
                                            type="text"
                                            value={block.contentData.name || ''}
                                            onChange={(e) => handleUpdateBlockData(block.id, { ...block.contentData, name: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 mt-1"
                                          />
                                        </div>
                                        <div className="sm:col-span-2">
                                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Attachment File URL Link</label>
                                          <input
                                            type="text"
                                            value={block.contentData.url || ''}
                                            onChange={(e) => handleUpdateBlockData(block.id, { ...block.contentData, url: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 mt-1 font-mono"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] font-bold text-slate-500 uppercase">File Size details</label>
                                          <input
                                            type="text"
                                            value={block.contentData.fileSize || ''}
                                            onChange={(e) => handleUpdateBlockData(block.id, { ...block.contentData, fileSize: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 mt-1 font-mono"
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {/* Assignment Editor Fields */}
                                    {block.type === 'Assignment' && (
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                          <div className="sm:col-span-2">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Practical Homework Title</label>
                                            <input
                                              type="text"
                                              value={block.contentData.title || ''}
                                              onChange={(e) => handleUpdateBlockData(block.id, { ...block.contentData, title: e.target.value })}
                                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 mt-1"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Max grading Points</label>
                                            <input
                                              type="number"
                                              value={block.contentData.maxPoints || 100}
                                              onChange={(e) => handleUpdateBlockData(block.id, { ...block.contentData, maxPoints: parseInt(e.target.value) || 100 })}
                                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 mt-1"
                                            />
                                          </div>
                                        </div>
                                        <div>
                                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Homework prompt/details instruction</label>
                                          <textarea
                                            value={block.contentData.description || ''}
                                            onChange={(e) => handleUpdateBlockData(block.id, { ...block.contentData, description: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 mt-1 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                                            rows={4}
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {/* Quiz Editor Field */}
                                    {block.type === 'Quiz' && (
                                      <div className="p-4 bg-purple-50/40 border border-purple-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="space-y-1 text-center sm:text-left">
                                          <h4 className="font-extrabold text-xs text-purple-900">{block.contentData.title || 'Lesson Assessment Assessment'}</h4>
                                          <p className="text-[10px] text-slate-500">Edit exam questions and passing parameters using the modular builder.</p>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2 shrink-0">
                                          <input
                                            type="text"
                                            value={block.contentData.title || ''}
                                            onChange={(e) => handleUpdateBlockData(block.id, { ...block.contentData, title: e.target.value })}
                                            placeholder="Quiz Title"
                                            className="bg-white border border-purple-200 rounded px-2 py-1.5 text-xs text-purple-900"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => onOpenQuizBuilder(selectedLesson)}
                                            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
                                          >
                                            Build Quiz
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Floating Bottom Quick Block Adder tool */}
                <div className="pt-6 border-t border-slate-100 space-y-3">
                  <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Append Interactive Element</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {([
                      { type: 'Video', icon: <Video className="w-3.5 h-3.5 text-rose-600" /> },
                      { type: 'Markdown', icon: <Code className="w-3.5 h-3.5 text-indigo-600" /> },
                      { type: 'Rich Text', icon: <Type className="w-3.5 h-3.5 text-amber-600" /> },
                      { type: 'Image', icon: <ImageIcon className="w-3.5 h-3.5 text-emerald-600" /> },
                      { type: 'Audio', icon: <Music className="w-3.5 h-3.5 text-cyan-600" /> },
                      { type: 'PDF', icon: <FileText className="w-3.5 h-3.5 text-orange-600" /> },
                      { type: 'Download', icon: <Download className="w-3.5 h-3.5 text-blue-600" /> },
                      { type: 'Assignment', icon: <File className="w-3.5 h-3.5 text-violet-600" /> },
                      { type: 'Quiz', icon: <HelpCircle className="w-3.5 h-3.5 text-purple-600" /> }
                    ] as const).map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => handleAddBlock(item.type)}
                        className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl text-[11px] font-bold text-slate-700 flex flex-col items-center justify-center space-y-1.5 transition-all text-center hover:shadow-2xs cursor-pointer"
                      >
                        {item.icon}
                        <span>{item.type}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty selection state */
          <div className="text-center py-24 space-y-4 max-w-sm mx-auto">
            <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 mx-auto shadow-2xs">
              <FileText className="w-8 h-8" />
            </div>
            <h4 className="text-base font-extrabold text-slate-700">No Active Lesson Selected</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Select an educational lesson from the curriculum outline tree on the left panel to load blocks, video elements, markdown content, and assignments.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
