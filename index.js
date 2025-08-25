const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 3001; // single port

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: '*' }));

// MongoDB connection
mongoose.connect(
    'mongodb+srv://BalaSankar:BalaSankar%402004@cluster0.dlyxypn.mongodb.net/Weavers',
    { useNewUrlParser: true, useUnifiedTopology: true }
)
    .then(() => {
        console.log('MongoDB Connected...');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.log(err));

// Default route
app.get("/", (req, res) => {
    res.send("Welcome to Museo Book API");
});

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    phone:String,
    role: String
});
const User = mongoose.model("User", userSchema);


// Signup
app.post("/auth/signup", async (req, res) => {
    try {
        const { name, email, password,phone, role } = req.body;
        const user = new User({ name, email, password,phone, role });
        await user.save();
        res.json({ message: "User registered successfully!" });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
    }
});

// Login
app.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (!user) return res.status(400).json({ error: "Invalid credentials" });
        res.json({ message: "Login successful", role: user.role });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get user by email
// Backend route
app.get("/api/users", async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) return res.status(400).json({ error: "Email is required" });

        const user = await User.findOne({ email }, { password: 0 });
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Something went wrong" });
    }
});

// GET orders by customer email
app.get("/api/orders", async (req, res) => {
    try {
        const email = req.query.email; // get email from query param
        if (!email) return res.status(400).json({ error: "Email is required" });

        const orders = await CustomOrder.find({ customerEmail: email }); // fetch orders for this email
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});
// Route to get all orders
// Assuming you have CustomOrder model
// const CustomOrder = mongoose.model("CustomOrder", customOrderSchema);

// Route to get all custom orders
app.get("/api/customOrders", async (req, res) => {
    try {
        const allOrders = await mongoose.connection
            .collection("customorders") // raw collection name in MongoDB
            .find()
            .toArray();
        res.json(allOrders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch custom orders" });
    }
});
// Update order status by ID 
app.put("/api/customOrders/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Using native MongoDB collection
        const result = await mongoose.connection.collection("customorders").findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(id) },
            { $set: { status } },
            { returnDocument: "after" } // returns updated document
        );

        if (!result.value) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.json({ message: "Order status updated", order: result.value });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update order" });
    }
});


// Get all dresses
app.get("/api/dresses", async (req, res) => {
    try {
        const dresses = await mongoose.connection
            .collection("dresses")
            .find()
            .toArray();
        res.json(dresses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

const customOrderSchema = new mongoose.Schema({
    dressType: String,
    color: String,
    borderColor: String,
    size: String,
    designPattern: String,
    price: Number,
    laborCharge: Number,
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    status: { type: String, default: "Pending" },
    createdAt: { type: Date, default: Date.now },
});

const CustomOrder = mongoose.model("CustomOrder", customOrderSchema);

app.post("/api/customOrders", async (req, res) => {
    try {
        const order = new CustomOrder(req.body);
        await order.save();
        res.json({ message: "Order placed successfully!", order });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to place order" });
    }
});



