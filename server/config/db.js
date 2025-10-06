import mongoose from "mongoose";

const connectDB = async () => {
    try{
        mongoose.connection.on('connected', () => console.log('MongoDB Connected'));
       // Use the connection string exactly as provided in MONGODB_URI.
       // Include database name and options in the env value when needed.
       await mongoose.connect(`${process.env.MONGODB_URI}/quickshow`)
    }
    catch(error){
        console.log(error.message);
        process.exit(1);
    }
}

export default connectDB;