import Household from '../models/Household.js';
import User from '../models/User.js';
import crypto from 'crypto';

export const createHousehold = async (req, res) => {
  try {
    const { name, secretCode: customCode } = req.body;
    let secretCode;

    if (customCode) {
      secretCode = customCode.toUpperCase();
      const existing = await Household.findOne({ secretCode });
      if (existing) {
        return res.status(400).json({ message: 'Secret code already in use' });
      }
    } else {
      secretCode = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars hex
    }

    const household = new Household({
      name,
      secretCode,
      admin: req.user._id,
      members: [req.user._id]
    });

    await household.save();

    // Update user's active household
    await User.findByIdAndUpdate(req.user._id, { activeHousehold: household._id });

    res.status(201).json(household);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const joinHousehold = async (req, res) => {
  try {
    const { secretCode } = req.body;
    const household = await Household.findOne({ secretCode });

    if (!household) {
      return res.status(404).json({ message: 'Invalid secret code' });
    }

    if (household.members.includes(req.user._id)) {
      await User.findByIdAndUpdate(req.user._id, { activeHousehold: household._id });
      return res.json(household);
    }

    household.members.push(req.user._id);
    await household.save();

    // Update user's active household
    await User.findByIdAndUpdate(req.user._id, { activeHousehold: household._id });

    res.json(household);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

export const getHouseholdMembers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.activeHousehold) {
      return res.status(404).json({ message: 'No active household found' });
    }

    const household = await Household.findById(user.activeHousehold)
      .populate('members', 'name email avatar')
      .populate('virtualMembers', 'name email phone');

    if (!household) {
      return res.status(404).json({ message: 'Household data not found' });
    }

    res.json(household);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { memberId } = req.body;
    const user = await User.findById(req.user._id);
    const household = await Household.findById(user.activeHousehold);

    if (!household) {
      return res.status(404).json({ message: 'Household not found' });
    }

    if (household.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can remove members' });
    }

    if (memberId === household.admin.toString()) {
      return res.status(400).json({ message: 'Cannot remove the admin' });
    }

    household.members = household.members.filter(m => m.toString() !== memberId);
    await household.save();

    // Clear activeHousehold for the removed user
    await User.findByIdAndUpdate(memberId, { activeHousehold: null });

    res.json({ message: 'Member removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
