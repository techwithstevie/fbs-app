import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/docs', express.static(path.join(__dirname, '../..', 'docs')));

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
app.use('/api/forms', require('./routes/forms'));
app.use('/api/scheduling', require('./routes/scheduling'));
app.use('/api/estimates', require('./routes/estimates'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FBS Server is running' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Export Prisma client for use in routes
export { prisma };
