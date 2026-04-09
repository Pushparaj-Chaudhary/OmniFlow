import axios from 'axios';

let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Ensures that if the environment variable was set without the /api suffix, it gets appended automatically.
if (API_BASE_URL && !API_BASE_URL.endsWith('/api')) {
  API_BASE_URL = `${API_BASE_URL.replace(/\/$/, '')}/api`;
}

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const { token } = JSON.parse(storedUser);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const fetchNotes = (params) => api.get('/notes', { params });
export const createNote = (data) => api.post('/notes', data);
export const updateNote = (id, data) => api.put(`/notes/${id}`, data);
export const deleteNote = (id) => api.delete(`/notes/${id}`);

export const uploadAttachment = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload/attachment', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadVoice = (audioBlob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'voice.webm');
  return api.post('/upload/voice', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const aiSummarize = (text) => api.post('/ai/summarize', { text });
export const aiExtractTasks = (text) => api.post('/ai/extract-tasks', { text });
export const aiGenerateTitle = (text) => api.post('/ai/generate-title', { text });
export const aiEnhance = (text) => api.post('/ai/enhance', { text });
export const aiOptimizeRoutine = (routines) => api.post('/ai/optimize-routine', { routines });

// Auth routes
export const requestOtp = (data) => api.post('/auth/request-otp', data);
export const verifyOtp = (data) => api.post('/auth/verify-otp', data);
export const updateProfile = (data) => api.put('/auth/profile', data);

// FlatManager routes
export const getGroups = () => api.get('/flatmanager/groups');
export const createGroup = (data) => api.post('/flatmanager/groups', data);
export const deleteGroup = (id) => api.delete(`/flatmanager/groups/${id}`);

export const createHousehold = (data) => api.post('/household', data);
export const joinHousehold = (data) => api.post('/household/join', data);
export const getHouseholdMembers = () => api.get('/household/members');
export const removeMember = (memberId) => api.post('/household/remove-member', { memberId });

export const getDuties = (date) => api.get('/flatmanager/Duties', { params: { date } });
export const createDuty = (data) => api.post('/flatmanager/Duties', data);
export const updateDuty = (id, data) => api.put(`/flatmanager/Duties/${id}`, data);
export const deleteDuty = (id) => api.delete(`/flatmanager/Duties/${id}`);

export const getExpenses = () => api.get('/flatmanager/expenses');
export const createExpense = (data) => api.post('/flatmanager/expenses', data);
export const updateExpense = (id, data) => api.put(`/flatmanager/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/flatmanager/expenses/${id}`);
export const getMyHouseholds = () => api.get('/flatmanager/my-households');
export const switchHousehold = (id) => api.post(`/flatmanager/switch/${id}`);

export const getAnalytics = () => api.get('/notes/analytics');

// Reports Routes
export const getReportSummary = () => api.get('/reports/summary');
export const getReportPerformance = (params) => api.get('/reports/performance', { params });
export const getReportProductivity = () => api.get('/reports/productivity');
export const getReportPriorities = () => api.get('/reports/priorities');
export const getReportActivity = () => api.get('/reports/activity');
export const getReportInsights = () => api.get('/reports/insights');

export default api;
