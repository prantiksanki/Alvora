const Goal = require('../models/Goal');
const asyncHandler = require('../utils/asyncHandler');

const getGoals = asyncHandler(async (req, res) => {
  const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
  res.status(200).json(goals);
});

const createGoal = asyncHandler(async (req, res) => {
  const { title, platform, unit, current, target, deadline, status } = req.body;

  if (!title || !platform || !unit || target === undefined) {
    return res.status(400).json({ message: 'title, platform, unit and target are required' });
  }

  const goal = await Goal.create({
    userId: req.user._id,
    title,
    platform,
    unit,
    current: Number(current) || 0,
    target: Number(target),
    deadline: deadline || null,
    status: status || 'active',
  });

  res.status(201).json(goal);
});

const updateGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
  if (!goal) return res.status(404).json({ message: 'Goal not found' });

  const { title, platform, unit, current, target, deadline, status } = req.body;
  if (title !== undefined) goal.title = title;
  if (platform !== undefined) goal.platform = platform;
  if (unit !== undefined) goal.unit = unit;
  if (current !== undefined) goal.current = Number(current);
  if (target !== undefined) goal.target = Number(target);
  if (deadline !== undefined) goal.deadline = deadline || null;
  if (status !== undefined) goal.status = status;

  await goal.save();
  res.status(200).json(goal);
});

const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!goal) return res.status(404).json({ message: 'Goal not found' });
  res.status(200).json({ message: 'Goal deleted' });
});

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };
