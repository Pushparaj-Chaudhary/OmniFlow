# OmniFlow – AI-Powered Productivity Ecosystem

OmniFlow is a full-stack, AI-powered productivity platform that combines task management, note-taking, routines, collaboration, and analytics into one seamless workflow.

It transforms scattered tools into a single intelligent system for managing both personal and group productivity.

## Features

### Smart Productivity System
- Task & note management with tags, priorities, and media uploads
- Voice + file support with cloud storage

### Routine Scheduler
- Daily routine planner with date mapping
- Automated email reminders using cron jobs

### Group Collaboration
- Shared task assignments
- Expense tracking with smart settlement system

### Productivity Dashboard
- Streak tracking system 🔥
- Dynamic completion charts

### ⏱Pomodoro Timer
- Floating timer for deep focus sessions

### AI Integration
- Auto summarization
- Checklist extraction
- Smart title generation
- Daily schedule optimization


## 🛠️ Tech Stack

### Frontend
- React 18 (Vite)
- Tailwind CSS
- Lucide Icons
- Date-fns

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)

### Integrations
- Google Gemini AI
- Brevo (Email OTP & notifications)
- Cloudinary (Media storage)

## 📂 Project Structure

```text
OmniFlow/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── vite.config.js
```

## ⚙️ Installation & Setup

### 🔹 Clone Repository

```
git clone https://github.com/your-username/omniflow.git
cd omniflow
```

### 🔹 Backend Setup

```
cd backend
npm install
```

Create a `.env` file:

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLOUDINARY_API_KEY=your_key
BREVO_API_KEY=your_key
GEMINI_API_KEY=your_key
```

Run the server:

```
node server.js
```

### 🔹 Frontend Setup

```
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Run the frontend:

```bash
npm run dev
```