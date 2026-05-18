import Note from '../models/Note.js';

// @desc    Get all notes
// @route   GET /api/notes
// @access  Public
export const getNotes = async (req, res) => {
  try {
    const { type, priority, status, assignedPerson, search } = req.query;

    let query = {
      $and: [
        {
          $or: [
            { assignedBy: req.user._id },
            { 'assignedPerson.email': new RegExp(`^${req.user.email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
          ]
        }
      ]
    };

    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (status) query.status = status;
    
    if (assignedPerson) {
      query.$and.push({
        $or: [
          { 'assignedPerson.name': new RegExp(assignedPerson, 'i') },
          { 'assignedPerson.email': new RegExp(assignedPerson, 'i') }
        ]
      });
    }
    
    // Search is handled as text search if index exists, or regex on title/desc
    if (search) {
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const notes = await Note.find(query)
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a note
// @route   POST /api/notes
// @access  Public
export const createNote = async (req, res) => {
  try {
    const noteData = { ...req.body, assignedBy: req.user._id };
    if (noteData.type === 'Routine' && (!noteData.assignedPerson || !noteData.assignedPerson.email)) {
      noteData.assignedPerson = { name: req.user.name || 'User', email: req.user.email };
    }
    
    if (noteData.progress !== undefined) {
      noteData.datewiseProgress = [{ date: new Date().toISOString().split('T')[0], progress: noteData.progress }];
      if (noteData.progress === 100) {
        noteData.status = 'Completed';
      } else if (noteData.progress > 0) {
        noteData.status = 'In Progress';
      } else {
        noteData.status = 'Pending';
      }
    }

    const note = new Note(noteData);
    const createdNote = await note.save();
    res.status(201).json(createdNote);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Public
export const updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (note) {
      // Check authorization: user must be the creator, or assigned to the task
      const isCreator = note.assignedBy?.toString() === req.user._id.toString();
      const isAssigned = note.assignedPerson?.email?.toLowerCase() === req.user.email.toLowerCase();
      
      if (!isCreator && !isAssigned) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      Object.assign(note, req.body);
      
      const previousStatus = note.status;
      
      // Auto-calculate progress for Tasks with checklist
      if (note.type === 'Task' && note.checklist && note.checklist.length > 0) {
        const completedCount = note.checklist.filter(c => c.isCompleted).length;
        note.progress = Math.round((completedCount / note.checklist.length) * 100);
        // Track datewise progress since we auto-calculated it
        req.body.progress = note.progress; 
      }
      
      if (note.progress === 100) {
        note.status = 'Completed';
      } else if (note.progress > 0 && note.progress < 100) {
        note.status = 'In Progress';
      } else if (note.progress === 0) {
        note.status = 'Pending';
      }
      
      // Track datewise progress
      if (req.body.progress !== undefined) {
        const todayStr = new Date().toISOString().split('T')[0];
        const progArray = note.datewiseProgress || [];
        const existingEntryIndex = progArray.findIndex(dp => dp.date === todayStr);
        if (existingEntryIndex >= 0) {
          progArray[existingEntryIndex].progress = req.body.progress;
        } else {
          progArray.push({ date: todayStr, progress: req.body.progress });
        }
        note.datewiseProgress = progArray;
      }
      
      // If reminder date is changed and is in the future, reset reminderSent flag
      if (req.body.reminderDate) {
        if (new Date(req.body.reminderDate) > new Date()) {
          note.reminderSent = false;
        }
      }

      if (note.status === 'Completed' && !note.completedAt) {
        note.completedAt = new Date();
      } else if (note.status !== 'Completed') {
        note.completedAt = undefined;
      }

      const updatedNote = await note.save();
      
      // Sync with TaskMentor if it's a mentor task and just got completed
      if (updatedNote.status === 'Completed' && previousStatus !== 'Completed') {
        try {
          const { default: TaskMentorTask } = await import('../models/TaskMentorTask.js');
          const { default: TaskMentorProgress } = await import('../models/TaskMentorProgress.js');
          const { autoGenerateNextTask } = await import('./taskMentorController.js');
          
          const mentorTask = await TaskMentorTask.findOne({ note_id: updatedNote._id });
          if (mentorTask && mentorTask.status !== 'completed') {
             mentorTask.status = 'completed';
             await mentorTask.save();

             const progress = await TaskMentorProgress.findOne({ user_id: mentorTask.user_id });
             if (progress) {
                progress.current_day += 1;
                progress.last_active = new Date();
                progress.streak += 1;
                
                const todayStr = new Date().toISOString().split('T')[0];
                const lastCompletionStr = progress.last_task_completion_date 
                  ? new Date(progress.last_task_completion_date).toISOString().split('T')[0]
                  : null;
                  
                if (todayStr === lastCompletionStr) {
                  progress.tasks_completed_today += 1;
                } else {
                  progress.tasks_completed_today = 1;
                }
                progress.last_task_completion_date = new Date();
                await progress.save();
             }
             
             // Auto-generate next task in background
             autoGenerateNextTask(mentorTask.user_id).catch(err => console.error("Auto generation failed", err));
          }
        } catch (e) {
          console.error("Failed to sync task mentor from Note update:", e);
        }
      }

      res.json(updatedNote);
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Public
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (note) {
      // Check authorization: only the creator can delete? Or assigned person too?
      // Let's say only creator or assigned person.
      const isCreator = note.assignedBy?.toString() === req.user._id.toString();
      const isAssigned = note.assignedPerson?.email?.toLowerCase() === req.user.email.toLowerCase();
      
      if (!isCreator && !isAssigned) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      await note.deleteOne();
      res.json({ message: 'Note removed' });
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
