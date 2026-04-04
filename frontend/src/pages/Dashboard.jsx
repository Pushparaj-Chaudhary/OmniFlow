import React, { useState, useEffect } from 'react';
import { fetchNotes, updateNote, deleteNote, getAnalytics } from '../services/api';
import NoteCard from '../components/NoteCard';
import DateNavbar from '../components/DateNavbar';
import NoteModal from '../components/NoteModal';
import OptimizeDayModal from '../components/OptimizeDayModal';
import FocusTimer from '../components/FocusTimer';
import { Plus, X, Flame, TrendingUp, Sparkles } from 'lucide-react';

const Dashboard = ({ defaultTypeFilter = '' }) => {
  const [notes, setNotes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(defaultTypeFilter);

  useEffect(() => {
    setTypeFilter(defaultTypeFilter);
  }, [defaultTypeFilter]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const [res] = await Promise.all([
        fetchNotes({ search, type: typeFilter })
      ]);
      let data = res.data;
      
      // Client-side date filtering if a date is selected
      if (selectedDate) {
        data = data.filter(n => {
          const dateString = n.reminderDate || n.createdAt;
          if (!dateString) return false;
          const noteD = new Date(dateString);
          return noteD.getDate() === selectedDate.getDate() && 
                 noteD.getMonth() === selectedDate.getMonth() && 
                 noteD.getFullYear() === selectedDate.getFullYear();
        });
      }
      setNotes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await deleteNote(id);
        loadNotes();
      } catch (e) {
        console.error("Failed to delete", e);
      }
    }
  };



  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line
  }, [selectedDate, search, typeFilter]);

  return (
    <div className="w-full">

      {typeFilter === 'Routine' && <FocusTimer />}

      <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
          {defaultTypeFilter ? `My ${defaultTypeFilter}s` : 'My Dashboard'}
        </h1>
        <div className="flex flex-row gap-2 w-full lg:w-auto">
          <input 
            type="text" 
            id="searchQuery"
            name="searchQuery"
            placeholder="Search notes..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full flex-1 sm:w-48 min-w-[120px] transition-colors"
          />
          {!defaultTypeFilter && (
            <div className="flex gap-2 shrink-0">
              <select 
                id="typeFilter"
                name="typeFilter"
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:outline-none w-full max-w-[140px] transition-colors"
              >
                <option value="">All Types</option>
                <option value="Task">Tasks</option>
                <option value="Note">Notes</option>
                <option value="Routine">Routine</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <DateNavbar 
        selectedDate={selectedDate} 
        onDateSelect={setSelectedDate} 
        onCreateNote={() => { setEditingNote(null); setIsModalOpen(true); }}
      />

      {loading ? (
        <div className="flex justify-center mt-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
          {notes.length > 0 ? (
            notes.map(note => (
              <div key={note._id} className="break-inside-avoid mb-6">
                <NoteCard 
                  note={note} 
                  onEdit={(n) => { setEditingNote(n); setIsModalOpen(true); }} 
                  onDelete={handleDelete} 
                />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              No notes found. Create some notes!
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <NoteModal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); setEditingNote(null); }} 
          note={editingNote} 
          onSave={loadNotes} 
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
};

export default Dashboard;
