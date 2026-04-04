import React, { useEffect, useState } from 'react';
import { Users, CheckSquare, Receipt } from 'lucide-react';
import { getGroups, getDuties, getExpenses } from '../../services/api';

const Overview = () => {
  const [stats, setStats] = useState({ roommates: 0, Duties: 0, expenses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fmRes, chRes, exRes] = await Promise.all([
          getGroups(),
          getDuties(), // all time
          getExpenses()
        ]);

        const totalExpenses = exRes.data.reduce((sum, curr) => sum + curr.amount, 0);

        setStats({
          roommates: fmRes.data.length,
          Duties: chRes.data.length,
          expenses: totalExpenses
        });
      } catch (err) {
        console.error('Failed to load overview data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-10 dark:text-gray-300">Loading overview...</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-5 flex flex-row items-center justify-between transition-colors">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-2 sm:p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0 transition-colors">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-500 dark:text-gray-400 uppercase transition-colors">Group Members</h3>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 transition-colors">{stats.roommates}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-5 flex flex-row items-center justify-between transition-colors">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg shrink-0 transition-colors">
            <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-500 dark:text-gray-400 uppercase transition-colors">Tasks</h3>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 transition-colors">{stats.Duties}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-5 flex flex-row items-center justify-between transition-colors">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-2 sm:p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg shrink-0 transition-colors">
            <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-500 dark:text-gray-400 uppercase transition-colors">Expenses</h3>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 truncate transition-colors">Rs {stats.expenses.toFixed(0)}</p>
      </div>
    </div>
  );
};

export default Overview;
