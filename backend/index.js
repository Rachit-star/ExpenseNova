require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

connectDB();
const app = express();
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173",                
    "https://expensenova.vercel.app",       
    "https://expense-nova.vercel.app"      
  ],
  credentials: true
}));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/data', require('./routes/dataRoutes'));

app.use('/api/budgets', require('./routes/budgetRoutes')); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server on port ${PORT}`));