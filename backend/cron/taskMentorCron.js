import cron from 'node-cron';
import User from '../models/User.js';
import TaskMentorTask from '../models/TaskMentorTask.js';
import TaskMentorNotification from '../models/TaskMentorNotification.js';
import TaskMentorProgress from '../models/TaskMentorProgress.js';
import { sendEmail } from '../services/emailService.js';

export const startTaskMentorCron = () => {
  // 8 AM: Send daily task email (For now running every hour for testing, adjust as needed)
  cron.schedule('0 8 * * *', async () => {
    console.log("Running 8 AM Daily Task Job");
    try {
      const activeUsers = await User.find({ mentor_onboarded: true });
      
      const results = await Promise.allSettled(activeUsers.map(async (user) => {
        const progress = await TaskMentorProgress.findOne({ user_id: user._id });
        if (!progress) return;

        const task = await TaskMentorTask.findOne({ user_id: user._id, day_number: progress.current_day });
        if (task && task.status === 'pending') {
          // Send Email
          const html = `<h2>Today's Task: ${task.title}</h2><p>${task.description}</p><p><i>${task.motivational_message}</i></p>`;
          await sendEmail(user.email, "Your Daily OmniFlow Task", html);

          // Add In-App Notification
          await TaskMentorNotification.create({
            user_id: user._id,
            message: `New daily task available: ${task.title}`,
          });
        }
      }));

      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) {
        console.error(`8 AM Job partially failed: ${failed.length} users failed.`);
      }
    } catch (error) {
      console.error("Cron Error (8 AM):", error);
    }
  });

  // Dynamic Reminder Job: Runs every hour to check user-specific schedules
  cron.schedule('0 * * * *', async () => {
    const currentHour = new Date().getHours().toString().padStart(2, '0') + ':00';

    
    try {
      // Find users whose reminder time matches the current hour (e.g., '20:00')
      const activeUsers = await User.find({ 
        mentor_onboarded: true,
        mentor_reminder_time: currentHour 
      });
      
      if (activeUsers.length === 0) return;



      const results = await Promise.allSettled(activeUsers.map(async (user) => {
        const progress = await TaskMentorProgress.findOne({ user_id: user._id });
        if (!progress) return;
        
        const task = await TaskMentorTask.findOne({ user_id: user._id, day_number: progress.current_day });
        if (task && task.status === 'pending') {
          const hoursSinceCreated = (Date.now() - new Date(task.createdAt).getTime()) / (1000 * 60 * 60);
          
          // Only remind if the task was created at least 4 hours ago and is still pending
          if (hoursSinceCreated >= 4) {
            const html = `<h2>Reminder: ${task.title}</h2><p>Don't forget to complete your task for today!</p><p><i>Your AI Mentor is watching your progress.</i></p>`;
            await sendEmail(user.email, "Reminder: OmniFlow Task Pending", html);
            await TaskMentorNotification.create({
              user_id: user._id,
              message: `Reminder: You have a pending task - ${task.title}`,
            });
          }
        }
      }));

      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) {
        console.error(`[CRON] Hourly Reminder Job partially failed: ${failed.length} users failed.`);
      }
    } catch (error) {
      console.error("[CRON] Error in Hourly Dynamic Reminders:", error);
    }
  });

  // Midnight: Adaptive Logic (Missed tasks > 72 hrs)
  cron.schedule('0 0 * * *', async () => {
    console.log("Running Midnight Adaptive Task Job");
    try {
      const activeUsers = await User.find({ mentor_onboarded: true });
      
      const results = await Promise.allSettled(activeUsers.map(async (user) => {
        const progress = await TaskMentorProgress.findOne({ user_id: user._id });
        if (!progress) return;
        
        const task = await TaskMentorTask.findOne({ user_id: user._id, day_number: progress.current_day });
        if (task && task.status === 'pending') {
          const hoursSinceCreated = (Date.now() - new Date(task.createdAt).getTime()) / (1000 * 60 * 60);

          if (hoursSinceCreated >= 72) {
            // Mark as missed
            task.status = 'missed';
            await task.save();

            // Advance day to unblock user but break streak
            await TaskMentorProgress.findOneAndUpdate(
              { user_id: user._id },
              { $inc: { current_day: 1 }, streak: 0 }
            );

            await TaskMentorNotification.create({
              user_id: user._id,
              message: `Task missed automatically: ${task.title}. Move on to the next one!`,
            });
          }
        }
      }));

      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) {
        console.error(`Midnight Job partially failed: ${failed.length} users failed.`);
      }
    } catch (error) {
      console.error("Cron Error (Midnight):", error);
    }
  });
  // Sunday 9 PM: Weekly Progress Check
  cron.schedule('0 21 * * 0', async () => {
    console.log("[CRON] Running Weekly Progress Check");
    try {
      const activeUsers = await User.find({ mentor_onboarded: true });
      
      await Promise.allSettled(activeUsers.map(async (user) => {
        const progress = await TaskMentorProgress.findOne({ user_id: user._id });
        if (!progress) return;

        // Current week calculation (1-4)
        const currentWeek = Math.ceil(progress.current_day / 4);
        
        // Find tasks completed this week
        const startDay = (currentWeek - 1) * 4 + 1;
        const endDay = startDay + 3;

        const completedCount = await TaskMentorTask.countDocuments({
          user_id: user._id,
          day_number: { $gte: startDay, $lte: endDay },
          status: 'completed'
        });

        if (completedCount < 4) {
          const html = `<h2>Weekly Progress Update</h2>
            <p>You've completed <b>${completedCount}/4</b> topics for Week ${currentWeek}.</p>
            <p>Don't fall behind! Finish your weekly topics to stay on track with your goal: <b>${user.goal}</b></p>`;
          
          await sendEmail(user.email, "OmniFlow: Your Weekly Learning Progress", html);
          await TaskMentorNotification.create({
            user_id: user._id,
            message: `Weekly Check: ${completedCount}/4 topics completed. Keep going!`,
          });
        }
      }));
    } catch (error) {
      console.error("[CRON] Weekly Progress Check Error:", error);
    }
  });
};
