import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  FirstName: { type: String, required: true },
  Phone: { type: String, required: true },
  Notes: { type: String, required: false },
  assignedAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: false }
}, {
  timestamps: true
});

const Tasks = mongoose.model('Tasks', TaskSchema);

export default Tasks;
