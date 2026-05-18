import React, { useState, useEffect } from 'react';
import { getTaskMentorRoadmap, onboardTaskMentor, deleteTaskMentorRoadmap } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Loader2, PlusCircle, CheckCircle, Map, RefreshCcw, 
  Terminal, Code, BookOpen, Cpu, Layout, Layers, 
  Circle, ChevronRight, Check
} from 'lucide-react';

const Roadmap = () => {
  const { user, login } = useAuth();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [regenData, setRegenData] = useState({
    goal: user?.goal || '',
    level: user?.level || 'Beginner'
  });

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      const res = await getTaskMentorRoadmap();
      setRoadmap(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async (e) => {
    if (e) e.preventDefault();
    setGenerating(true);
    try {
      const res = await onboardTaskMentor({
        goal: regenData.goal,
        level: regenData.level,
        daily_time: user.daily_time || 60
      });
      
      if (res.data) {
        setRoadmap(res.data.roadmap); // Backend returns roadmap in onboarding res now? 
        // Actually backend returns { message, user }. Let's refetch.
        await fetchRoadmap();
        if (res.data.user) login(res.data.user);
        setShowRegenModal(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to regenerate roadmap");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteRoadmap = async () => {
    if (!window.confirm("Are you sure you want to delete this roadmap and all progress? This action cannot be undone.")) return;
    
    setLoading(true);
    try {
      const res = await deleteTaskMentorRoadmap();
      alert(res.data.message);
      // Update local user state
      const updatedUser = { ...user, mentor_onboarded: false };
      login(updatedUser);
      // Redirect to dashboard (handled by the fact that mentor_onboarded is false)
      window.location.href = '/mentor'; 
    } catch (err) {
      console.error(err);
      alert("Failed to delete roadmap");
    } finally {
      setLoading(false);
    }
  };

  const getSubtaskIcon = (text) => {
    const t = text.toLowerCase();
    if (t.includes('install') || t.includes('npm') || t.includes('setup')) return <Terminal className="w-3.5 h-3.5" />;
    if (t.includes('component') || t.includes('jsx') || t.includes('code')) return <Code className="w-3.5 h-3.5" />;
    if (t.includes('structure') || t.includes('folder')) return <Layers className="w-3.5 h-3.5" />;
    if (t.includes('state') || t.includes('hook') || t.includes('props')) return <Cpu className="w-3.5 h-3.5" />;
    return <BookOpen className="w-3.5 h-3.5" />;
  };

  if (loading) return <div className="flex justify-center mt-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  return (
    <div className="space-y-6">
      {!roadmap || !roadmap.weeks || roadmap.weeks.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-inner animate-in fade-in zoom-in duration-500">
           <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
             <Map className="w-8 h-8 text-blue-500" />
           </div>
           <h3 className="text-xl font-bold text-gray-900 dark:text-white">Determine Your Path</h3>
           <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
             Our AI will architect a 4-week mastery map for: <span className="font-bold text-gray-900 dark:text-white">"{user.goal}"</span>.
           </p>
           <button
             onClick={() => setShowRegenModal(true)}
             disabled={generating}
             className="inline-flex items-center px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
           >
             {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlusCircle className="w-4 h-4 mr-2" />}
             {generating ? "Architecting..." : "Generate Mastery Map"}
           </button>
        </div>
      ) : (
        <div className="space-y-6 relative animate-in fade-in transition-all duration-700">
          {/* Header - Professionally Responsive */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm gap-3">
             <div className="flex items-center gap-3 w-full sm:w-auto">
               <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
                 <Map className="w-4 h-4 sm:w-5 sm:h-5" />
               </div>
               <div className="min-w-0">
                 <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white tracking-tight">Mastery Journey</h3>
                 <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">TARGET: {user.goal}</p>
               </div>
             </div>
             
             <div className="flex items-center gap-2 w-full sm:w-auto">
               <button
                 onClick={() => setShowRegenModal(true)}
                 disabled={generating}
                 className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-gray-300 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center"
               >
                 <RefreshCcw className="w-3 h-3 mr-1.5" />
                 Regenerate
               </button>
               <button
                 onClick={handleDeleteRoadmap}
                 className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] sm:text-[11px] font-bold text-red-500 border border-red-100 dark:border-red-900/30 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center"
               >
                 Delete Map
               </button>
             </div>
          </div>

          <div className="relative ml-2 sm:ml-8 border-l-2 border-indigo-100 dark:border-indigo-900/50 space-y-8 py-1">
            {roadmap.weeks.map((week, idx) => (
              <div key={idx} className="relative pl-6 sm:pl-10">
                {/* Week Indicator */}
                <div className="absolute -left-[16px] sm:-left-[19px] top-0 w-8 h-8 sm:w-9 sm:h-9 bg-white dark:bg-gray-900 rounded-full border-2 border-indigo-600 ring-4 ring-indigo-50 dark:ring-indigo-900/20 flex items-center justify-center font-black text-xs sm:text-sm text-indigo-600 shadow-sm z-10">
                  {week.week_number}
                </div>
                
                <h4 className="text-xs sm:text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4 pt-1.5 sm:pt-2">
                   {week.title}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {week.topics?.map((topic, i) => (
                    <div key={i} className="relative">

                      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden border-l-4 sm:border-l-[6px] border-l-indigo-400 p-3 sm:p-5 hover:shadow-md transition-shadow">
                        <h5 className="text-sm sm:text-base font-black text-gray-900 dark:text-white mb-1">
                          {topic.title}
                        </h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                          {topic.description}
                        </p>

                        {/* Subtask Checklist */}
                        {topic.subtasks && topic.subtasks.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-gray-50 dark:border-gray-800/50">
                            {topic.subtasks.map((sub, sidx) => (
                              <div key={sidx} className="flex items-start gap-2.5 group/item">
                                <div className="shrink-0 mt-0.5">
                                  <Circle className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
                                </div>
                                <div className="p-1 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-500 dark:text-gray-400">
                                  {getSubtaskIcon(sub)}
                                </div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-tight">
                                  {sub}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regeneration Modal */}
      {showRegenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 sm:p-8">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Regenerate Roadmap</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Update your focus area and expertise level for a new path.</p>
              
              <form onSubmit={handleRegenerate} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Primary Focus</label>
                  <input 
                    type="text" 
                    value={regenData.goal}
                    onChange={(e) => setRegenData({...regenData, goal: e.target.value})}
                    placeholder="e.g. Master React, Learn Python"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Expertise Level</label>
                  <select 
                    value={regenData.level}
                    onChange={(e) => setRegenData({...regenData, level: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowRegenModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-750 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={generating}
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none transition-all disabled:opacity-50 flex items-center justify-center"
                  >
                    {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
                    {generating ? 'Regenerating...' : 'Start Fresh'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roadmap;
