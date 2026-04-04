# Omniflow (Everything Smooth Productivity)

Omniflow is a comprehensive, AI-enhanced life management and productivity engine. What began as a simple "Smart Notes" application has evolved into a robust ecosystem consolidating everything you need into one fluid workflow constraint.

We highly suggest the name **Omniflow** because it effectively manages the *flow* of everything: Tasks, Focus Timers, Roommate dynamics, Expense tracking, and artificial intelligence optimizations. 

## 🚀 Key Features

* **Advanced Task & Note System**: Complete CRUD capabilities overlaid with tags, prioritizations, and integrated file/voice memo uploads natively stored in cloud data structures.
* **Intelligent Routine Matrix**: Date-mapped, day-wise routine configurations complete with integrated automated pre-start email reminders (via node-cron).
* **Group Ecosystem**: Built-in group manager dashboard handling communal duty assignments and an algorithmic expense settlement overview.
* **Productivity Tracker**: Auto-calculating `Streak` counters and dynamic workflow completion percentage charts natively displayed on the dashboard.
* **Pomodoro Engine**: Nested, fully floating visual timer constraint that keeps deep-work logic accessible instantly.
* **Gemini AI Core**: Server-side Google Generative AI integration acting natively to auto-summarize, extract checklists, write optimized titles, and aggressively organize user daily schedules.

---

## 🛠️ Tech Stack & Architecture
- **Frontend Layer**: React 18, Vite JS, Tailwind CSS v4, Lucide Icons, Date-Fns
- **Backend Infrastructure**: Node.js, Express framework, MongoDB (Mongoose Schema)
- **External Dependencies**: Google Gemini AI (gen-ai), Brevo (SibApiV3Sdk for OTPs and Reminders), Cloudinary (blob uploads)

---

## 📂 Project Structure

```text
Omniflow/
├── backend/                  # Node.js / Express API Layer
│   ├── controllers/          # Business logic (Duties, Expenses, Auth)
│   ├── models/               # Mongoose DB schemas
│   ├── routes/               # API endpoint definitions
│   └── server.js             # Main entry point & DB connection
└── frontend/                 # React / Vite Client Layer
    ├── src/
    │   ├── components/       # Reusable UI elements (Navigation, NoteCard)
    │   ├── context/          # Global state (AuthContext)
    │   ├── pages/            # View components (Dashboard, Group Manager)
    │   └── services/         # Axios API handlers
    └── vite.config.js        # Build configurations
```

---

## 🌍 Production Deployment Guide

Omniflow is designed as an isolated twin-architecture repository. It requires a backend Node environment and a statically generated frontend environment.

### Backend Setup
1. Define environmental variables in `backend/.env` (MongoDB URI, JWT Secret, Cloudinary API keys, Brevo SMTP keys, Gemini API).
2. Set up the launch script context for your hosting provider to execute `node server.js`.
3. Ensure CORS policies accept production frontend domains.

### Frontend Setup
1. Define the `VITE_API_URL` matching your deployed backend URL.
2. Run `npm run build` in the `frontend` directory.
3. Deploy the resulting `/dist` folder to your static hosting provider (e.g. Vercel, Netlify, Render).