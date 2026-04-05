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
