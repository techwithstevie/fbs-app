import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Prisma Client
const prisma = new PrismaClient();

// Test database connection
prisma.$connect()
  .then(() => {
    console.log('Connected to SQLite database via Prisma');
  })
  .catch((err: unknown) => {
    console.error('Error connecting to database:', err);
  });

// Routes
app.use('/api/customers', require('./routes/customers'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/service-calls', require('./routes/serviceCalls'));
app.use('/api/reports', require('./routes/reports'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FBS Server is running' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Export Prisma client for use in routes
export { prisma };
