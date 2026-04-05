import React, { useEffect, useState } from 'react';
import { getExpenses, getGroups } from '../../services/api';

const SettleUp = () => {
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fmRes, exRes] = await Promise.all([getGroups(), getExpenses()]);
        setGroups(fmRes.data);
        setExpenses(exRes.data);
      } catch(err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex justify-center mt-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  );

  const totalExpenses = expenses.reduce((sum, curr) => sum + curr.amount, 0);
  const perPersonAverage = groups.length > 0 ? totalExpenses / groups.length : 0;

  // Calculate balances
  const balances = groups.map(fm => {
    const paidByThisPerson = expenses.filter(e => e.paidBy?._id === fm._id).reduce((s, curr) => s + curr.amount, 0);
    const owes = perPersonAverage - paidByThisPerson;
    return { ...fm, paid: paidByThisPerson, owes };
  });

  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 p-3 h-fit">
           <h3 className="text-lg font-bold text-gray-700 dark:text-gray-100 flex items-center border-b mb-2 pb-1">Total Overview</h3>
           <div className="space-y-2">
             <div className="flex justify-between items-center">
               <span className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase">Total Expenses</span>
               <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">Rs {totalExpenses.toFixed(2)}</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase">Per Person Average</span>
               <span className="text-2xl font-bold text-blue-600 dark:text-blue-500">Rs {perPersonAverage.toFixed(2)}</span>
             </div>
           </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 p-3">
          <h3 className="text-lg font-bold text-green-700 dark:text-green-400 mb-6 flex items-center border-b pb-1">Balances</h3>
          <div className="space-y-2">
            {balances.length === 0 && <p className="text-gray-500 text-sm">Add group members to see balances.</p>}
            {balances.map(b => (
              <div key={b._id} className="flex justify-between items-center border border-gray-100 p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{b.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-300">Paid: Rs {b.paid.toFixed(2)}</p>
                </div>
                <div>
                  {b.owes > 0.01 ? (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-bold">Owes Rs {b.owes.toFixed(2)}</span>
                  ) : b.owes < -0.01 ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold">Gets Rs {Math.abs(b.owes).toFixed(2)}</span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold">Settled</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
export default SettleUp;
