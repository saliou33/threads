import mongoose from "mongoose";

let isConnnected = false;

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_URL) return console.log("MONGODB_URL not found");

  if (isConnnected) return console.log("Already connected to MongoDB");

  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "threads",
    });
    isConnnected = true;
    console.log("connected to MongoDB");
  } catch (error) {}
};
