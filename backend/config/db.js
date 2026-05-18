import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("Database connected successfully")
        })

        const mongodbURI = process.env.MONGO_URI;
        const projectName = 'omniflow';

        if (!mongodbURI) {
            throw new Error("MONGO_URI environment variable not set")
        }

        // Construct the full URI with database name
        // Use URL object to handle potential query params or trailing slashes in base URI
        let finalURI;
        try {
            const url = new URL(mongodbURI);
            url.pathname = `/${projectName}`;
            finalURI = url.toString();
        } catch (e) {
            // Fallback for non-standard URIs
            finalURI = `${mongodbURI.replace(/\/$/, '')}/${projectName}`;
        }

        await mongoose.connect(finalURI);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}

export default connectDB;