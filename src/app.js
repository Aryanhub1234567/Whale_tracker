const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.Routes');
const walletRoutes = require('./routes/wallet.Routes');
const adminRoutes = require('./routes/admin.Routes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

dotenv.config();

app.use(cors({
  origin: process.env.FRONTEND_URL
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/wallets', walletRoutes);
app.use('/api/v1/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

// app.all('*', (req, res, next) => {
//   const error = new Error(`Cannot find ${req.originalUrl}`);
//   error.statusCode = 404;
//   next(error);
// });

app.use(errorMiddleware);

module.exports = app;
