import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getMyHouseholds, switchHousehold, createHousehold, joinHousehold } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Users, LogIn, Plus, Sparkles, CheckCircle2, Share2, Copy, ArrowRight, Layout, ChevronRight, Loader2 } from 'lucide-react';

const JoinHousehold = ({ onJoin }) => {
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const [mode, setMode] = useState('join'); // 'join', 'create', or 'switch'
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [createCode, setCreateCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [newHousehold, setNewHousehold] = useState(null);
  const [myHouseholds, setMyHouseholds] = useState([]);
  const [fetchingGroups, setFetchingGroups] = useState(false);

  const loadMyGroups = async () => {
    setFetchingGroups(true);
    try {
      const res = await getMyHouseholds();
      setMyHouseholds(res.data);
      if (res.data.length > 0 && !user?.activeHousehold) {
        setMode('switch');
      }
    } catch (err) {
      console.error('Failed to load groups', err);
    } finally {
      setFetchingGroups(false);
    }
  };

  useEffect(() => {
    loadMyGroups();
    const params = new URLSearchParams(location.search);
    const joinCode = params.get('joinCode');
    if (joinCode) {
      setCode(joinCode.toUpperCase());
      setMode('join');
    }
  }, [location]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await createHousehold({ name, secretCode: createCode });
      
      // Update Auth Context
      updateUser({ activeHousehold: res.data._id });
      
      setNewHousehold(res.data);
      setShowSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await joinHousehold({ secretCode: code.toUpperCase() });
      
      // Update Auth Context
      updateUser({ activeHousehold: res.data._id });
      
      onJoin(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid secret code');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = async (id) => {
    setLoading(true);
    try {
      const res = await switchHousehold(id);
      updateUser({ activeHousehold: id });
      onJoin(res.data.household);
    } catch (err) {
      setError('Failed to switch group');
    } finally {
      setLoading(false);
    }
  };



  const copyCode = () => {
    navigator.clipboard.writeText(newHousehold.secretCode);
    alert('Code copied!');
  };

  const shareLink = async () => {
    const link = `${window.location.origin}/flatmanager?joinCode=${newHousehold.secretCode}`;
    const shareData = {
      title: 'Join my OmniFlow Group',
      text: `Manage duties and expenses with me on OmniFlow! Group Code: ${newHousehold.secretCode}`,
      url: link,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(`Join my OmniFlow group using code: ${newHousehold.secretCode}\nLink: ${link}`);
      alert('Link and code copied to clipboard!');
    }
  };

  if (showSuccess && newHousehold) {
    return (
      <div className="max-w-md mx-auto mt-10 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-primary-100 dark:border-gray-700 text-center animate-in fade-in zoom-in duration-300">
        <div className="inline-flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full mb-6 ring-8 ring-green-50/50 dark:ring-green-900/10">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        
        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-2">Group Created!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Share this code with your roommates to start collaborating.</p>

        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 mb-8">
          <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-widest mb-2">Your Secret Code</p>
          <p className="text-4xl font-mono font-black text-primary-600 dark:text-primary-400 tracking-[0.2em]">{newHousehold.secretCode}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={copyCode}
            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group"
          >
            <Copy className="w-6 h-6 text-gray-400 group-hover:text-primary-600 mb-2" />
            <span className="text-xs font-bold text-gray-500 group-hover:text-primary-600">Copy Code</span>
          </button>
          
          <button
            onClick={shareLink}
            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group"
          >
            <Share2 className="w-6 h-6 text-gray-400 group-hover:text-primary-600 mb-2" />
            <span className="text-xs font-bold text-gray-500 group-hover:text-primary-600">Share Link</span>
          </button>
        </div>

        <button
          onClick={() => onJoin(newHousehold)}
          className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-xl shadow-primary-200 dark:shadow-none translate-y-0 hover:-translate-y-1 active:scale-95"
        >
          <span>Enter Group Dashboard</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome to Group Manager</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Join an existing shared workspace or create a new one to start tracking expenses together.</p>
      </div>

      <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-lg mb-8">
        {myHouseholds.length > 0 && (
          <button
            onClick={() => setMode('switch')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'switch' ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            My Groups
          </button>
        )}
        <button
          onClick={() => setMode('join')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'join' ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Join 
        </button>
        <button
          onClick={() => setMode('create')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'create' ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Create
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg border border-red-100 dark:border-red-800">
          {error}
        </div>
      )}

      {mode === 'switch' ? (
        <div className="space-y-3">
          {fetchingGroups ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : (
            myHouseholds.map(h => {
              const isActive = h._id === user?.activeHousehold;
              return (
                <button
                  key={h._id}
                  onClick={() => !isActive && handleSwitch(h._id)}
                  className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all group ${isActive
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 cursor-default'
                      : 'border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-800 hover:bg-gray-50 dark:hover:bg-gray-900/50'
                    }`}
                >
                  <div className="text-left">
                    <p className={`font-bold ${isActive ? 'text-primary-700 dark:text-primary-400' : 'text-gray-800 dark:text-gray-200'}`}>
                      {h.name}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{h.secretCode}</p>
                  </div>
                  {isActive ? (
                    <span className="text-[10px] bg-primary-600 text-white px-2 py-0.5 rounded-full font-bold">Active</span>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors" />
                  )}
                </button>
              );
            })
          )}
        </div>
      ) : mode === 'join' ? (
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label htmlFor="joinSecretCode" className="text-xs font-semibold text-gray-500 uppercase block mb-1">Secret Code</label>
            <input
              type="text"
              id="joinSecretCode"
              name="joinSecretCode"
              placeholder="E.G. A1B2C3"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all uppercase font-mono"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-primary-200 dark:shadow-none"
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><LogIn className="w-5 h-5" /> <span>Join Household</span></>}
          </button>
        </form>
      ) : (
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="createGroupName" className="text-xs font-semibold text-gray-500 uppercase block mb-1">Group Name</label>
            <input
              type="text"
              id="createGroupName"
              name="createGroupName"
              placeholder="e.g. My Awesome Flat"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="createCustomCode" className="text-xs font-semibold text-gray-500 uppercase block mb-1">Secret Code (Optional)</label>
            <input
              type="text"
              id="createCustomCode"
              name="createCustomCode"
              placeholder="e.g. FLAT123"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all uppercase font-mono"
              value={createCode}
              onChange={(e) => setCreateCode(e.target.value)}
            />
            <p className="text-[10px] text-gray-400 mt-1 italic">Leave empty to generate a random 6-character code.</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-primary-200 dark:shadow-none"
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><Plus className="w-5 h-5" /> <span>Create Household</span></>}
          </button>
        </form>
      )}

      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-center space-x-2 text-gray-400 text-xs text-center">
        <Users className="w-4 h-4" />
        <span>Collaborate with roommates in real-time</span>
      </div>
    </div>
  );
};

export default JoinHousehold;
