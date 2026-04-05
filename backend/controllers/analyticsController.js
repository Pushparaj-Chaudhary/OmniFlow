import Note from '../models/Note.js';

export const getAnalytics = async (req, res) => {
  try {
    const notes = await Note.find({ assignedBy: req.user._id }).sort({ 'createdAt': 1 }).lean();
    
    let totalCompleted = 0;
    let totalTasks = 0;
    
    // For streaks: dates with at least one completed task.
    const completedDates = new Set();
    
    notes.forEach(note => {
      // Exclude simple notes, only Routines
      if (note.type === 'Routine') {
         totalTasks++;
         if (note.status === 'Completed') {
            totalCompleted++;
            completedDates.add(new Date(note.updatedAt || note.createdAt).toISOString().split('T')[0]);
         }
      }
    });

    const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
    
    const sortedDates = Array.from(completedDates).sort();
    
    let currentStreak = 0;
    let todayDateStr = new Date().toISOString().split('T')[0];
    let yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    let yesterdayDateStr = yesterdayDate.toISOString().split('T')[0];

    // Find the latest streak logic
    let checkDateStr = sortedDates.includes(todayDateStr) ? todayDateStr : (sortedDates.includes(yesterdayDateStr) ? yesterdayDateStr : null);
    
    if (checkDateStr) {
       currentStreak = 1;
       let checkDate = new Date(checkDateStr);
       while(true) {
         checkDate.setDate(checkDate.getDate() - 1);
         let prevDateStr = checkDate.toISOString().split('T')[0];
         if (sortedDates.includes(prevDateStr)) {
            currentStreak++;
         } else {
            break;
         }
       }
    }

    res.json({ currentStreak, completionRate, totalCompleted, totalTasks });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics' });
  }
};
