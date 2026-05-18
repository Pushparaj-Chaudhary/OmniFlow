import { callAI, parseAIJSON } from '../services/aiService.js';
import dotenv from 'dotenv';

dotenv.config();

// @desc    Summarize text
// @route   POST /api/ai/summarize
// @access  Public
export const summarizeText = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text is required' });

    const prompt = `Please summarize the following text concisely:\n\n${text}`;
    const result = await callAI(prompt);

    res.json({ result: result });
  } catch (error) {
    console.error("AI Summarize error:", error);
    res.status(500).json({ message: 'Error generating summary' });
  }
};

// @desc    Generate a title based on text
// @route   POST /api/ai/generate-title
// @access  Public
export const generateTitle = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text is required' });

    const prompt = `Provide a short, catchy title (maximum 6 words) for the following note content:\n\n${text}`;
    let title = await callAI(prompt);
    // Remove quotes if present
    title = title.replace(/^"|"$/g, '');

    res.json({ result: title });
  } catch (error) {
    console.error("AI Title error:", error);
    res.status(500).json({ message: 'Error generating title' });
  }
};

// @desc    Extract tasks from text
// @route   POST /api/ai/extract-tasks
// @access  Public
export const extractTasks = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text is required' });

    const prompt = `Extract a list of actionable tasks from the following text. Format the output as a clean bulleted list only, without extra introduction or conclusion:\n\n${text}`;
    const tasksText = await callAI(prompt);

    res.json({ result: tasksText });
  } catch (error) {
    console.error("AI Extract tasks error:", error);
    res.status(500).json({ message: 'Error extracting tasks' });
  }
};

// @desc    Enhance Note text
// @route   POST /api/ai/enhance
// @access  Public
export const enhanceNote = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text is required' });

    const prompt = `Please rewrite and enhance the following note to make it sound professional, clear, and well-structured. Only return the improved text without any introductory or concluding remarks:\n\n${text}`;
    const enhancedText = await callAI(prompt);

    res.json({ result: enhancedText });
  } catch (error) {
    console.error("AI Enhance error:", error);
    res.status(500).json({ message: 'Error enhancing text' });
  }
};

// @desc    Optimize daily schedule/routines
// @route   POST /api/ai/optimize-routine
// @access  Public
export const optimizeRoutine = async (req, res) => {
  try {
    const { routines } = req.body;
    if (!routines || !Array.isArray(routines)) return res.status(400).json({ message: 'Routines array is required' });

    const prompt = `You are a productivity expert. I am passing you my daily schedule of tasks/routines in JSON format. Please analyze this schedule for efficiency, point out any overlapping conflicts, suggest optimal reorganizations, and provide a small tip for improvement. Return your response in clear Markdown format without markdown code blocks framing the entire text itself.\n\nSchedule Data:\n${JSON.stringify(routines, null, 2)}`;
    
    const optimizationText = await callAI(prompt);

    res.json({ result: optimizationText });
  } catch (error) {
    console.error("AI Routine Optimizer error:", error);
    res.status(500).json({ message: 'Error analyzing routine' });
  }
};

// @desc    Generate a structured learning roadmap
// @route   POST /api/ai/generate-roadmap
// @access  Public
export const generateRoadmap = async (req, res) => {
  try {
    const { level, goal, daily_time, part } = req.body;
    if (!level || !goal) return res.status(400).json({ message: 'Level and goal are required' });

    const currentPart = part || 1;
    const isFirstPart = currentPart === 1;

    const prompt = `You are an expert AI Adaptive Task Mentor.
Create ${isFirstPart ? "the first half (Weeks 1 and 2)" : "the second half (Weeks 3 and 4)"} of a structured learning roadmap.
User Profile: Level "${level}", Goal "${goal}", Daily Time ${daily_time || 2} hours.

CRITICAL RULES:
1. Return exactly 2 weeks.
2. Each week must have exactly 4 topics.
3. For EVERY topic, you must provide:
   - title: Catchy topic name
   - description: 2-3 sentences explaining what to learn/do
   - subtasks: A list of 3-4 actionable steps
   - difficulty: "Easy", "Medium", or "Hard"
   - estimated_time: e.g., "1.5 hours"

Output must be ONLY raw JSON matching this structure:
{
  "weeks": [
    {
      "week_number": ${isFirstPart ? 1 : 3},
      "title": "Week Title",
      "topics": [
        {
          "title": "Topic 1",
          "description": "...",
          "subtasks": ["Step 1", "Step 2"],
          "difficulty": "Medium",
          "estimated_time": "2 hours"
        }
      ]
    }
  ]
}
Return ONLY raw JSON.`;


    const resultText = await callAI(prompt);
    
    try {
      const output = parseAIJSON(resultText);
      res.json(output);
    } catch (parseError) {
      console.error("[AI CONTROLLER] Deep Roadmap JSON parse failed:", parseError.message);
      res.status(500).json({ message: 'AI returned invalid data format' });
    }
  } catch (error) {
    console.error("AI Generate Roadmap error:", error);
    res.status(error.status || 500).json({ 
      message: 'Error generating roadmap', 
      error: error.message 
    });
  }
};

// @desc    Generate daily tasks for the user
// @route   POST /api/ai/generate-task
// @access  Public
export const generateTask = async (req, res) => {
  try {

    const { level, goal, daily_time, day_number, current_topics } = req.body;
    
    if (!level || !goal) {
      const missing = [];
      if (!level) missing.push('level');
      if (!goal) missing.push('goal');
      console.warn(`[AI CONTROLLER] Missing required fields: ${missing.join(', ')}`);
      return res.status(400).json({ 
        message: `Missing required profile data: ${missing.join(' and ')}. Please complete your mentor onboarding.`,
        missingFields: missing
      });
    }
    
    const prompt = `You are an expert AI Adaptive Task Mentor.
Create a daily task for Day ${day_number || 1} for a user (Level: ${level}, Goal: ${goal}, Daily Time: ${daily_time || 2} hours) who is currently focusing on these topics: ${current_topics ? current_topics.join(', ') : 'basics'}.
Your output must be strictly in JSON format matching this structure:
{
  "title": "Task title (e.g., Build a basic Express server)",
  "description": "Detailed description of what to do",
  "estimated_time": "Time in hours/minutes",
  "difficulty": "Easy" | "Medium" | "Hard",
  "motivational_message": "A short, encouraging sentence.",
  "subtasks": ["Step 1", "Step 2", "Step 3"]
}
Return only the raw JSON. Do not include markdown code block syntax.`;


    const resultText = await callAI(prompt);
    

    try {
      const output = parseAIJSON(resultText);
      res.json(output);
    } catch (parseError) {
      console.error("[AI CONTROLLER] Task JSON parse failed:", parseError.message);
      res.status(500).json({ 
        message: 'AI returned invalid task format', 
        details: parseError.message,
        raw: resultText.substring(0, 200)
      });
    }
  } catch (error) {
    console.error("AI Generate Task error:", error);
    const status = error.status || (error.response && error.response.status) || 500;
    res.status(status).json({ 
      message: 'Error generating task', 
      error: error.message,
      status: status
    });
  }
};
