import React, { useState, useEffect } from 'react';
import { getTaskMentorTodayTask, updateTaskMentorStatus } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Loader2, CheckCircle, SkipForward, AlertCircle, Clock, Target, Flame } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [taskData, setTaskData] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    fetchTodayTask();
  }, []);

  const fetchTodayTask = async () => {
    setLoading(true);
    try {
      const res = await getTaskMentorTodayTask();
      if (res.data.limitReached) {
        setLimitReached(true);
        setTaskData(null);
      } else {
        setLimitReached(false);
        setTaskData(res.data.task);
      }
      setProgress(res.data.progress);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      setLoading(true);
      await updateTaskMentorStatus(taskData._id, status);
      await fetchTodayTask(); // Refetch to get updated progress constraints
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
      setLoading(false); // only finish loading on error so UI sets state back
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Overview Stats */}
      {progress && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-xl p-3 sm:p-4 flex items-center border border-gray-100 dark:border-gray-800 shadow-sm group">
             <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 sm:p-2.5 rounded-lg mr-3 sm:mr-4">
               <Target className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
             </div>
             <div className="min-w-0">
               <p className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-0.5">Goal</p>
               <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white capitalize truncate">{user.goal}</p>
             </div>
          </div>
          <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-xl p-3 sm:p-4 flex items-center border border-gray-100 dark:border-gray-800 shadow-sm group">
             <div className="bg-orange-50 dark:bg-orange-900/20 p-2 sm:p-2.5 rounded-lg mr-3 sm:mr-4">
               <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
             </div>
             <div className="min-w-0">
               <p className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-0.5">Streak</p>
               <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">{progress.streak} Days</p>
             </div>
          </div>
          <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-xl p-3 sm:p-4 flex items-center border border-gray-100 dark:border-gray-800 shadow-sm group col-span-2 lg:col-span-1">
             <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-2.5 rounded-lg mr-3 sm:mr-4">
               <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
             </div>
             <div className="min-w-0">
               <p className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-0.5">Timeline</p>
               <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">Day {progress.current_day}</p>
             </div>
          </div>
        </div>
      )}

      {/* Task Section */}
      {limitReached ? (
        <div className="text-center py-12 px-6 bg-white dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-inner group animate-in fade-in zoom-in duration-500">
           <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center mx-auto mb-6">
             <CheckCircle className="w-6 h-6 text-emerald-500" />
           </div>
           <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">Daily Limit Reached!</h3>
           <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
             You've completed 3 tasks today! Great job learning so fast. Take a well-deserved break and come back tomorrow for your next task.
           </p>
        </div>
      ) : !taskData ? (
        <div className="text-center py-12 px-6 bg-white dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-inner group animate-in fade-in zoom-in duration-500">
           <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center mx-auto mb-6">
             <AlertCircle className="w-6 h-6 text-indigo-500" />
           </div>
           <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">Path Complete</h3>
           <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
             You've finished your curriculum! Ready for your next challenge?
           </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="bg-linear-to-r from-indigo-500/5 via-purple-500/5 to-transparent p-px">
            <div className="bg-white dark:bg-gray-900 rounded-[15px] overflow-hidden">
              <div className="p-6 sm:p-8 md:p-10 text-center">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-8 leading-snug max-w-2xl mx-auto">
                  {taskData.title}
                </h2>

                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <button
                    onClick={() => handleStatusUpdate('completed')}
                    className="flex-1 inline-flex justify-center items-center px-6 py-3 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-100 dark:shadow-none transition-all active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Mark Accomplished
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('skipped')}
                    className="inline-flex justify-center items-center px-6 py-3 border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-sm font-bold rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all active:scale-95"
                  >
                    <SkipForward className="w-4 h-4 mr-2" /> Skip to Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
