import React, { useEffect, useState, useRef } from 'react';
import { getExpenses, createExpense, getGroups, uploadAttachment, deleteExpense, updateExpense } from '../../services/api';
import DateNavbar from '../../components/DateNavbar';
import { formatDateLocal } from '../../utils/dateUtils';
import { Camera, Trash2, Image as ImageIcon, Loader2, Pencil, X, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Expenses = () => {
  const { user: currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState(formatDateLocal(new Date()));
  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  
  const [formData, setFormData] = useState({ description: '', amount: '', paidBy: '', paidByType: 'User' });
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const fileInputRef = useRef(null);

  const handleDateSelect = (val) => {
    if (!val) {
      setSelectedDate(new Date().toISOString().split('T')[0]);
      return;
    }
    if (val instanceof Date) {
      setSelectedDate(formatDateLocal(val));
    } else {
      setSelectedDate(val);
    }
  };

  const loadData = async () => {
    try {
      const [exRes, fmRes] = await Promise.all([ getExpenses(), getGroups() ]);
      setExpenses(exRes.data);
      setGroups(fmRes.data);
      
      // Auto-set paidBy to current user if not already set or if not admin
      if (!formData.paidBy) {
         setFormData(prev => ({ ...prev, paidBy: currentUser._id, paidByType: 'User' }));
      }
    } catch(err) { console.error(err); }
  };

  useEffect(() => { loadData(); }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!formData.description || !formData.amount || !formData.paidBy) return;
    
    setUploading(true);
    try {
      let photoUrl = formData.photoUrl || '';
      if (photo && typeof photo !== 'string') {
        const uploadRes = await uploadAttachment(photo);
        photoUrl = uploadRes.data.url;
      }

      if (isEditing) {
        await updateExpense(editingId, {
          ...formData,
          amount: Number(formData.amount),
          date: selectedDate,
          photoUrl
        });
      } else {
        await createExpense({
          ...formData, 
          amount: Number(formData.amount), 
          date: selectedDate,
          photoUrl
        });
      }
      
      resetForm();
      loadData();
    } catch(err) {
      console.error('Failed to process expense', err);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({ description: '', amount: '', paidBy: currentUser._id, paidByType: 'User' });
    setPhoto(null);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (exp) => {
    setIsEditing(true);
    setEditingId(exp._id);
    setFormData({
      description: exp.description,
      amount: exp.amount,
      paidBy: exp.paidBy?._id || '',
      paidByType: exp.paidByType || 'User',
      photoUrl: exp.photoUrl || ''
    });
    if (exp.photoUrl) setPhoto(exp.photoUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await deleteExpense(id);
      loadData();
    } catch(err) {
       alert(err.response?.data?.message || 'Error deleting expense');
    }
  };

  const filteredExpenses = expenses.filter(e => e.date && formatDateLocal(e.date) === selectedDate);

  return (
     <div className="space-y-6 mt-4">
      <DateNavbar selectedDate={selectedDate} onDateSelect={handleDateSelect} hideCreate={true} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Add Expense Form */}
        <div className="col-span-1">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-green-700 dark:text-green-400 mb-4 flex items-center justify-between">
               <span className="flex items-center gap-2">
                 {isEditing ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                 {isEditing ? 'Edit Expense' : 'Add Expense'}
               </span>
               {isEditing ? (
                 <button onClick={resetForm} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 transition-colors">
                   <X className="w-5 h-5" />
                 </button>
               ) : (
                 <Sparkles className="w-5 h-5 text-yellow-500" />
               )}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="expenseDescription" className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Description</label>
                <input type="text" id="expenseDescription" name="expenseDescription" placeholder="e.g. Groceries" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500" required />
              </div>
              <div>
                <label htmlFor="expenseAmount" className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Amount (Rs)</label>
                <input type="number" id="expenseAmount" name="expenseAmount" step="0.01" value={formData.amount} onChange={e=>setFormData({...formData, amount: e.target.value})} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500" required />
              </div>
              
              <div>
                <label htmlFor="expensePaidBy" className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Paid By (Dynamic)</label>
                <select 
                  id="expensePaidBy" 
                  name="expensePaidBy" 
                  value={formData.paidBy} 
                  onChange={e => {
                    const selected = groups.find(g => g._id === e.target.value);
                    setFormData({...formData, paidBy: e.target.value, paidByType: selected?.type || 'User'});
                  }} 
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-green-500" 
                  required
                >
                  <option value="">Select Member</option>
                  {groups.map(f => (
                    <option key={f._id} value={f._id}>{f.name} {f._id === currentUser._id ? '(You)' : `(${f.type})`}</option>
                  ))}
                </select>
              </div>

              <div>
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full py-2 px-3 border border-dashed rounded-lg flex items-center justify-center space-x-2 text-sm transition-colors ${photo ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                >
                  {photo ? <ImageIcon className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                  <span>{photo ? photo.name : 'Take Photo / Upload Receipt'}</span>
                </button>
                <label htmlFor="expensePhoto" className="sr-only">Upload Receipt Photo</label>
                <input type="file" id="expensePhoto" name="expensePhoto" ref={fileInputRef} onChange={handleFileChange} accept="image/*" capture="environment" className="hidden" />
              </div>

              <button 
                type="submit" 
                disabled={uploading}
                className={`w-full py-2 ${isEditing ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'} text-white font-medium rounded-lg transition-colors mt-2 flex items-center justify-center space-x-2 shadow-lg shadow-green-100 dark:shadow-green-900/30 disabled:opacity-50`}
              >
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>{isEditing ? 'Update Expense' : 'Submit Expense'}</span>}
              </button>
            </form>
          </div>
        </div>

        {/* History */}
        <div className="col-span-2">
           <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[300px]">
             <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Expense History ({selectedDate})</h2>
             {filteredExpenses.length === 0 ? (
               <div className="flex justify-center items-center h-40 text-gray-400 border border-dashed border-gray-200 rounded-lg">
                 No expenses recorded for this date.
               </div>
             ) : (
               <div className="space-y-3">
                 {filteredExpenses.map(exp => (
                   <div key={exp._id} className="flex justify-between items-center p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow">
                     <div className="flex items-center space-x-4">
                       {exp.photoUrl ? (
                         <img src={exp.photoUrl} alt="receipt" className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:scale-110 transition-transform" onClick={() => window.open(exp.photoUrl, '_blank')} />
                       ) : (
                         <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center text-gray-300">
                           <ImageIcon className="w-6 h-6" />
                         </div>
                       )}
                       <div>
                         <p className="font-medium text-gray-800 dark:text-gray-100">{exp.description}</p>
                         <p className="text-xs text-gray-500 dark:text-gray-400">
                            Paid by: {exp.paidBy?.name || 'Unknown'} 
                            {exp.createdBy === currentUser._id && <span className="ml-2 text-primary-500 italic">(You added)</span>}
                         </p>
                       </div>
                     </div>
                     <div className="flex items-center space-x-4">
                       <div className="text-lg font-bold text-green-600 dark:text-green-400">
                         Rs {exp.amount.toFixed(2)}
                       </div>
                       {exp.createdBy === currentUser._id && (
                         <div className="flex items-center space-x-1">
                           <button 
                             onClick={() => handleEdit(exp)}
                             className="p-2 text-gray-400 hover:text-amber-600 transition-colors"
                             title="Edit"
                           >
                             <Pencil className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => handleDelete(exp._id)}
                             className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                             title="Delete"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                       )}
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

const Sparkles = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
  </svg>
);

export default Expenses;
