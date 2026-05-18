import React, { useState, useEffect } from 'react';
import { getTaskMentorHistory } from '../../services/api';
import { Loader2, Archive, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { formatDateLocal } from '../../utils/dateUtils';

const TaskHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await getTaskMentorHistory();
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center mt-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  if (history.length === 0) {
    return (
      <div className="text-center py-10 px-6 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Archive className="w-8 h-8 text-gray-400 dark:text-gray-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 italic">"The journey of a thousand miles begins with a single task."</h3>
        <p className="mt-4 text-base text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
          Complete or skip your first daily challenge to start building your record of excellence.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Vanguard Records</h3>
        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-full border border-gray-100 dark:border-gray-800">
          Steps: {history.length}
        </div>
      </div>
      
      <div className="space-y-2.5">
        {history.map((task, idx) => (
          <div key={task._id} 
            className={`group relative bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-3 sm:gap-4 overflow-hidden border-l-4
              ${task.status === 'completed' ? 'border-l-emerald-400' :
                task.status === 'skipped' ? 'border-l-amber-400' : 
                'border-l-rose-400'}
            `}
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            {/* Status Icon Indicator */}
            <div className={`p-2 rounded-lg shrink-0 transition-transform group-hover:scale-105 duration-300
              ${task.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' :
                task.status === 'skipped' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 
                'bg-rose-50 dark:bg-rose-900/20 text-rose-600'}
            `}>
              {task.status === 'completed' && <CheckCircle className="w-4 h-4" />}
              {task.status === 'skipped' && <AlertTriangle className="w-4 h-4" />}
              {task.status === 'missed' && <XCircle className="w-4 h-4" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h4 className="text-base font-bold text-gray-900 dark:text-white truncate pr-2 tracking-tight">{task.title}</h4>
                <div className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-100 dark:border-gray-700">
                  {formatDateLocal(task.createdAt)}
                </div>
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 line-clamp-1 opacity-90 mb-2 leading-relaxed">{task.description}</p>
              
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 uppercase tracking-widest">
                  Day {task.day_number}
                </span>
                <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded
                  ${task.status === 'completed' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' :
                    task.status === 'skipped' ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' : 
                    'text-rose-600 bg-rose-50 dark:bg-rose-900/20'}
                `}>
                  {task.status}
                </span>
              </div>
            </div>

            {/* Subtle background glow on hover */}
            <div className={`absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500
              ${task.status === 'completed' ? 'bg-emerald-500' :
                task.status === 'skipped' ? 'bg-amber-500' : 
                'bg-rose-500'}
            `}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskHistory;
