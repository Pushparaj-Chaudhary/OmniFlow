import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { aiOptimizeRoutine } from '../services/api';

const OptimizeDayModal = ({ isOpen, onClose, routines }) => {
  const [loading, setLoading] = useState(false);
  const [optimization, setOptimization] = useState(null);

  if (!isOpen) return null;

  const handleOptimize = async () => {
    if (!routines || routines.length === 0) return;
    setLoading(true);
    try {
      const payload = routines.map(r => ({
        title: r.title,
        description: r.description,
        startTime: r.startTime,
        endTime: r.endTime,
        status: r.status
      }));
      const res = await aiOptimizeRoutine(payload);
      setOptimization(res.data.result);
    } catch (err) {
      console.error(err);
      setOptimization("Failed to optimize routine. Please make sure the AI endpoint is correctly configured.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
          <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 bg-indigo-50 dark:bg-indigo-900/40 transition-colors">
            <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100 flex items-center transition-colors">
              <Sparkles className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              AI Routine Optimizer
            </h3>
            <button onClick={onClose} className="text-indigo-400 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-gray-200 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {!optimization && !loading ? (
              <div className="text-center py-10">
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto transition-colors">
                  Our AI productivity expert will analyze your current schedule, locate conflicts, suggest better sequences, and provide actionable tips.
                </p>
                <button 
                  onClick={handleOptimize}
                  className="px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md font-bold hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center mx-auto"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Optimize My Day
                </button>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
                <p className="text-indigo-900 dark:text-indigo-100 font-medium transition-colors">Analyzing your routines...</p>
              </div>
            ) : (
              <div className="prose prose-indigo dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 whitespace-pre-wrap transition-colors">
                {optimization}
              </div>
            )}
          </div>
          
          {optimization && (
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end transition-colors">
              <button 
                onClick={() => { setOptimization(null); onClose(); }} 
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptimizeDayModal;
