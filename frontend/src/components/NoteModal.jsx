import React, { useState, useEffect } from 'react';
import { X, Sparkles, Paperclip, Check, Loader2, Plus, Trash2 } from 'lucide-react';
import VoiceRecorder from './VoiceRecorder';
import { uploadAttachment, uploadVoice, aiSummarize, aiExtractTasks, aiGenerateTitle, aiEnhance, createNote, updateNote } from '../services/api';

const NoteModal = ({ isOpen, onClose, note, onSave, selectedDate }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'Task',
    description: '',
    checklist: [],
    progress: 0,
    priority: 'Medium',
    status: 'Pending',
    assignedPerson: { name: '', email: '' },
    reminderDate: '',
    attachments: [],
    voiceNotes: [],
    startTime: '',
    endTime: '',
    reminderEnabled: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  const applyTemplate = (type) => {
    const templates = {
      'Study': { title: 'Study Session', description: 'Focus on chapters 4 and 5.' },
      'Workout': { title: 'Gym Workout', description: 'Upper body and cardio.' },
      'Coding': { title: 'Deep Work: Coding', description: 'Completing ticket #402.' }
    };
    if (templates[type]) {
      setFormData(prev => ({ ...prev, title: templates[type].title, description: templates[type].description }));
    }
  };

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        type: note.type || 'Task',
        description: note.description || '',
        checklist: note.checklist || [],
        progress: note.progress || 0,
        priority: note.priority || 'Medium',
        status: note.status || 'Pending',
        assignedPerson: note.assignedPerson || { name: '', email: '' },
        reminderDate: note.reminderDate ? new Date(note.reminderDate).toISOString().slice(0, 16) : '',
        attachments: note.attachments || [],
        voiceNotes: note.voiceNotes || [],
        startTime: note.startTime || '',
        endTime: note.endTime || '',
        reminderEnabled: !!note.reminderDate && note.type === 'Routine'
      });
    } else {
      setFormData({
        title: '',
        type: 'Task',
        description: '',
        checklist: [],
        progress: 0,
        priority: 'Medium',
        status: 'Pending',
        assignedPerson: { name: '', email: '' },
        reminderDate: '',
        attachments: [],
        voiceNotes: [],
        startTime: '',
        endTime: '',
        reminderEnabled: false
      });
    }
  }, [note, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddChecklist = () => {
    if (newChecklistItem.trim() === '') return;
    setFormData(prev => ({
      ...prev,
      checklist: [...prev.checklist, { text: newChecklistItem.trim(), isCompleted: false }]
    }));
    setNewChecklistItem('');
  };

  const handleRemoveChecklist = (index) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadAttachment(file);
      setFormData(prev => ({ ...prev, attachments: [...prev.attachments, res.data.url] }));
    } catch (err) {
      console.error(err);
      alert("Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  const handleVoiceUpload = async (audioBlob) => {
    if (!audioBlob) return;
    setUploading(true);
    try {
      const res = await uploadVoice(audioBlob);
      setFormData(prev => ({ ...prev, voiceNotes: [...prev.voiceNotes, res.data.url] }));
    } catch (err) {
      console.error(err);
      alert("Error uploading voice note");
    } finally {
      setUploading(false);
    }
  };

  // AI Functions
  const handleAIFunction = async (type) => {
    if (!formData.description) return alert("Please enter some description first.");
    
    setAiLoading(type);
    try {
      if (type === 'summarize') {
        const res = await aiSummarize(formData.description);
        setFormData(prev => ({ ...prev, description: res.data.result }));
      } else if (type === 'tasks') {
        const res = await aiExtractTasks(formData.description);
        // Convert comma/newline separated text to checklist array roughly
        const items = res.data.result.split('\n').map(t => t.replace(/^- /, '').trim()).filter(t => t);
        setFormData(prev => ({ 
          ...prev, 
          checklist: [...prev.checklist, ...items.map(t => ({ text: t, isCompleted: false }))]
        }));
      } else if (type === 'enhance') {
        const res = await aiEnhance(formData.description);
        setFormData(prev => ({ ...prev, description: res.data.result }));
      } else if (type === 'title') {
        const res = await aiGenerateTitle(formData.description);
        setFormData(prev => ({ ...prev, title: res.data.result }));
      }
    } catch (err) {
      console.error(err);
      alert("Error using AI");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return alert("Title is required");

    setIsLoading(true);
    try {
      const payload = { ...formData };
      
      if (payload.type === 'Routine' && payload.reminderEnabled && payload.startTime) {
        const baseDate = selectedDate ? new Date(selectedDate) : new Date();
        const [hours, minutes] = payload.startTime.split(':');
        baseDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        baseDate.setMinutes(baseDate.getMinutes() - 10); // 10 min before
        payload.reminderDate = baseDate.toISOString();
      }

      if (!payload.reminderDate) delete payload.reminderDate;

      if (note && note._id) {
        await updateNote(note._id, payload);
      } else {
        await createNote(payload);
      }
      onSave(); // trigger refresh
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error saving note");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto hide-scrollbar transition-colors">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center p-5 z-10 transition-colors">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{note ? 'Edit' : 'Create'} {formData.type}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* AI Tools Bar */}
          <div className="flex flex-wrap gap-2 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 items-center">
            <Sparkles className="w-5 h-5 text-indigo-500 mr-2" />
            <span className="text-sm font-medium text-indigo-700 mr-2 hidden sm:block">AI Tools:</span>
            {formData.type === 'Task' ? (
              <>
                <button type="button" onClick={() => handleAIFunction('tasks')} disabled={aiLoading} className="text-xs px-3 py-1.5 bg-white border border-indigo-200 text-indigo-600 rounded shadow-sm hover:border-indigo-300 transition-colors disabled:opacity-50 flex items-center">
                  {aiLoading === 'tasks' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                  Generate Sub-Tasks
                </button>
              </>
            ) : (
              <button type="button" onClick={() => handleAIFunction('enhance')} disabled={aiLoading} className="text-xs px-3 py-1.5 bg-white border border-indigo-200 text-indigo-600 rounded shadow-sm hover:border-indigo-300 transition-colors disabled:opacity-50 flex items-center">
                {aiLoading === 'enhance' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                Enhance Text
              </button>
            )}
          </div>

          <div className="space-y-5">
            <div className="flex gap-4 mb-2 pb-2 border-b border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="type" value="Task" checked={formData.type === 'Task'} onChange={handleChange} className="text-primary-600 focus:ring-primary-500 w-4 h-4" />
                <span className="text-sm font-medium text-gray-700">Task</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="type" value="Note" checked={formData.type === 'Note'} onChange={handleChange} className="text-primary-600 focus:ring-primary-500 w-4 h-4" />
                <span className="text-sm font-medium text-gray-700">Note</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="type" value="Routine" checked={formData.type === 'Routine'} onChange={handleChange} className="text-primary-600 focus:ring-primary-500 w-4 h-4" />
                <span className="text-sm font-medium text-gray-700">Routine</span>
              </label>
            </div>
            
            {formData.type === 'Routine' && (
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs font-semibold text-gray-400 uppercase flex items-center mr-2">Templates:</span>
                <button type="button" onClick={() => applyTemplate('Study')} className="text-xs font-medium px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors">📚 Study</button>
                <button type="button" onClick={() => applyTemplate('Workout')} className="text-xs font-medium px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors">🏋️ Workout</button>
                <button type="button" onClick={() => applyTemplate('Coding')} className="text-xs font-medium px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors">💻 Coding</button>
              </div>
            )}
            
            <div>
              <input 
                name="title" 
                id="noteTitle"
                aria-label="Title"
                value={formData.title} 
                onChange={handleChange} 
                placeholder={`Enter ${formData.type} Title`}
                className="w-full text-xl font-bold border-0 border-b pb-2 border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-500 placeholder-gray-300 dark:placeholder-gray-600 transition-colors"
              />
            </div>
            
            {formData.type !== 'Routine' && (
              <div>
                <textarea 
                  name="description" 
                  id="noteDescription"
                  aria-label="Description"
                  value={formData.description} 
                  onChange={handleChange} 
                  placeholder={formData.type === 'Task' ? "Enter task context or paste text to generate sub-tasks..." : "Write your note down..."}
                  rows="4"
                  className="w-full resize-none p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400 dark:placeholder-gray-500 text-sm transition-colors"
                />
              </div>
            )}

            {/* Task Checklist Logic */}
            {formData.type === 'Task' && (
              <div className="space-y-3">
                 <label htmlFor="newChecklistItemInput" className="text-xs font-semibold text-gray-500 uppercase block">Checklist Items</label>
                 
                 <div className="space-y-2">
                   {formData.checklist.map((item, idx) => (
                     <div key={idx} className="flex items-center justify-between border border-gray-100 p-2 rounded-lg bg-gray-50">
                        <span className="text-sm text-gray-700 truncate">{item.text}</span>
                        <button type="button" onClick={() => handleRemoveChecklist(idx)} className="text-gray-400 hover:text-red-500 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                   ))}
                 </div>

                 <div className="flex gap-2">
                   <input 
                     id="newChecklistItemInput"
                     name="newChecklistItemInput"
                     value={newChecklistItem}
                     onChange={(e) => setNewChecklistItem(e.target.value)}
                     onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddChecklist(); } }}
                     placeholder="Add a sub-task..."
                     className="flex-1 p-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:border-primary-500 transition-colors"
                   />
                   <button type="button" onClick={handleAddChecklist} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                     Add
                   </button>
                 </div>
              </div>
            )}

            {formData.type === 'Task' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                  <div className="space-y-2">
                    <label htmlFor="notePriority" className="text-xs font-semibold text-gray-500 uppercase">Priority</label>
                    <select id="notePriority" name="priority" value={formData.priority} onChange={handleChange} className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="noteStatus" className="text-xs font-semibold text-gray-500 uppercase">Status</label>
                    <select id="noteStatus" name="status" value={formData.status} onChange={handleChange} disabled={!note} className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:dark:bg-gray-700 disabled:opacity-75 transition-colors">
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 relative border-t border-gray-100 pt-4">
                   <label htmlFor="noteReminderDate" className="text-xs font-semibold text-gray-500 uppercase block">Set Reminder Limit / Due Date</label>
                   <input type="datetime-local" id="noteReminderDate" name="reminderDate" value={formData.reminderDate} onChange={handleChange} className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </>
            )}

            {(formData.type === 'Task' || formData.type === 'Routine') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                <div className="space-y-2">
                  <label htmlFor="noteAssigneeName" className="text-xs font-semibold text-gray-500 uppercase">Assignee Name</label>
                  <input id="noteAssigneeName" name="assignedPerson.name" value={formData.assignedPerson.name} onChange={handleChange} placeholder="e.g. John Doe (Leave empty for Self)" className="w-full p-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm transition-colors" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="noteAssigneeEmail" className="text-xs font-semibold text-gray-500 uppercase">Assignee Email</label>
                  <input type="email" id="noteAssigneeEmail" name="assignedPerson.email" value={formData.assignedPerson.email} onChange={handleChange} placeholder="john@example.com" className="w-full p-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm transition-colors" />
                </div>
              </div>
            )}

            {formData.type === 'Routine' && (
              <div className="space-y-4 pt-4 border-t border-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="noteStartTime" className="text-xs font-semibold text-gray-500 uppercase block">Start Time</label>
                    <input type="time" id="noteStartTime" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="noteEndTime" className="text-xs font-semibold text-gray-500 uppercase block">End Time</label>
                    <input type="time" id="noteEndTime" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                
                <div className="space-y-2 pt-2">
                   <label htmlFor="noteProgress" className="text-xs font-semibold text-gray-500 uppercase flex justify-between">
                     <span>Current Progress</span>
                     <span className="text-blue-600">{formData.progress}%</span>
                   </label>
                   <input 
                     type="range" 
                     id="noteProgress"
                     name="progress" 
                     min="0" 
                     max="100" 
                     value={formData.progress} 
                     onChange={handleChange} 
                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                   />
                </div>

                <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                  <input type="checkbox" id="reminderEnabled" name="reminderEnabled" checked={formData.reminderEnabled} onChange={(e) => setFormData(prev => ({...prev, reminderEnabled: e.target.checked}))} className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer" />
                  <label htmlFor="reminderEnabled" className="text-sm text-gray-700 font-medium cursor-pointer">Send email reminder 10 minutes before start</label>
                </div>
              </div>
            )}

            {/* Attachments Section */}
            <div className="border-t border-gray-100 pt-5 space-y-4">
              <span className="text-xs font-semibold text-gray-500 uppercase block">Attachments & Audio</span>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative">
                  <input type="file" id="file_upload" className="hidden" onChange={handleFileUpload} />
                  <label htmlFor="file_upload" className="flex items-center justify-center text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 rounded-lg px-4 py-2 cursor-pointer transition-colors shadow-sm">
                    {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Paperclip className="w-4 h-4 mr-2" />}
                    Upload File
                  </label>
                </div>
                
                <VoiceRecorder onRecordingComplete={handleVoiceUpload} />
              </div>

              {/* Display Attachments lists */}
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.attachments.map((url, i) => (
                   <a key={i} href={url} target="_blank" rel="noreferrer" className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 flex items-center rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors font-medium">
                     <Paperclip className="w-3.5 h-3.5 mr-1.5" /> Attached File {i+1}
                   </a>
                ))}
                {formData.voiceNotes.map((url, i) => (
                   <audio key={i} src={url} controls className="h-9 max-w-[200px] rounded-lg" />
                ))}
              </div>
            </div>

          </div>

          {/* Footer Submit */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-5 flex justify-end gap-3 rounded-b-xl transition-colors">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center disabled:opacity-50 shadow-sm">
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              {`Save ${formData.type}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;
