import React, { useState } from 'react';
import { onboardTaskMentor } from '../../services/api';
import { Loader2, ArrowRight, BrainCircuit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Onboarding = ({ onComplete }) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    level: '',
    goal: '',
    daily_time: 2
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.level || !formData.goal) return alert("Please fill all fields");

    setLoading(true);
    try {
      const res = await onboardTaskMentor(formData);
      // Update global user context with new mentor data
      if (res.data && res.data.user) {
        updateUser(res.data.user);
      }
      onComplete();
    } catch (err) {
      console.error(err);
      alert("Failed to onboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-6 px-4 bg-white dark:bg-gray-900 min-h-[70vh] animate-in fade-in duration-700">
      <div className="max-w-lg w-full space-y-5 bg-white dark:bg-gray-900 p-5 sm:p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl"></div>

        <div className="text-center relative">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200 dark:shadow-none">
            <BrainCircuit className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Design Your <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600">Future</span>
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
            Quick details to architect your journey.
          </p>
        </div>
        <form className="mt-6 space-y-5 relative" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="level" className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
                  Current Status
                </label>
                <input
                  id="level"
                  name="level"
                  type="text"
                  required
                  className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all text-sm font-medium text-gray-900 dark:text-white"
                  placeholder="e.g., 12th Grade"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="goal" className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
                  Primary Goal
                </label>
                <input
                  id="goal"
                  name="goal"
                  type="text"
                  required
                  className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all text-sm font-medium text-gray-900 dark:text-white"
                  placeholder="e.g., React Pro"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                />
              </div>
            </div>

            <div className="p-4 bg-indigo-50/20 dark:bg-indigo-900/10 rounded-xl border border-indigo-100/30 dark:border-indigo-900/10">
              <label htmlFor="daily_time" className="flex justify-between items-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                <span>Commitment</span>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                  {formData.daily_time} Hours/Day
                </span>
              </label>
              <input
                id="daily_time"
                name="daily_time"
                type="range"
                min="1"
                max="8"
                value={formData.daily_time}
                onChange={(e) => setFormData({ ...formData, daily_time: Number(e.target.value) })}
                className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between mt-1 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                <span>Casual</span>
                <span>Intense</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <div className="flex items-center text-sm">
                  Initialize Mentor
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
