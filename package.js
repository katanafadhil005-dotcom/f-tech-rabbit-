// ============================================
// F TECH RABBIT — Backend Server
// ============================================
const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = 3000;

// ---- Middleware ----
app.use(cors());              // Allow frontend to talk to us
app.use(express.json());      // Parse JSON request bodies

// ---- Load & save products from a JSON file ----
const DATA_FILE = path.join(__dirname, 'data', 'products.json');

function loadProducts() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

function saveProducts(products) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
}

// ---- In-memory order list (replace with DB later) ----
let orders = [];

// ============================================
// ROUTES
// ============================================

// 1. FARM INFO — homepage data
app.get('/api/farm', (req, res) => {
  res.json({
    name: "F Tech Rabbit",
    tagline: "Quality rabbits, fresh produce, and farming wisdom.",
    location: "Your Town, Kenya",
    phone: "+254 700 000 000",
    email: "hello@ftechrabbit.com"
  });
});

// 2. GET all products
app.get('/api/products', (req, res) => {
  try {
    res.json(loadProducts());
  } catch (err) {
    res.status(500).json({ error: "Could not load products." });
  }
});

// 3. GET single product
app.get('/api/products/:id', (req, res) => {
  const products = loadProducts();
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: "Product not found." });
  res.json(product);
});

// 4. POST a new order
app.post('/api/orders', (req, res) => {
  const { customerName, phone, items, total } = req.body;

  if (!customerName || !phone || !items || items.length === 0) {
    return res.status(400).json({ error: "Missing required order details." });
  }

  const order = {
    id: orders.length + 1,
    customerName,
    phone,
    items,
    total,
    status: "Pending",
    placedAt: new Date().toISOString()
  };

  orders.push(order);
  console.log("🐇 New order:", order);

  res.status(201).json({
    message: "Order received! F Tech Rabbit will contact you shortly.",
    orderId: order.id
  });
});

// 5. GET all orders (protect this later!)
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`🐇 F Tech Rabbit backend running on http://localhost:${PORT}`);
});