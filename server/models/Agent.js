import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AgentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobileNumber: { type: String, required: true },
    countryCode: { type: String, required: true, default: '+1' },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    assignedTasksCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }
}, {
    timestamps: true
});

// Hash password before saving
AgentSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
AgentSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const Agent = mongoose.model('Agent', AgentSchema);

export default Agent;