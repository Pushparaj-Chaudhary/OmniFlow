import React, { useEffect, useState } from 'react';
import { Users, CheckSquare, Receipt } from 'lucide-react';
import { getGroups, getDuties, getExpenses, getHouseholdMembers } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Overview = () => {
  const [stats, setStats] = useState({ roommates: 0, Duties: 0, expenses: 0 });
  const [household, setHousehold] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user: currentUser, updateUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fmRes, chRes, exRes, houseRes] = await Promise.all([
          getGroups(),
          getDuties(),
          getExpenses(),
          getHouseholdMembers()
        ]);

        const totalExpenses = exRes.data.reduce((sum, curr) => sum + curr.amount, 0);

        setStats({
          roommates: fmRes.data.length,
          Duties: chRes.data.length,
          expenses: totalExpenses
        });
        setHousehold(houseRes.data);
      } catch (err) {
        console.error('Failed to load overview data', err);
        if (err.response?.status === 404) {
          updateUser({ activeHousehold: null });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [updateUser]);

  const copyCode = () => {
    if (household?.secretCode) {
      navigator.clipboard.writeText(household.secretCode);
      alert('Secret code copied to clipboard!');
    }
  };

  const copyLink = async () => {
    const link = `${window.location.origin}/flatmanager?joinCode=${household.secretCode}`;
    const shareData = {
      title: 'Join my OmniFlow Group',
      text: `Manage duties and expenses with me on OmniFlow! Group Code: ${household.secretCode}`,
      url: link,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(`Join my OmniFlow group using code: ${household.secretCode}\nLink: ${link}`);
      alert('Share link and code copied to clipboard!');
    }
  };

  if (loading) return (
    <div className="flex justify-center mt-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="space-y-6 mt-4">
      {/* Invite Card (Admin Only) */}
      {household && currentUser?._id === household.admin && (
        <div className="bg-linear-to-r from-primary-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-primary-200 dark:shadow-none relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6" />
                {household.name}
              </h2>
              <p className="text-primary-100 mt-1 text-sm">Invite your roommates to track expenses together!</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 border border-white/30 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-primary-100">Secret Code</p>
                  <p className="font-mono text-lg font-bold tracking-wider">{household.secretCode}</p>
                </div>
                <button 
                  onClick={copyCode}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Copy Code"
                >
                  <Receipt className="w-5 h-5" />
                </button>
              </div>
              
              <button 
                onClick={copyLink}
                className="bg-white text-primary-600 px-6 py-2 rounded-xl font-bold text-sm hover:bg-primary-50 transition-colors shadow-lg"
              >
                Share Link
              </button>
            </div>
          </div>
          
          {/* Abstract Decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 -translate-y-1/2 translate-x-1/2 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 translate-y-1/2 -translate-x-1/2 blur-2xl rounded-full"></div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-5 flex flex-row items-center justify-between transition-colors">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0 transition-colors">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-500 dark:text-gray-400 uppercase transition-colors">Members</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 transition-colors">{stats.roommates}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-5 flex flex-row items-center justify-between transition-colors">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg shrink-0 transition-colors">
              <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-500 dark:text-gray-400 uppercase transition-colors">Duties</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 transition-colors">{stats.Duties}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-5 flex flex-row items-center justify-between transition-colors">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg shrink-0 transition-colors">
              <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-500 dark:text-gray-400 uppercase transition-colors">Spend</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 truncate transition-colors">Rs {stats.expenses.toFixed(0)}</p>
        </div>
      </div>
    </div>
  );
};

export default Overview;
