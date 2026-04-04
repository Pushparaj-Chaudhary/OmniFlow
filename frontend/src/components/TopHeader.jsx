import React, { useState, useEffect } from 'react';
import { Bell, LogOut, CheckSquare, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchNotes } from '../services/api';

const TopHeader = ({ setIsMobileMenuOpen }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasViewedNotifications, setHasViewedNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const res = await fetchNotes({ type: 'Task', status: 'Pending' });
      const newNotifs = res.data.filter(n => n.assignedPerson?.email === user.email || !n.assignedPerson?.email);
      setNotifications(prev => {
        if (newNotifs.length > prev.length) setHasViewedNotifications(false);
        return newNotifs;
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) setHasViewedNotifications(true);
  };

  if (!user) return null;
  return (
    <div className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-4 sm:px-8 shrink-0 relative z-10 transition-colors">
      
      {/* Mobile Left Section: Hamburger + Logo */}
      <div className="flex sm:hidden items-center">
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 mr-2 bg-white dark:bg-gray-800 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center">
          <img src="/logo.png" alt="" className='w-8 h-auto dark:invert-0 invert mr-2'/>
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">OmniFlow</span>
        </div>
      </div>

      <div className="hidden sm:flex space-x-6 text-sm font-semibold text-gray-600 dark:text-gray-300">
         {/* Removed textual links as per user request */}
      </div>
      <div className="flex items-center space-x-4 relative">
        <button onClick={handleNotificationClick} className="text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 relative transition-colors">
          <Bell className="w-5 h-5" />
          {notifications.length > 0 && !hasViewedNotifications && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute top-12 right-0 sm:right-32 w-72 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg p-3 z-50 max-h-80 overflow-y-auto">
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2 border-b dark:border-gray-700 pb-2">Pending Tasks ({notifications.length})</h4>
            {notifications.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">No pending tasks</p>
            ) : (
              notifications.map(n => (
                <div key={n._id} className="flex flex-col py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2 cursor-pointer transition">
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">{n.title}</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center mt-0.5"><CheckSquare className="w-3 h-3 mr-1"/> Check dashboard for details</span>
                </div>
              ))
            )}
          </div>
        )}

        <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-full py-1 px-1 sm:px-2" title="Profile">
          <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=random`} alt="Profile" className="w-6 h-6 rounded-full sm:mr-2 object-cover" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 mr-2 hidden sm:block">{user?.name || 'User'}</span>
        </div>
        <button onClick={logout} className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
          <LogOut className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-1" /> <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default TopHeader;
