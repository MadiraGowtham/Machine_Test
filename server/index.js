import express from 'express';
import cors from "cors";
import "dotenv/config";
import connectDB from './config/db.js';
import authRouter from './Routers/AuthRouter.js';
import agentRouter from './Routers/AgentRouter.js';
import taskRouter from './Routers/TaskRouter.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Connect to MongoDB
await connectDB();

// Routes
app.use('/api/auth', authRouter);
app.use('/api/agents', agentRouter);
app.use('/api/tasks', taskRouter);

// Health check route
app.get('/', (req,res) => 
    res.json({ message: 'Server is running', status: 'OK' })
)

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(port , (error) => {
    if(!error){
        console.log(`Server is running on port ${port}`);
    }else{
        console.log(`Error occurred, server can't start`, error);
    }
})