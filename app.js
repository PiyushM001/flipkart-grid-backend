
// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const API_URL = process.env.MONGO_URL;

const app = express();
const PORT = process.env.PORT || 3001; // Use environment variable or fallback to 3000

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

// =========================== SCHEMA SECTION ===========================

// Connect to MongoDB
mongoose.connect( `${API_URL}`)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));

const productSchema = new mongoose.Schema({
    timestamp: { type: String  },
    product_name: { type: String },
    brand: { type: String  },
    MRP: { type: String},
    expiry_date: { type: String },
    product_count: { type: String},
    is_expired: { type: String },
    expected_life_span: { type:String},
});

const fruitSchema = new mongoose.Schema({
    name: { type: String, required: true },
    freshness_index: { type: Number, required: true },
    expected_life_span: { type: Number, required: true },
    timestamp: { type: String, required: true },
});

const Product = mongoose.model('Product', productSchema);
const Fruit = mongoose.model('fruit', fruitSchema );


// =========================== API SECTION ==============================

// Add a new product
app.post('/add-product', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).send({ message: 'Product saved successfully!' });
    } catch (error) {
        res.status(500).send({ error: 'Fail product', details: error.message });
    }
});
app.post('/add-fruit', async (req, res) => {
    try {
        const fruit = new Fruit(req.body);
        await fruit.save();
        res.status(201).send({ message: 'Fruit saved successfully!'});
    } catch (error) {
        res.status(500).send({ error: 'Failed saving Fruit', details: error.message });
    }
});

// Get all products (history)
app.get('/products-history', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).send(products);
    } catch (error) {
        res.status(500).send({ error: 'Failed to retrieve products', details: error.message });
    }
});
app.get('/fruits-history', async (req, res) => {
    try {
        const fruits= await Fruit.find();
        res.status(200).send(fruits);
    } catch (error) {
        res.status(500).send({ error: 'Failed to retrieve products', details: error.message });
    }
});


// =========================== SERVER START =============================

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

