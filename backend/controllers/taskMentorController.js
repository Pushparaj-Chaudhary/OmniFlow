import User from '../models/User.js';
import TaskMentorRoadmap from '../models/TaskMentorRoadmap.js';
import TaskMentorTask from '../models/TaskMentorTask.js';
import TaskMentorNotification from '../models/TaskMentorNotification.js';
import TaskMentorProgress from '../models/TaskMentorProgress.js';
import Note from '../models/Note.js';
import { callAI, parseAIJSON } from '../services/aiService.js';

// @desc    Onboard user to Task Mentor
// @route   POST /api/taskmentor/onboard
// @access  Private
export const onboardUser = async (req, res) => {
  try {
    const { level, goal, daily_time } = req.body;
    const userId = req.user.id;

    // 1. Update User Profile
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { level, goal, daily_time, mentor_onboarded: true },
      { new: true }
    );
    
    // 2. Clear existing data for fresh start
    await TaskMentorRoadmap.deleteOne({ user_id: userId });
    await TaskMentorTask.deleteMany({ user_id: userId });
    
    // 3. Initialize/Reset Progress tracker
    await TaskMentorProgress.findOneAndUpdate(
      { user_id: userId },
      { current_day: 1, streak: 0, last_active: new Date() },
      { upsert: true, returnDocument: 'after' }
    );

    // 3. Generate Roadmap Part 1 (Weeks 1 & 2)

    const prompt = `You are an expert AI Adaptive Task Mentor.
Create the first half (Weeks 1 and 2) of a detailed learning roadmap for: Goal "${goal}", Level "${level}".
Each week must have exactly 4 topics.
For every topic, provide: title, description, subtasks, difficulty, estimated_time.
Output ONLY raw JSON matching: {"weeks": [{"week_number": 1, "title": "...", "topics": [{"title": "...", "description": "...", "subtasks": [], "difficulty": "...", "estimated_time": "..."}]}]}`;
    
    const resultText = await callAI(prompt);
    const roadmapData = parseAIJSON(resultText);

    await TaskMentorRoadmap.findOneAndUpdate(
      { user_id: userId },
      { weeks: roadmapData.weeks },
      { upsert: true }
    );

    res.json({ 
      message: "Successfully onboarded and roadmap generated.",
      user: updatedUser
    });
  } catch (error) {
    console.error("[TASK MENTOR] Onboarding/Roadmap Error:", error);
    res.status(500).json({ message: "Server error during onboarding" });
  }
};

// @desc    Get User's Roadmap
// @route   GET /api/taskmentor/roadmap
// @access  Private
export const getRoadmap = async (req, res) => {
  try {
    const roadmap = await TaskMentorRoadmap.findOne({ user_id: req.user.id });
    res.json(roadmap || null);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Save User Roadmap
// @route   POST /api/taskmentor/roadmap
// @access  Private
export const saveRoadmap = async (req, res) => {
  try {
    const { weeks } = req.body;
    let roadmap = await TaskMentorRoadmap.findOneAndUpdate(
      { user_id: req.user.id },
      { weeks },
      { returnDocument: 'after', upsert: true }
    );
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Helper function to auto-generate task for a user
export const autoGenerateNextTask = async (userId) => {
  const progress = await TaskMentorProgress.findOne({ user_id: userId });
  if (!progress) return null;

  const currentDay = progress.current_day;

  // Check Daily Limit
  const todayStr = new Date().toISOString().split('T')[0];
  const lastCompletionStr = progress.last_task_completion_date 
    ? new Date(progress.last_task_completion_date).toISOString().split('T')[0]
    : null;
    
  if (todayStr === lastCompletionStr && progress.tasks_completed_today >= 3) {
    return { limitReached: true, progress };
  }

  // Check if we already have a task for today
  let task = await TaskMentorTask.findOne({ user_id: userId, day_number: currentDay });
  if (task) return { task, progress };

  // Generate new task
  let roadmap = await TaskMentorRoadmap.findOne({ user_id: userId });
  if (!roadmap) {
    const user = await User.findById(userId);
    if (!user) return null;
    const prompt = `You are an expert AI Adaptive Task Mentor.
Create the first half (Weeks 1 and 2) of a detailed learning roadmap for: Goal "${user.goal}", Level "${user.level}".
Each week must have exactly 4 topics with full details (title, description, subtasks, difficulty, estimated_time).
Output ONLY raw JSON matching: {"weeks": [{"week_number": 1, "title": "...", "topics": [...]}]}`;
    const resultText = await callAI(prompt);
    const roadmapData = parseAIJSON(resultText);
    roadmap = await TaskMentorRoadmap.findOneAndUpdate(
      { user_id: userId },
      { weeks: roadmapData.weeks },
      { upsert: true, returnDocument: 'after' }
    );
  }

  const weekIndex = Math.floor((currentDay - 1) / 4);
  const topicIndex = (currentDay - 1) % 4;

  if (!roadmap.weeks[weekIndex]) {
    if (currentDay > 8) {
      const user = await User.findById(userId);
      const prompt = `You are an expert AI Adaptive Task Mentor.
Create the second half (Weeks 3 and 4) of the roadmap for: Goal "${user.goal}", Level "${user.level}".
Each week must have exactly 4 topics with full details (title, description, subtasks, difficulty, estimated_time).
Output ONLY raw JSON matching: {"weeks": [{"week_number": 3, "title": "...", "topics": [...]}]}`;
      const resultText = await callAI(prompt);
      const part2 = parseAIJSON(resultText);
      roadmap.weeks.push(...part2.weeks);
      await roadmap.save();
    } else {
      throw new Error("Roadmap data missing for this week");
    }
  }

  const weekData = roadmap.weeks[weekIndex];
  const topicData = weekData.topics[topicIndex];
  if (!topicData) throw new Error("Topic not found for today");

  const newTask = new TaskMentorTask({
    user_id: userId,
    day_number: currentDay,
    title: topicData.title,
    description: topicData.description,
    subtasks: topicData.subtasks,
    difficulty: topicData.difficulty,
    estimated_time: topicData.estimated_time,
    status: 'pending'
  });

  const priorityMap = { 'Easy': 'Low', 'Medium': 'Medium', 'Hard': 'High' };
  const linkedNote = new Note({
    title: `[AI] ${topicData.title}`,
    description: topicData.description,
    type: 'Task',
    priority: priorityMap[topicData.difficulty] || 'Medium',
    assignedBy: userId,
    status: 'Pending',
    checklist: (topicData.subtasks || []).map(text => ({ text, isCompleted: false }))
  });

  const savedNote = await linkedNote.save();
  newTask.note_id = savedNote._id;
  await newTask.save();

  return { task: newTask, progress };
};

// @desc    Get Today's Task (with Auto-Generation from Roadmap)
// @route   GET /api/taskmentor/tasks/today
// @access  Private
export const getTodayTask = async (req, res) => {
  try {
    const result = await autoGenerateNextTask(req.user.id);
    if (!result) {
      return res.status(404).json({ message: "Mentor profile not initialized.", status: "not_onboarded" });
    }
    
    if (result.limitReached) {
      return res.json({ limitReached: true, progress: result.progress });
    }

    res.json({ task: result.task, progress: result.progress });
  } catch (error) {
    console.error("[TASK MENTOR] Auto-Generate Task Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Save Today's Task
// @route   POST /api/taskmentor/tasks
// @access  Private
export const saveTask = async (req, res) => {
  try {
    const { subtasks, ...taskData } = req.body;
    
    // 1. Create the AI Mentor Task record
    const task = new TaskMentorTask({
      user_id: req.user.id,
      subtasks: subtasks || [],
      ...taskData,
    });

    // Map AI difficulty levels to Note priority levels
    const priorityMap = {
      'Easy': 'Low',
      'Medium': 'Medium',
      'Hard': 'High'
    };

    // 2. Create a corresponding regular Note/Task for the Task page
    const linkedNote = new Note({
      title: `[AI] ${taskData.title}`,
      description: taskData.description,
      type: 'Task',
      priority: priorityMap[taskData.difficulty] || 'Medium',
      assignedBy: req.user.id,
      status: 'Pending',
      checklist: (subtasks || []).map(text => ({ text, isCompleted: false }))
    });

    const savedNote = await linkedNote.save();
    
    // Link the note back to the mentor task
    task.note_id = savedNote._id;
    await task.save();

    res.json(task);
  } catch (error) {
    console.error("[TASK MENTOR] Save Task Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update Task Status (Complete/Skip)
// @route   POST /api/taskmentor/tasks/:id/status
// @access  Private
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'completed' or 'skipped'
    const task = await TaskMentorTask.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      { status },
      { returnDocument: 'after' }
    );

    if (!task) return res.status(404).json({ message: "Task not found" });

    // Sync with Linked Note if it exists
    if (task.note_id) {
      const noteUpdate = { status: status === 'completed' ? 'Completed' : 'Pending' };
      if (status === 'completed') noteUpdate.completedAt = new Date();
      
      await Note.findByIdAndUpdate(task.note_id, noteUpdate);
    }

    if (status === 'completed' || status === 'skipped') {
      const progress = await TaskMentorProgress.findOne({ user_id: req.user.id });
      if (progress) {
        progress.current_day += 1;
        progress.last_active = new Date();
        
        if (status === 'completed') {
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
        } else {
          progress.streak = 0;
        }
        await progress.save();
      }
    }

    res.json(task);
  } catch (error) {
    console.error("[TASK MENTOR] Update Status Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get task history
// @route   GET /api/taskmentor/tasks/history
// @access  Private
export const getTaskHistory = async (req, res) => {
  try {
    const tasks = await TaskMentorTask.find({ user_id: req.user.id, status: { $ne: 'pending' } }).sort({ day_number: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get Notifications
// @route   GET /api/taskmentor/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const notifications = await TaskMentorNotification.find({ user_id: req.user.id }).sort({ created_at: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete Task
// @route   DELETE /api/taskmentor/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const task = await TaskMentorTask.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Sync deletion with Linked Note
    if (task.note_id) {
      await Note.findByIdAndDelete(task.note_id);
    }

    await task.deleteOne();
    res.json({ message: "Task and linked note removed" });
  } catch (error) {
    console.error("[TASK MENTOR] Delete Task Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// @desc    Reset Mentor Roadmap and Progress
// @route   DELETE /api/taskmentor/roadmap
// @access  Private
export const resetRoadmap = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 1. Delete all mentor-related data
    await TaskMentorRoadmap.deleteOne({ user_id: userId });
    await TaskMentorTask.deleteMany({ user_id: userId });
    await TaskMentorProgress.deleteOne({ user_id: userId });
    
    // 2. Reset user onboarded flag
    await User.findByIdAndUpdate(userId, { mentor_onboarded: false });
    
    res.json({ message: "Roadmap and progress reset successfully" });
  } catch (error) {
    console.error("[TASK MENTOR] Reset Error:", error);
    res.status(500).json({ message: "Server error during reset" });
  }
};
