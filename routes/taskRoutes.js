const express = require('express');
const Task = require('../models/task');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Create task (only authenticated)
router.post('/', authenticate, async (req,res)=>{
  try{
    const { title, description, dueDate, priority, assignedTo } = req.body;
    if(!title || !assignedTo) return res.status(400).json({ message: 'title and assignedTo required' });
    // ensure assigned user exists
    const assignee = await User.findById(assignedTo);
    if(!assignee) return res.status(400).json({ message: 'Assigned user not found' });
    const task = await Task.create({
      title, description, dueDate, priority, assignedTo, createdBy: req.user._id
    });
    res.status(201).json(task);
  }catch(err){ console.error(err); res.status(500).json({ message:'Server error' }); }
});

// Get paginated tasks for logged-in user (supports page & limit & search & priority filter)
router.get('/', authenticate, async (req,res)=>{
  try{
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page-1)*limit;
    const priority = req.query.priority; // optional
    const status = req.query.status;
    const q = req.query.q;

    const filter = { assignedTo: req.user._id };
    if(priority) filter.priority = priority;
    if(status) filter.status = status;
    if(q) filter.title = { $regex: q, $options: 'i' };

    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter)
      .sort({ dueDate: 1, createdAt: -1 })
      .skip(skip).limit(limit)
      .populate('assignedTo', 'name email')
      .exec();

    res.json({ tasks, page, limit, totalPages: Math.ceil(total/limit), total });
  }catch(err){ console.error(err); res.status(500).json({ message:'Server error' }); }
});

// Get task by id (only for assigned user or creator)
router.get('/:id', authenticate, async (req,res)=>{
  try{
    const task = await Task.findById(req.params.id).populate('assignedTo', 'name email');
    if(!task) return res.status(404).json({ message:'Task not found' });
    // only assigned or createdBy can view
    if(!task.assignedTo._id.equals(req.user._id) && !(task.createdBy && task.createdBy.equals(req.user._id))) {
      return res.status(403).json({ message:'Not authorized' });
    }
    res.json(task);
  }catch(err){ console.error(err); res.status(500).json({ message:'Server error' }); }
});

// Update task
router.put('/:id', authenticate, async (req,res)=>{
  try{
    const task = await Task.findById(req.params.id);
    if(!task) return res.status(404).json({ message:'Task not found' });
    // only creator or assigned user can update
    if(!(task.createdBy && task.createdBy.equals(req.user._id)) && !task.assignedTo.equals(req.user._id)) {
      return res.status(403).json({ message:'Not authorized to update' });
    }
    const { title, description, dueDate, priority, status, assignedTo } = req.body;
    if(assignedTo){
      const assignee = await User.findById(assignedTo);
      if(!assignee) return res.status(400).json({ message:'Assigned user not found' });
      task.assignedTo = assignedTo;
    }
    if(title !== undefined) task.title = title;
    if(description !== undefined) task.description = description;
    if(dueDate !== undefined) task.dueDate = dueDate;
    if(priority !== undefined) task.priority = priority;
    if(status !== undefined) task.status = status;
    await task.save();
    res.json(task);
  }catch(err){ console.error(err); res.status(500).json({ message:'Server error' }); }
});

// Delete (with confirmation done on frontend)
router.delete('/:id', authenticate, async (req,res)=>{
  try{
    const task = await Task.findById(req.params.id);
    if(!task) return res.status(404).json({ message:'Task not found' });
    // only creator or assigned user can delete
    if(!(task.createdBy && task.createdBy.equals(req.user._id)) && !task.assignedTo.equals(req.user._id)) {
      return res.status(403).json({ message:'Not authorized to delete' });
    }
    await task.deleteOne();
    res.json({ message:'Task deleted' });
  }catch(err){ console.error(err); res.status(500).json({ message:'Server error' }); }
});

module.exports = router;
