import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'fake_key');

// Get the generative model
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// @desc    Summarize text
// @route   POST /api/ai/summarize
// @access  Public
export const summarizeText = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text is required' });

    const prompt = `Please summarize the following text concisely:\n\n${text}`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.json({ result: responseText });
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
    const result = await model.generateContent(prompt);
    let title = result.response.text().trim();
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
    const result = await model.generateContent(prompt);
    const tasksText = result.response.text().trim();

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
    const result = await model.generateContent(prompt);
    const enhancedText = result.response.text().trim();

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
    
    const result = await model.generateContent(prompt);
    const optimizationText = result.response.text().trim();

    res.json({ result: optimizationText });
  } catch (error) {
    console.error("AI Routine Optimizer error:", error);
    res.status(500).json({ message: 'Error analyzing routine' });
  }
};
