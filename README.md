# 🚀 OmniFlow – AI-Powered Productivity & Collaboration Ecosystem

OmniFlow is a state-of-the-art, full-stack productivity ecosystem that unifies note-taking, task tracking, routine planning, roommate chore rotation, split-billing ledger calculations, and adaptive AI-mentoring into a single, high-fidelity user interface. 

With interactive streak visualization, a floating Pomodoro deep-focus timer, and multi-household group collaboration, OmniFlow eliminates scattered tools, transforming productivity for both individuals and shared living spaces.

---

## 🌟 Core Modules & Advanced Features

### 1. 🤖 AI Adaptive Task Mentor (Llama 3.3 via Groq)
An adaptive, goal-oriented learning tutor that structures personalized education roadmaps.
* **Goal-Oriented Onboarding:** Custom tailors learning pathways based on goal parameters, target skill level (Beginner, Intermediate, Advanced), and daily time availability.
* **4-Week Adaptive Roadmap:** Automatically generates a detailed curriculum segmented into 2-week halves. Every topic includes detailed descriptions, subtask checklists, and custom difficulty ratings.
* **Checklist Note Syncing:** Every generated mentor task automatically creates a corresponding regular task complete with a synchronized interactive subtask checklist.
* **Strict Daily Burnout Limiter:** Limits users to completing 3 mentor tasks per day to guarantee structural, long-term learning pace and retention.

### 2. 📝 Intelligent Notes & Task Dashboard
A robust text editor and chore organizer featuring deep productivity analytics.
* **Groq LLM Enhancements:** One-click markdown summary creation, automated short-title generation, tone enhancement (conversational to highly professional), and checklists extracted from unformatted paragraphs.
* **Cloudinary Media Attachments:** High-speed uploads of attachments (Images, JPEGs, PNGs, PDFs) and Audio Voice Notes stored directly on Cloudinary Cloud Storage.
* **Flexible Organization:** Tag notes, tasks, and routines with category colors, priority levels (Low, Medium, High), and completion statuses.
* **Routine date-mapping:** Easily schedules daily routines, mapped directly onto interactive calendars.

### 3. 👥 Roommate & Flat Chore Manager
A shared household control center for roommates, families, and co-working groups.
* **Multi-Household Collaboration:** Create new households or join existing ones seamlessly via secure 6-character Invite Codes.
* **Dynamic & Virtual Members:** Supports both registered household members (Users) and virtual roommate subgroups (Groups) for comprehensive ledger entry assignments.
* **Chore & Duty Scheduler:** Create household duties with automated current assignee and next assignee tracking.
* **Expense Ledger & Smart Settle-Up:** Track shared roommate expenses with split-billing calculations. The system runs a simplified debt settlement algorithm showing exactly who owes whom, and the minimum amount required to settle up.

### 4. 📊 Analytics, Streaks & Focus Metrics
* **Dynamic Recharts Data:** Clean visualization dashboard showing completed vs. pending tasks.
* **Interactive Streaks:** Daily task streaks tracked with active fire indicator animations 🔥 to build consistency.
* **⏱️ Floating Pomodoro Focus Timer:** Interactive deep focus timer that floats over the entire screen, allowing sessions of undisturbed productivity.

---

## 🛠️ Technology Stack

### Frontend Architecture
* **Core:** React 19, Vite, React Router DOM 7 (Dynamic client routing)
* **Styling & UI:** Tailwind CSS 4.x (Modern utility styling), Lucide Icons
* **Charts & Scheduling:** Recharts, React Calendar, Date-fns, Moment.js

### Backend Architecture
* **Runtime & Framework:** Node.js (ES Modules / `"type": "module"`), Express 5.x
* **Database Layer:** MongoDB + Mongoose Object Modeling
* **Media Pipelines:** Multer & Multer-Storage-Cloudinary Integration
* **Automations:** Node-Cron (Dynamic scheduled background workflows)

### Core Integrations & APIs
* **Groq Cloud API:** Powering Llama 3.3 (`llama-3.3-70b-versatile`) for natural language tasks.
* **Brevo REST API:** Triggering direct SMTP transaction emails and verification alerts using Axios requests.
* **Cloudinary:** Storing attachments and voice notes securely.

---

## 📁 Project Architecture

```text
OmniFlow/
├── backend/
│   ├── config/             # Database connection setup (db.js)
│   ├── controllers/        # Core API logic (AI, Analytics, Auth, Group, Notes, Tasks)
│   ├── cron/               # Scheduled automation jobs (reminders & progress tasks)
│   ├── middleware/         # Auth verification, Cors headers, and request filters
│   ├── models/             # Mongoose schemas (Duties, Expenses, Groups, Progress, Roadmap)
│   ├── routes/             # Express API endpoints
│   ├── services/           # External service handlers (Groq AI client, Brevo REST email client)
│   ├── .env                # Backend local configurations
│   ├── server.js           # Server bootstrap and API registration
│   └── package.json
│
├── frontend/
│   ├── public/             # Static public assets
│   ├── src/
│   │   ├── assets/         # App icons & illustration vectors
│   │   ├── components/     # Reusable UI (DateNavbar, FocusTimer, MainLayout, NoteCard, VoiceRecorder)
│   │   ├── context/        # React Context stores (Auth state, theme preferences)
│   │   ├── pages/          # Full page modules (Dashboard, Reports, FlatManager, TaskMentor)
│   │   ├── services/       # Frontend API communication layer (api.js)
│   │   ├── utils/          # Date & text helper functions
│   │   ├── App.jsx         # App router and theme provider setup
│   │   └── main.jsx        # Client entrypoint
│   ├── .env                # Frontend environment config
│   ├── tailwind.config.js  # Custom UI tokens & colors
│   └── package.json
└── README.md
```

---

## ⚙️ Local Installation & Configuration

### 1. Clone & Prepare the Project
```bash
git clone https://github.com/your-username/omniflow.git
cd omniflow
```

### 2. Configure Backend Server
Navigate to the `backend` directory, install dependencies, and set up your variables:
```bash
cd backend
npm install
```

Create a `.env` file in `backend/` and include the following parameters:
```env
# Server Port & Database URI
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_signing_key

# Groq Cloud AI API
GROQ_API_KEY=your_groq_api_key_gsk_xxx
GROQ_MODEL=llama-3.3-70b-versatile  # Default fallback model

# Cloudinary Media Storage Configurations
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Brevo (Sendinblue) Transactional REST API Credentials
BREVO_API_KEY=your_brevo_xkeysib_api_key
BREVO_SENDER_EMAIL=your_sender_verified_email@gmail.com
EMAIL_USER=your_admin_email@gmail.com

# Client Origin (CORS validation)
FRONTEND_URL=http://localhost:5173
```

Start the backend API server (with Hot Reload):
```bash
npm run dev
```

### 3. Configure Frontend Client
Navigate to the `frontend` directory, install dependencies, and link the client API:
```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/` containing:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the local Vite development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173` to experience OmniFlow.

---

## 🤖 Scheduled Workflows & Background Automation
OmniFlow implements critical cron-driven tasks under `backend/cron/` running in the background to ensure progress is tracked continuously:

1. **8:00 AM Daily Task Email 📧 (`0 8 * * *`)**
   Finds all onboarded Task Mentor users and emails them their personalized Daily Task card containing specific details, estimated completion time, and a motivational message.
2. **Hourly Schedule Checker ⏱️ (`0 * * * *`)**
   Matches user-configured reminder times. If a daily task remains pending and has been active for more than 4 hours, it triggers an hourly nudge notification to the client.
3. **Midnight Adaptive Logic 🌙 (`0 0 * * *`)**
   Checks pending mentor tasks. If a task has been left incomplete for over 72 hours, the status is automatically transitioned to `"missed"`, the user's completion streak breaks, and the next task is loaded to prevent structural learning bottlenecks.
4. **Sunday 9:00 PM Weekly Scorecard 📊 (`0 21 * * 0`)**
   Triggers a weekly report calculating user task completion rates. If they completed fewer than the 4 expected topics for the week, it sends a progress scorecard email to keep them motivated.

---

## 🌍 Production Deployments
* **Frontend:** Configured with `vercel.json` for deployment on Vercel, redirecting client-side routing routes back to the Vite index.
* **Backend:** Easily hosted on platforms like Render or Fly.io. Ensure `FRONTEND_URL` in backend `.env` matches your deployed client link to permit secure CORS communication.