import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';
import { MoreHorizontal, Edit2, Trash2, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateNote } from '../services/api';

const priorityColors = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-green-100 text-green-700'
};

const NoteCard = ({ note, onEdit, onDelete }) => {
  const { user } = useAuth();
  const [showOptions, setShowOptions] = useState(false);
  const [checklist, setChecklist] = useState(note.checklist || []);
  const [isExpanded, setIsExpanded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight > clientHeight) {
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollProgress(progress);
    }
  };

  useEffect(() => {
    setChecklist(note.checklist || []);
  }, [note.checklist]);


  const toggleChecklistItem = async (idx) => {
    const updatedChecklist = [...checklist];
    updatedChecklist[idx] = { ...updatedChecklist[idx], isCompleted: !updatedChecklist[idx].isCompleted };
    setChecklist(updatedChecklist); // Optimistic UI

    try {
      await updateNote(note._id, { checklist: updatedChecklist });
    } catch (e) {
      console.error("Failed to update checklist", e);
      // Revert on error
      const reverted = [...updatedChecklist];
      reverted[idx] = { ...reverted[idx], isCompleted: !reverted[idx].isCompleted };
      setChecklist(reverted);
    }
  };

  const renderTasksList = () => {
    if (!checklist || checklist.length === 0) {
      return (
        <p className="text-gray-500 dark:text-gray-400 text-sm italic mb-4 transition-colors">No sub-tasks defined.</p>
      );
    }

    const displayedChecklist = isExpanded ? checklist : checklist.slice(0, 2);

    return (
      <div className="mb-2">
        <div className={`space-y-1.5 ${isExpanded ? 'h-[85px] overflow-y-auto custom-scrollbar pr-1' : ''}`}>
          {displayedChecklist.map((item, idx) => {
            const isChecked = item.isCompleted;
            return (
              <div key={idx} className="flex items-start cursor-pointer group" onClick={() => toggleChecklistItem(idx)}>
                <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border transition-colors ${isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400 dark:group-hover:border-blue-500'}`}>
                  {isChecked && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className={`ml-2 text-sm transition-colors ${isChecked ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                  {item.text}
                </span>
              </div>
            );
          })}
        </div>

        {checklist.length > 2 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors mt-2 text-left"
          >
            {isExpanded ? 'Show Less' : `+${checklist.length - 2} more items (Show More)`}
          </button>
        )}
      </div>
    );
  };

  const completedCount = checklist.filter(c => c.isCompleted).length;
  const totalCount = checklist.length;
  const taskProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200 overflow-hidden relative">
      {/* Three dots menu */}
      <div className="absolute top-4 right-4 z-10 hidden group-hover:block" />
      <div className="absolute top-3 right-3 z-10">
        <button onClick={() => setShowOptions(!showOptions)} className="p-1 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
        {showOptions && (
          <div className="absolute right-0 mt-1 w-28 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-lg py-1 z-20">
            <button onClick={() => { setShowOptions(false); onEdit(note); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center transition-colors"><Edit2 className="w-4 h-4 mr-2" /> Edit</button>
            <button onClick={() => { setShowOptions(false); onDelete(note._id); }} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 flex items-center transition-colors"><Trash2 className="w-4 h-4 mr-2" /> Delete</button>
          </div>
        )}
      </div>

      <div className="p-3 pb-1">
        {/* Title area */}
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 line-clamp-2 pr-6 leading-tight mb-1 transition-colors">{note.title}</h3>

        {note.type === 'Note' && <div className="mb-2"></div>}

        {/* Content area based on type */}
        <div className="mt-2 text-gray-700 dark:text-gray-300 transition-colors">
          {note.type === 'Task' ? (
            <div className="space-y-3 mb-1">
              {renderTasksList()}

              <div className="pt-1 mt-1">
                <div className="flex justify-between items-end mb-1 text-[10px] font-bold text-gray-700 dark:text-gray-300 transition-colors">
                  <span>Progress</span>
                  <span>{taskProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 transition-colors">
                  <div className="bg-purple-500 dark:bg-purple-400 h-1.5 rounded-full transition-all duration-300" style={{ width: `${taskProgress}%` }}></div>
                </div>
              </div>
            </div>
          ) : note.type === 'Note' ? (
            <div className="relative mb-1">
              <div
                className={`text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap transition-colors ${!isExpanded ? 'line-clamp-4' : 'h-[96px] overflow-y-auto custom-scrollbar pr-2'
                  }`}
                onScroll={isExpanded ? handleScroll : undefined}
              >
                {note.description || <span className="italic text-gray-400 dark:text-gray-500">No description provided</span>}
              </div>

              {note.description && note.description.length > 200 && (
                <div className="mt-3 space-y-2">
                  {isExpanded && (
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mb-2 relative">
                      <div className="bg-orange-500 dark:bg-orange-400 h-1.5 rounded-full transition-all duration-150" style={{ width: `${scrollProgress}%` }}></div>
                    </div>
                  )}
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    {isExpanded ? 'Show Less' : 'View Full Content'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Routine Content */
            <div className="space-y-1">
              <div className="pt-2">
                <div className="flex justify-between items-end mb-1 text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors">
                  <span>Progress</span>
                  <span>{note.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 transition-colors">
                  <div className="bg-purple-500 dark:bg-purple-400 h-2 rounded-full transition-all duration-300" style={{ width: `${Math.min(Math.max(note.progress || 0, 0), 100)}%` }}></div>
                </div>

                {note.datewiseProgress && note.datewiseProgress.length > 0 && (
                  <div className="h-20 mt-4 -mx-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 border border-gray-100 dark:border-gray-700 w-full">
                    <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 ml-1">Overall History</div>
                    <ResponsiveContainer width="100%" height="80%" minHeight={1} minWidth={1}>
                      <LineChart data={note.datewiseProgress}>
                        <Line type="monotone" dataKey="progress" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 0 }} activeDot={{ r: 4 }} />
                        <Tooltip
                          contentStyle={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: 'none', backgroundColor: '#374151', color: '#fff' }}
                          itemStyle={{ color: '#fff' }}
                          labelFormatter={(label) => `Date: ${note.datewiseProgress[label]?.date || label}`}
                          formatter={(value) => [`${value}%`, 'Progress']}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Tags */}
      <div className="px-4 pb-3 pt-0">
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-2">

          <div className="flex items-center space-x-2">
            {note.type === 'Note' && <span className="px-2 py-1 rounded-md text-[10px] uppercase font-bold bg-orange-50 text-orange-500 tracking-wider">Note</span>}
            {note.type === 'Task' && <span className="px-2 py-1 rounded-md text-[10px] uppercase font-bold bg-blue-50 text-blue-600 tracking-wider">Task</span>}
            {note.type === 'Routine' && <span className="px-2 py-1 rounded-md text-[10px] uppercase font-bold bg-purple-50 text-purple-600 tracking-wider">Routine</span>}

            {note.priority && note.type !== 'Note' && (
              <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${priorityColors[note.priority]}`}>
                {note.priority}
              </span>
            )}
          </div>

          <div className="flex items-center text-xs font-medium text-gray-600 dark:text-gray-300 transition-colors">
            {note.reminderDate || note.startTime ? (
              <span className="mr-3 text-gray-400 dark:text-gray-500 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                {note.startTime ? format(new Date(`1970-01-01T${note.startTime}:00`), 'h:mm a') : format(new Date(note.reminderDate), 'MMM d, yyyy')}
              </span>
            ) : null}
            <div className="flex items-center group cursor-pointer" title={note.assignedPerson?.name || user?.name || 'Self'}>
              <img src={`https://ui-avatars.com/api/?name=${note.assignedPerson?.name || user?.name || 'User'}&background=random`} alt="Avatar" className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 shadow-sm" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NoteCard;
