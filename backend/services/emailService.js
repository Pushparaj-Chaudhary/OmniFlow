import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'noreply@omniflow.local';

export const sendEmail = async (to, subject, htmlContent, textContent = "") => {
  if (!BREVO_API_KEY) {
    console.warn("[EMAIL SERVICE] BREVO_API_KEY is not set. Email will not be sent.");
    return false;
  }
  if (!process.env.BREVO_SENDER_EMAIL) {
    console.warn("[EMAIL SERVICE] BREVO_SENDER_EMAIL is not set. Using default: " + SENDER_EMAIL);
  }
  
  const startTime = Date.now();
  try {
    const data = {
      sender: { name: "OmniFlow", email: SENDER_EMAIL },
      to: [{ email: to }],
      subject: subject,
      htmlContent: htmlContent,
    };
    
    if (textContent) data.textContent = textContent;

    const response = await axios.post("https://api.brevo.com/v3/smtp/email", data, {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      }
    });
    
    const duration = Date.now() - startTime;
    console.log(`[EMAIL SERVICE] Email sent to ${to} in ${duration}ms`);
    return response.data;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[EMAIL SERVICE] Email send failed after ${duration}ms:`, error.response?.data || error.message);
    return false;
  }
};
