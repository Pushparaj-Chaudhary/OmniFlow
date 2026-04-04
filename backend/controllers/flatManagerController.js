import Group from '../models/Group.js';
import Duty from '../models/Duty.js';
import Expense from '../models/Expense.js';

// Groups
export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ createdBy: req.user._id });
    res.json(groups);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const createGroup = async (req, res) => {
  try {
    const newGroup = new Group({ ...req.body, createdBy: req.user._id });
    const saved = await newGroup.save();
    res.status(201).json(saved);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

export const deleteGroup = async (req, res) => {
  try {
    const result = await Group.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!result) return res.status(404).json({ message: 'Group not found' });
    res.json({ message: 'Group removed' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateGroup = async (req, res) => {
  try {
    const group = await Group.findOneAndUpdate({ _id: req.params.id, createdBy: req.user._id }, req.body, { new: true });
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Duties
export const getDuties = async (req, res) => {
  try {
    let filter = { createdBy: req.user._id };
    if (req.query.date) {
        const queryDate = new Date(req.query.date);
        const nextDay = new Date(queryDate);
        nextDay.setDate(queryDate.getDate() + 1);
        filter.date = { $gte: queryDate, $lt: nextDay };
    }
    const Duties = await Duty.find(filter).populate('currentAssignee nextAssignee').sort({ createdAt: -1 });
    res.json(Duties);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const createDuty = async (req, res) => {
  try {
    const newDuty = new Duty({ ...req.body, createdBy: req.user._id });
    const saved = await newDuty.save();
    const populated = await Duty.findById(saved._id).populate('currentAssignee nextAssignee');
    res.status(201).json(populated);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

export const updateDuty = async (req, res) => {
  try {
    const duty = await Duty.findOneAndUpdate({ _id: req.params.id, createdBy: req.user._id }, req.body, { new: true }).populate('currentAssignee nextAssignee');
    if (!duty) return res.status(404).json({ message: 'Duty not found' });
    res.json(duty);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const deleteDuty = async (req, res) => {
  try {
    const result = await Duty.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!result) return res.status(404).json({ message: 'Duty not found' });
    res.json({ message: 'Duty removed' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Expenses
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ createdBy: req.user._id }).populate('paidBy').sort({ date: -1 });
    res.json(expenses);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const createExpense = async (req, res) => {
  try {
    const newExpense = new Expense({ ...req.body, createdBy: req.user._id });
    const saved = await newExpense.save();
    const populated = await Expense.findById(saved._id).populate('paidBy');
    res.status(201).json(populated);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

export const deleteExpense = async (req, res) => {
  try {
    const result = await Expense.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!result) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense removed' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
