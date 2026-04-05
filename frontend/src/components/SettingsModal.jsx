import React, { useState, useRef } from 'react';
import { Camera, X, User as UserIcon, Bell, Palette, Loader2, Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, uploadAttachment } from '../services/api';

const SettingsModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // States prepopulated by context
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  
  const [settings, setSettings] = useState({
    notifications: {
      email: user?.settings?.notifications?.email ?? true,
      reminders: user?.settings?.notifications?.reminders ?? true,
      taskAssigned: user?.settings?.notifications?.taskAssigned ?? true,
    },
    appearance: {
      theme: user?.settings?.appearance?.theme || 'light',
      themeColor: user?.settings?.appearance?.themeColor || 'purple',
      cardSize: user?.settings?.appearance?.cardSize || 'comfortable',
    }
  });

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadRes = await uploadAttachment(file);
      setAvatar(uploadRes.data.url);
    } catch (err) {
      console.error(err);
      alert("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleToggle = (category, key) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key]
      }
    }));
  };

  const handleSelect = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        name,
        email,
        avatar,
        settings
      };
      
      const res = await updateProfile(payload);
      updateUser(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 sm:rounded-2xl shadow-xl w-full sm:max-w-4xl flex flex-col md:flex-row overflow-hidden h-full sm:h-auto sm:max-h-[90dvh]">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-800 md:border-r border-b md:border-b-0 border-gray-100 dark:border-gray-700 flex flex-col shrink-0 transition-colors">
          <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-700 flex items-center">
             <button onClick={onClose} className="p-1.5 mr-3 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors md:hidden">
               <ArrowLeft className="w-5 h-5"/>
             </button>
             <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Settings</h2>
          </div>
          <div className="p-2 md:p-3 grid grid-cols-3 md:grid-cols-none md:flex md:flex-col gap-1">
            <button 
              onClick={() => setActiveTab('profile')} 
              className={`flex flex-col md:flex-row items-center justify-center md:justify-start px-2 md:px-4 py-2.5 md:py-3 text-xs md:text-sm font-semibold rounded-xl transition-colors ${activeTab === 'profile' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <UserIcon className="w-4 h-4 md:w-5 md:h-5 mb-1 md:mb-0 md:mr-3" /> Profile
            </button>
            <button 
              onClick={() => setActiveTab('notifications')} 
              className={`flex flex-col md:flex-row items-center justify-center md:justify-start px-2 md:px-4 py-2.5 md:py-3 text-xs md:text-sm font-semibold rounded-xl transition-colors ${activeTab === 'notifications' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <Bell className="w-4 h-4 md:w-5 md:h-5 mb-1 md:mb-0 md:mr-3" /> Notifs
            </button>
            <button 
              onClick={() => setActiveTab('appearance')} 
              className={`flex flex-col md:flex-row items-center justify-center md:justify-start px-2 md:px-4 py-2.5 md:py-3 text-xs md:text-sm font-semibold rounded-xl transition-colors ${activeTab === 'appearance' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <Palette className="w-4 h-4 md:w-5 md:h-5 mb-1 md:mb-0 md:mr-3" /> Appearance
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-900 overflow-hidden">
           <div className="p-5 md:p-8 flex-1 overflow-y-auto hide-scrollbar">
             
             {/* PROFILE TAB */}
             {activeTab === 'profile' && (
               <div className="max-w-md">
                 <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Profile Settings</h3>
                 
                 <div className="mb-8 flex items-center space-x-6">
                   <div className="relative shrink-0">
                     <img src={avatar || `https://ui-avatars.com/api/?name=${name || 'U'}&background=random`} alt="Avatar" className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-sm transition-colors" />
                     <button 
                       onClick={() => fileInputRef.current?.click()}
                       disabled={uploading}
                       className="absolute bottom-0 right-0 p-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow"
                     >
                       {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                     </button>
                     <input type="file" id="settingsAvatar" name="settingsAvatar" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                   </div>
                   <div>
                     <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Profile Photo</h4>
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Recommended 300x300, max 2MB.</p>
                   </div>
                 </div>

                 <div className="space-y-4">
                   <div>
                     <label htmlFor="settingsName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                     <input 
                       type="text" 
                       id="settingsName"
                       name="settingsName"
                       value={name} 
                       onChange={(e) => setName(e.target.value)} 
                       className="w-full border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:border-primary-500 focus:ring focus:ring-primary-200 transition-colors" 
                     />
                   </div>
                   <div>
                     <label htmlFor="settingsEmail" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                     <input 
                       type="email" 
                       id="settingsEmail"
                       name="settingsEmail"
                       value={email} 
                       onChange={(e) => setEmail(e.target.value)} 
                       className="w-full border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-xl px-4 py-2.5 focus:outline-none transition-colors" 
                     />
                     <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Note: Email changes require verification (simulated for now).</p>
                   </div>
                 </div>
               </div>
             )}

             {/* NOTIFICATIONS TAB */}
             {activeTab === 'notifications' && (
               <div className="max-w-lg">
                 <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Notification Preferences</h3>
                 
                 <div className="space-y-6">
                   <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 transition-colors">
                     <div>
                       <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Email Notifications</h4>
                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Receive digests and updates via email.</p>
                     </div>
                     <button 
                       onClick={() => handleToggle('notifications', 'email')}
                       className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${settings.notifications.email ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                     >
                       <span className={`w-4 h-4 bg-white rounded-full shadow absolute transition-transform transform ${settings.notifications.email ? 'translate-x-6' : 'translate-x-1'}`} />
                     </button>
                   </div>

                   <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 transition-colors">
                     <div>
                       <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Reminder Emails</h4>
                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Get notified before deadlines occur.</p>
                     </div>
                     <button 
                       onClick={() => handleToggle('notifications', 'reminders')}
                       className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${settings.notifications.reminders ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                     >
                       <span className={`w-4 h-4 bg-white rounded-full shadow absolute transition-transform transform ${settings.notifications.reminders ? 'translate-x-6' : 'translate-x-1'}`} />
                     </button>
                   </div>

                   <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 transition-colors">
                     <div>
                       <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Task Assignments</h4>
                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Ping me when someone assigns a task to me.</p>
                     </div>
                     <button 
                       onClick={() => handleToggle('notifications', 'taskAssigned')}
                       className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${settings.notifications.taskAssigned ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                     >
                       <span className={`w-4 h-4 bg-white rounded-full shadow absolute transition-transform transform ${settings.notifications.taskAssigned ? 'translate-x-6' : 'translate-x-1'}`} />
                     </button>
                   </div>
                 </div>
               </div>
             )}

             {/* APPEARANCE TAB */}
             {activeTab === 'appearance' && (
               <div className="max-w-lg">
                 <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Appearance</h3>
                 
                 <div className="space-y-8">
                   {/* Theme */}
                   <div>
                     <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Theme</h4>
                     <div className="grid grid-cols-2 gap-4">
                       <button 
                         onClick={() => handleSelect('appearance', 'theme', 'light')}
                         className={`p-4 border-2 rounded-2xl flex flex-col items-center justify-center transition-all ${settings.appearance.theme === 'light' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/40 dark:border-primary-500' : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 bg-white dark:bg-gray-800'}`}
                       >
                         <span className="text-4xl mb-2">☀️</span>
                         <span className={`text-sm font-semibold ${settings.appearance.theme === 'light' ? 'text-gray-800 dark:text-gray-100' : 'text-gray-800 dark:text-gray-400'}`}>Light Mode</span>
                       </button>
                       <button 
                         onClick={() => handleSelect('appearance', 'theme', 'dark')}
                         className={`p-4 border-2 rounded-2xl flex flex-col items-center justify-center transition-all ${settings.appearance.theme === 'dark' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/40 dark:border-primary-500' : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 bg-gray-900 dark:bg-gray-800'}`}
                       >
                         <span className="text-4xl mb-2">🌙</span>
                         <span className={`text-sm font-semibold ${settings.appearance.theme === 'dark' ? 'text-gray-800 dark:text-gray-100' : 'text-gray-100 dark:text-gray-400'}`}>Dark Mode</span>
                       </button>
                     </div>
                   </div>
                 </div>
               </div>
             )}

           </div>

           {/* Footer Action */}
           <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end items-center px-6 shrink-0 rounded-b-2xl md:rounded-br-2xl md:rounded-bl-none transition-colors">
              <button 
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl mr-3 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl flex items-center transition shadow-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
