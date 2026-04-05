import React, { useEffect, useState } from 'react';
import { getExpenses, createExpense, getGroups } from '../../services/api';
import DateNavbar from '../../components/DateNavbar';

const Expenses = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  
  const [formData, setFormData] = useState({ description: '', amount: '', paidBy: '' });

  const loadData = async () => {
    try {
      const [exRes, fmRes] = await Promise.all([ getExpenses(), getGroups() ]);
      setExpenses(exRes.data);
      setGroups(fmRes.data);
    } catch(err) { console.error(err); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!formData.description || !formData.amount || !formData.paidBy) return;
    try {
      await createExpense({...formData, amount: Number(formData.amount), date: selectedDate });
      setFormData({ description: '', amount: '', paidBy: '' });
      loadData();
    } catch(err) {}
  };

  const filteredExpenses = expenses.filter(e => e.date && new Date(e.date).toISOString().split('T')[0] === selectedDate);

  return (
     <div className="space-y-6 mt-4">
      <DateNavbar selectedDate={selectedDate} onDateSelect={setSelectedDate} hideCreate={true} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Add Expense Form */}
        <div className="col-span-1">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-green-700 dark:text-green-400 mb-4 flex items-center">Add Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="expenseDescription" className="text-xs font-semibold text-gray-500 dark:text-gray-200 block mb-1">Description</label>
                <input type="text" id="expenseDescription" name="expenseDescription" placeholder="e.g. Groceries" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500" required />
              </div>
              <div>
                <label htmlFor="expenseAmount" className="text-xs font-semibold text-gray-500 dark:text-gray-200 block mb-1">Amount (Rs)</label>
                <input type="number" id="expenseAmount" name="expenseAmount" step="0.01" value={formData.amount} onChange={e=>setFormData({...formData, amount: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500" required />
              </div>
              <div>
                <label htmlFor="expensePaidBy" className="text-xs font-semibold text-gray-500 dark:text-gray-200 block mb-1">Paid By</label>
                <select id="expensePaidBy" name="expensePaidBy" value={formData.paidBy} onChange={e=>setFormData({...formData, paidBy: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500" required>
                  <option value="">Select Group Member</option>
                  {groups.map(f => (
                    <option key={f._id} value={f._id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors mt-2">Submit Expense</button>
            </form>
          </div>
        </div>

        {/* History */}
        <div className="col-span-2">
           <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 min-h-[300px]">
             <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Expense History ({selectedDate})</h2>
             {filteredExpenses.length === 0 ? (
               <div className="flex justify-center items-center h-40 text-gray-400 border border-dashed border-gray-200 rounded-lg">
                 No expenses recorded for this date.
               </div>
             ) : (
               <div className="space-y-3">
                 {filteredExpenses.map(exp => (
                   <div key={exp._id} className="flex justify-between items-center p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                     <div>
                       <p className="font-medium text-gray-800 dark:text-gray-100">{exp.description}</p>
                       <p className="text-xs text-gray-500 dark:text-gray-300">Paid by: {exp.paidBy?.name}</p>
                     </div>
                     <div className="text-lg font-bold text-green-600 dark:text-green-400">
                       Rs {exp.amount.toFixed(2)}
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
        </div>

      </div>
     </div>
  );
};
export default Expenses;
