import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Map, LayoutDashboard, History, Settings as SettingsIcon, Bell } from 'lucide-react';
import Onboarding from './Onboarding';
import Dashboard from './Dashboard';
import Roadmap from './Roadmap';
import TaskHistory from './History';
import Settings from './Settings';
import { useAuth } from '../../context/AuthContext';
import { getTaskMentorTodayTask } from '../../services/api';

const TaskMentor = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isOnboarded, setIsOnboarded] = useState(user?.mentor_onboarded || false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check onboarding status
    if (user?.mentor_onboarded !== undefined) {
      setIsOnboarded(user.mentor_onboarded);
      setLoading(false);
    } else {
      getTaskMentorTodayTask()
        .then(() => setIsOnboarded(true))
        .catch((err) => {
          if (err.response?.status === 404) {
            setIsOnboarded(false);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Task Mentor...</div>;

  if (!isOnboarded) {
    return <Onboarding onComplete={() => setIsOnboarded(true)} />;
  }

  const tabs = [
    { name: 'Dashboard', path: '/mentor', icon: LayoutDashboard },
    { name: 'Roadmap', path: '/mentor/roadmap', icon: Map },
    { name: 'History', path: '/mentor/history', icon: History },
    { name: 'Settings', path: '/mentor/settings', icon: SettingsIcon }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Task Mentor</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your adaptive learning guide</p>
        </div>
      </div>

      <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-800 hide-scrollbar">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.name}
              to={tab.path}
              className={`flex items-center px-4 py-3 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
                isActive 
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.name}
            </Link>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 px-3 py-6 sm:px-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/history" element={<TaskHistory />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/mentor" />} />
        </Routes>
      </div>
    </div>
  );
};

export default TaskMentor;
