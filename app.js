// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwtsecret = "piyush";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
require("dotenv").config();
const API_URL = process.env.MONGO_URL;

const app = express();
const PORT = process.env.PORT || 3001; // Use environment variable or fallback to 3000

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

// =========================== SCHEMA SECTION ===========================

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://pmimpiyush:YZWXn3MbuhQbWg8Y@cluster0.nszi1.mongodb.net/"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

  const productSchema = new mongoose.Schema({
    date: {
      type: String,
      default: () => new Date().toISOString().split("T")[0], // Default date in YYYY-MM-DD format
    },
    time: {
      type: String,
      default: () => new Date().toLocaleTimeString(), // Default time
    },
    products: [
      {
        timestamp: { type: String },
        product_name: { type: String },
        brand: { type: String },
        MRP: { type: String },
        expiry_date: { type: String },
        product_count: { type: String },
        is_expired: { type: String },
        expected_life_span: { type: String },
      },
    ],
  });
  
  const fruitSchema = new mongoose.Schema({
    date: {
      type: String,
      default: () => new Date().toISOString().split("T")[0], // Default date in YYYY-MM-DD format
    },
    time: {
      type: String,
      default: () => new Date().toLocaleTimeString(), // Default time
    },
    fruits: [
      {
        name: { type: String, required: true },
        freshness_index: { type: Number, required: true },
        expected_life_span: { type: Number, required: true },
        timestamp: { type: String, required: true },
      },
    ],
  });
  
  

const dailyOrderSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true },
    fruitOrders: { type: Number, default: 0 },
    productOrders: { type: Number, default: 0 },
    fruitRotten: { type: Number, default: 0 },
  });
  
  const DailyOrder = mongoose.model("DailyOrder", dailyOrderSchema);

  

  const categoryColors = {
    "Personal Care": "#0088FE",
    "Household Care": "#00C49F",
    "Dairy": "#FFBB28",
    "Staples": "#FF8042",
    "Snacks and Beverages": "#A28EFF",
    "Packaged Food": "#FF6384",
    "Fruits and Vegetables": "#36A2EB",
  };
  
  const categoryCountSchema = new mongoose.Schema({
    category: {
      type: String,
      required: true,
      unique: true,
      enum: Object.keys(categoryColors), // Ensure category is one of the predefined categories
    },
    count: { type: Number, required: true, default: 0 },
  });
  
  const CategoryCount = mongoose.model("CategoryCount", categoryCountSchema);
  
  
  

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const Product = mongoose.model("Product", productSchema);
const Fruit = mongoose.model("fruit", fruitSchema);
const User = mongoose.model("user", userSchema);

// =========================== API SECTION ==============================

// Add a new product
const moment = require("moment");

app.post("/add-product", async (req, res) => {
  try {
    // const product = new Product(req.body);
    // await product.save();

    const products  = req.body; // Expecting `req.body.products` to be an array of product objects.

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).send({ error: "Invalid data: Products must be a non-empty array." });
    }

    const product = new Product({ products }); // Save the array of products.
    await product.save();

    // Get today's date
    const today = moment().format("YYYY-MM-DD");

    // Increment productOrders count for today
    await DailyOrder.findOneAndUpdate(
      { date: today },
      { $inc: { productOrders: 1 } },
      { upsert: true, new: true }
    );

    for (const product of products) {
      const category = product.category; // Ensure each product has a `category` field

      if (!category || !validCategories.includes(category)) {
        // Skip products with invalid or missing categories
        continue;
      }

      // Increment the count for the valid category or create a new one
      await CategoryCount.findOneAndUpdate(
        { category },
        { $inc: { count: 1 } },
        { upsert: true, new: true }
      );
    }

    res.status(201).send({ message: "Products saved successfully!" });
  } catch (error) {
    res.status(500).send({ error: "Failed saving product", details: error.message });
  }
});















app.post("/add-fruit", async (req, res) => {
    try {
      
      const fruits  = req.body; // Expecting `req.body.products` to be an array of product objects.

      if (!Array.isArray(fruits) || fruits.length === 0) {
        return res.status(400).send({ error: "Invalid data: must be a non-empty array." });
      }
  
      const fruitres = new Fruit({ fruits }); // Save the array of products.
      await fruitres.save();

      const today = moment().format("YYYY-MM-DD");
  
      // Increment fruitOrders count for today
      await DailyOrder.findOneAndUpdate(
        { date: today },
        { $inc: { fruitOrders: 1 } },
        { upsert: true, new: true }
      );


      for (const product of fruits) {
        const category = "Fruits and Vegetables"; 
        const rotten=product.freshness_index;
        if(rotten<=3){
          await DailyOrder.findOneAndUpdate(
            { date: today },
            { $inc: { fruitRotten: 1 } },
            { upsert: true, new: true }
          );
        }
        // Ensure each product has a `category` field
  
        // if (!category || !validCategories.includes(category)) {
        //   // Skip products with invalid or missing categories
        //   continue;
        // }
  
        // Increment the count for the valid category or create a new one
        await CategoryCount.findOneAndUpdate(
          { category },
          { $inc: { count: 1 } },
          { upsert: true, new: true }
        );
      }
  
  
      // Get today's date
     
      
  
      res.status(201).send({ message: "Fruits saved successfully!" });
    } catch (error) {
      res.status(500).send({ error: "Failed saving fruit", details: error.message });
    }
  });















  app.get("/category-piechart", async (req, res) => {
    try {
      const categories = await CategoryCount.find(); // Fetch all category counts
      const data = categories.map(({ category, count }) => ({
        name: category,
        value: count,
        color: categoryColors[category], // Attach the color for each category
      }));
  
      res.status(200).send(data);
    } catch (error) {
      res.status(500).send({ error: "Failed to fetch category pie chart data", details: error.message });
    }
  });
  

















  app.get("/order-data", async (req, res) => {
    try {
      const orders = await DailyOrder.find().sort({ date: 1 }); // Sort by date ascending
      const graphData = orders.map(order => ({
        date: order.date,
        fruits: order.fruitOrders,
        products: order.productOrders,
        rotten:order.fruitRotten
      }));
  
      res.status(200).send(graphData);
    } catch (error) {
      res.status(500).send({ error: "Failed to retrieve order data", details: error.message });
    }
  });
  












// Get all products (history)
app.get("/products-history", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).send(products);
  } catch (error) {
    res
      .status(500)
      .send({ error: "Failed to retrieve products", details: error.message });
  }
});

app.get("/fruits-history", async (req, res) => {
  try {
    const fruits = await Fruit.find();
    res.status(200).send(fruits);
  } catch (error) {
    res
      .status(500)
      .send({ error: "Failed to retrieve products", details: error.message });
  }
});

// =========================== LOGIN FUNCTION ===========================

app.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Compare password with hash
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT
      const token = jwt.sign({ name: user.name, email: user.email }, jwtsecret, {
        expiresIn: "1h",
      });

      res.status(200).json({ message: "Login successful", token:token , name:user.name });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  }
);

// =========================== SERVER START =============================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
