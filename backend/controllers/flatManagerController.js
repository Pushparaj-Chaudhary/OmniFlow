import Group from '../models/Group.js';
import Duty from '../models/Duty.js';
import Expense from '../models/Expense.js';
import Household from '../models/Household.js';
import User from '../models/User.js';

// Groups (Roommates)
export const getGroups = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.activeHousehold) return res.json([]);
    
    // Get both dynamic members (Users) and virtual members (Groups)
    const household = await Household.findById(user.activeHousehold)
      .populate('members', 'name email avatar')
      .populate('virtualMembers');

    if (!household) return res.json([]);
    
    // Format them for the frontend dropdowns
    const dynamic = (household.members || [])
      .filter(m => m !== null)
      .map(m => ({ _id: m._id, name: m.name, type: 'User' }));

    const virtual = (household.virtualMembers || [])
      .filter(v => v !== null)
      .map(v => ({ _id: v._id, name: v.name, type: 'Group' }));
    
    res.json([...dynamic, ...virtual]);
  } catch (err) { 
    console.error('getGroups error:', err);
    res.status(500).json({ error: err.message }); 
  }
};

export const createGroup = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.activeHousehold) return res.status(400).json({ message: 'Join a household first' });

    const newGroup = new Group({ ...req.body, createdBy: req.user._id });
    const saved = await newGroup.save();
    
    // Add to household's virtual members
    await Household.findByIdAndUpdate(user.activeHousehold, {
      $push: { virtualMembers: saved._id }
    });
    
    res.status(201).json(saved);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    
    // Only creator or household admin can delete virtual members
    const result = await Group.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!result) return res.status(403).json({ message: 'Not authorized' });
    
    const user = await User.findById(req.user._id);
    await Household.findByIdAndUpdate(user.activeHousehold, {
      $pull: { virtualMembers: req.params.id }
    });

    res.json({ message: 'Group removed' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateGroup = async (req, res) => {
  try {
    const group = await Group.findOneAndUpdate({ _id: req.params.id, createdBy: req.user._id }, req.body, { new: true });
    if (!group) return res.status(404).json({ message: 'Group not found or unauthorized' });
    res.json(group);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Duties
export const getDuties = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.activeHousehold) return res.json([]);

    let filter = { household: user.activeHousehold };
    if (req.query.date) {
        const queryDate = new Date(req.query.date);
        const nextDay = new Date(queryDate);
        nextDay.setDate(queryDate.getDate() + 1);
        filter.date = { $gte: queryDate, $lt: nextDay };
    }
    const Duties = await Duty.find(filter).populate('currentAssignee nextAssignee').sort({ createdAt: -1 }).lean();
    res.json(Duties);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const createDuty = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.activeHousehold) return res.status(400).json({ message: 'Join a household first' });

    const dutyData = { 
      ...req.body, 
      createdBy: req.user._id,
      household: user.activeHousehold
    };

    const newDuty = new Duty(dutyData);
    const saved = await newDuty.save();
    const populated = await Duty.findById(saved._id).populate('currentAssignee nextAssignee');
    res.status(201).json(populated);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

export const updateDuty = async (req, res) => {
  try {
    const duty = await Duty.findOneAndUpdate({ _id: req.params.id, createdBy: req.user._id }, req.body, { new: true }).populate('currentAssignee nextAssignee');
    if (!duty) return res.status(404).json({ message: 'Duty not found or unauthorized' });
    res.json(duty);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const deleteDuty = async (req, res) => {
  try {
    const result = await Duty.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!result) return res.status(404).json({ message: 'Duty not found or unauthorized' });
    res.json({ message: 'Duty removed' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Expenses
export const getExpenses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.activeHousehold) return res.json([]);

    const expenses = await Expense.find({ household: user.activeHousehold })
      .populate('paidBy')
      .sort({ date: -1 })
      .lean();
    res.json(expenses);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const createExpense = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.activeHousehold) return res.status(400).json({ message: 'Join a household first' });

    const household = await Household.findById(user.activeHousehold);
    const isAdmin = household.admin.toString() === req.user._id.toString();

    const expenseData = { 
      ...req.body, 
      createdBy: req.user._id,
      household: user.activeHousehold
    };

    // Auto-attribute if not admin or if paidBy is not provided
    if (!isAdmin || !req.body.paidBy) {
      expenseData.paidBy = req.user._id;
      expenseData.paidByType = 'User';
    } else {
      // Admin provided paidBy and paidByType
      expenseData.paidBy = req.body.paidBy;
      expenseData.paidByType = req.body.paidByType || 'Group';
    }

    const newExpense = new Expense(expenseData);
    const saved = await newExpense.save();
    const populated = await Expense.findById(saved._id).populate('paidBy');
    res.status(201).json(populated);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Only creator can update
    if (expense.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this expense' });
    }

    const { description, amount, paidBy, paidByType, date, photoUrl } = req.body;

    const updated = await Expense.findByIdAndUpdate(
      id,
      {
        description: description || expense.description,
        amount: amount ? Number(amount) : expense.amount,
        paidBy: paidBy || expense.paidBy,
        paidByType: paidByType || expense.paidByType,
        date: date || expense.date,
        photoUrl: photoUrl || expense.photoUrl
      },
      { new: true }
    ).populate('paidBy');

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    // Only creator can delete
    const result = await Expense.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!result) return res.status(403).json({ message: 'Not authorized to delete this expense' });
    res.json({ message: 'Expense removed' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Households (Multi-group support)
export const getMyHouseholds = async (req, res) => {
  try {
    const households = await Household.find({ members: req.user._id })
      .select('name secretCode admin')
      .sort('-createdAt');
    res.json(households);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const switchActiveHousehold = async (req, res) => {
  try {
    const { id } = req.params;
    const household = await Household.findById(id);

    if (!household) {
      return res.status(404).json({ message: 'Household not found' });
    }

    if (!household.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    await User.findByIdAndUpdate(req.user._id, { activeHousehold: id });
    res.json({ message: 'Switched successfully', household });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
