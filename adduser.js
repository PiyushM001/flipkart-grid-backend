const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://pmimpiyush:YZWXn3MbuhQbWg8Y@cluster0.nszi1.mongodb.net/"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("user", userSchema);

// Function to add a user
const addUser = async () => {
  try {
    const email = "staff@example.com"; // Replace with staff's email
    const password = "password123"; // Replace with staff's password

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = new User({
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await user.save();
    console.log("User added successfully!");
    mongoose.disconnect();
  } catch (error) {
    console.error("Error adding user:", error.message);
    mongoose.disconnect();
  }
};

addUser();
