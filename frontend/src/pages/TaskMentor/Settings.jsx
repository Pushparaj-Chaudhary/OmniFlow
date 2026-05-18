import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Save, Mail, Clock, Loader2, ChevronRight } from 'lucide-react';
import { updateProfile } from '../../services/api';

const Settings = () => {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    emailReminders: user?.settings?.notifications?.email ?? true,
    reminderTime: user?.mentor_reminder_time || '20:00'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await updateProfile({
        mentor_reminder_time: formData.reminderTime,
        settings: {
          ...user.settings,
          notifications: {
            ...user.settings?.notifications,
            email: formData.emailReminders
          }
        }
      });
      
      if (res.data) {
        login(res.data); 
      }
      alert('Preferences updated successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-1000 pb-4 sm:pb-8 relative">
      {/* Subtle Background Elements */}
      <div className="absolute -top-20 -left-20 w-48 sm:w-64 h-48 sm:h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-40 -right-20 w-60 sm:w-80 h-60 sm:h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Area */}
      <div className="px-2 mb-6 sm:mb-10 text-left border-b border-gray-100 dark:border-gray-800 pb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-none mb-2">Mentor Preferences</h2>
        <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Configure your learning experience and notification schedule</p>
      </div>

      <div className="space-y-3 sm:space-y-5">
        {/* Intelligence Briefings Card */}
        <div className="bg-white dark:bg-gray-900 px-3 py-4 sm:px-4 sm:py-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-3 sm:gap-5 group transition-all hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/30">
          <div className="shrink-0 relative">
             <div className="absolute inset-0 bg-indigo-500/5 blur-lg rounded-full"></div>
             <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl flex items-center justify-center shadow-xs border border-indigo-100/50 dark:border-indigo-800/30">
               <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
             </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 mb-0.5 tracking-tight">Intelligence Briefings</h3>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed truncate sm:whitespace-normal">
              AI-crafted daily tasks and milestone reminders.
            </p>
          </div>
          
          <div className="shrink-0 ml-auto">
            <label className="relative inline-flex items-center cursor-pointer group/toggle">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={formData.emailReminders}
                onChange={(e) => setFormData({ ...formData, emailReminders: e.target.checked })} 
              />
              <div className="w-14 sm:w-16 h-7 sm:h-8 bg-gray-100 dark:bg-gray-800 rounded-full peer peer-checked:bg-indigo-600 transition-all shadow-inner relative flex items-center px-1">
                <div className={`w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full shadow-sm transition-all duration-300 z-10 ${formData.emailReminders ? 'translate-x-7 sm:translate-x-8' : 'translate-x-0'}`}></div>
              </div>
            </label>
          </div>
        </div>

        {/* Broadcast Schedule Card */}
        <div className="bg-white dark:bg-gray-900 px-3 py-4 sm:px-4 sm:py-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-3 sm:gap-5 group transition-all hover:shadow-md hover:border-purple-100 dark:hover:border-purple-900/30">
          <div className="shrink-0 relative">
             <div className="absolute inset-0 bg-purple-500/5 blur-lg rounded-full"></div>
             <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 dark:bg-purple-950/30 rounded-2xl flex items-center justify-center shadow-xs border border-purple-100/50 dark:border-purple-800/30">
               <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
             </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 mb-0.5 tracking-tight">Broadcast Schedule</h3>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed truncate sm:whitespace-normal">
              Preferred window for daily updates.
            </p>
          </div>

          <div className="shrink-0 ml-auto bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 rounded-xl p-1 flex items-center">
             <input 
               type="time" 
               value={formData.reminderTime}
               onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
               className="bg-transparent border-none outline-none text-sm sm:text-base font-bold text-gray-800 dark:text-white px-1.5 sm:px-2 w-20 sm:w-24 cursor-pointer"
             />
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4 sm:pt-8">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="group relative inline-flex items-center justify-center px-7 sm:px-11 py-3 sm:py-5 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl sm:rounded-3xl shadow-xl transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
          ) : (
            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center mr-3">
              <Save className="w-3 h-3" />
            </div>
          )}
          <span className="text-base sm:text-lg">{loading ? 'Transmitting...' : 'Save Preferences'}</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;
