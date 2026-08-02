import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import dashboardRoutes from './routes/dashboard.routes';
import incomeRoutes from './routes/income.routes';
import expenseRoutes from './routes/expense.routes';
import transactionRoutes from './routes/transaction.routes';
import accountRoutes from './routes/account.routes';
import categoryRoutes from './routes/category.routes';
import budgetRoutes from './routes/budget.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running smoothly' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
