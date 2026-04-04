import cron from 'node-cron';
import axios from 'axios';
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
        console.log(`Found ${notesToRemind.length} notes for reminders.`);

        for (let note of notesToRemind) {
          try {
            await axios.post(
              'https://api.brevo.com/v3/smtp/email',
              {
                sender: {
                  name: 'Omniflow App',
                  email: process.env.EMAIL_USER   // ❗ must be verified in Brevo
                },
                to: [
                  {
                    email: note.assignedPerson.email,
                    name: note.assignedPerson.name || 'User'
                  }
                ],
                subject: `Reminder: ${note.title}`,

                // ✅ ADD HTML CONTENT (important)
                htmlContent: `
      <h2>Reminder: ${note.title}</h2>
      <p>Hi ${note.assignedPerson.name || 'there'},</p>
      <p>This is a reminder for your task.</p>
      <p><b>Description:</b> ${note.description}</p>
      <br/>
      <p>You can view the full note and update its status in the Smart Notes App. If you don't have an account yet, <a href="${process.env.FRONTEND_URL}/login">register here</a> to get started!</p>
      <br/>
      <a href="${process.env.FRONTEND_URL}" style="display:inline-block;padding:10px 20px;background-color:#4f46e5;color:#fff;text-decoration:none;border-radius:5px;">Open NotieFy App</a>
      <br/><br/>
      <p>Regards,<br/>NotieFy App</p>
    `,

                // optional fallback
                textContent: `Reminder: ${note.title}\n${note.description}\n\nView and update your task at ${process.env.FRONTEND_URL}`
              },
              {
                headers: {
                  'api-key': process.env.BREVO_API_KEY,
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                }
              }
            );

            console.log(`Reminder email sent via Brevo to ${note.assignedPerson.email} for note ${note._id}`);

            // Mark as sent
            note.reminderSent = true;
            await note.save();
          } catch (apiError) {
            console.error(`Failed to send email via Brevo for note ${note._id}`, apiError.response ? apiError.response.data : apiError.message);
            // Assuming not crashing the whole loop if one email fails
          }
        }
      }
    } catch (error) {
      console.error("Cron Job Error:", error);
    }
  });

  console.log("Reminder Cron Job Initialized");
};

export default startCron;
