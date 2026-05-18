import cron from 'node-cron';
import { sendEmail } from '../services/emailService.js';
import Note from '../models/Note.js';
import dotenv from 'dotenv';

dotenv.config();


const startCron = () => {
  // Run every minute
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      // Find notes where reminderDate is < now and reminderSent is false
      // Also ensure assignedPerson and email exist
      const notesToRemind = await Note.find({
        reminderDate: { $lte: now, $ne: null },
        reminderSent: false,
        'assignedPerson.email': { $exists: true, $ne: '' }
      });

      if (notesToRemind.length > 0) {


        const results = await Promise.allSettled(notesToRemind.map(async (note) => {
          const subject = `Reminder: ${note.title}`;
          const htmlContent = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #4f46e5; text-align: center;">Task Reminder</h2>
              <p>Hi ${note.assignedPerson.name || 'there'},</p>
              <p>This is a reminder for your task:</p>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">${note.title}</h3>
                <p>${note.description || 'No description provided.'}</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}" style="display:inline-block;padding:12px 24px;background-color:#4f46e5;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">Open OmniFlow App</a>
              </div>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #9ca3af; text-align: center;">OmniFlow - Your Productivity Partner</p>
            </div>
          `;
          const textContent = `Reminder: ${note.title}\n${note.description}\n\nView your task at ${process.env.FRONTEND_URL}`;

          await sendEmail(note.assignedPerson.email, subject, htmlContent, textContent);



          // Mark as sent
          note.reminderSent = true;
          await note.save();
        }));

        const failed = results.filter(r => r.status === 'rejected');
        if (failed.length > 0) {
          console.error(`Reminder job partially failed: ${failed.length} reminders failed.`);
        }
      }
    } catch (error) {
      console.error("Cron Job Error:", error);
    }
  });

  console.log("Reminder Cron Job Initialized");
};

export default startCron;
