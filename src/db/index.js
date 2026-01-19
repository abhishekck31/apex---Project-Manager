import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

        if (!MONGO_URI) {
            console.error("ERROR: MONGO_URI or MONGODB_URI is not defined in the .env file");
            process.exit(1);
        }

        const connectionInstance = await mongoose.connect(MONGO_URI)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MONGODB connection FAILED ", error);
        process.exit(1)
    }
}

export default connectDB;