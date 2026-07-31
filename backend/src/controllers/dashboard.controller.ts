import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getDashboardSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch user's accounts to calculate total balance
    const accounts = await prisma.account.findMany({
      where: { userId },
    });
    
    const currentBalance = accounts.reduce((acc, account) => acc + account.balance, 0);

    // Fetch this month's income
    const monthlyIncomeAgg = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'INCOME',
        date: { gte: firstDayOfMonth },
      },
      _sum: { amount: true },
    });

    // Fetch this month's expenses
    const monthlyExpenseAgg = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: firstDayOfMonth },
      },
      _sum: { amount: true },
    });

    // Fetch recent transactions (last 5)
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 5,
      include: {
        category: true,
        account: true,
      }
    });

    const totalIncome = monthlyIncomeAgg._sum.amount || 0;
    const totalExpenses = monthlyExpenseAgg._sum.amount || 0;
    const totalSavings = totalIncome - totalExpenses;

    res.json({
      currentBalance,
      monthlyIncome: totalIncome,
      monthlyExpense: totalExpenses,
      totalSavings,
      recentTransactions,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching dashboard data' });
  }
};
