import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getExpenseByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { month, year } = req.query;

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

    const expenses = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'EXPENSE',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const categories = await prisma.category.findMany({
      where: {
        id: { in: expenses.map(e => e.categoryId).filter(Boolean) as string[] }
      }
    });

    const formattedData = expenses.map(exp => {
      const cat = categories.find(c => c.id === exp.categoryId);
      return {
        categoryId: exp.categoryId,
        categoryName: cat?.name || 'Uncategorized',
        color: cat?.color || '#cbd5e1',
        total: exp._sum.amount || 0
      };
    });

    res.json(formattedData);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching analytics' });
  }
};

export const getCashFlow = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { year } = req.query;

    const startDate = new Date(Number(year), 0, 1);
    const endDate = new Date(Number(year), 11, 31, 23, 59, 59);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        type: true,
        amount: true,
        date: true,
      }
    });

    // Group by month
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0
    }));

    transactions.forEach(t => {
      const monthIndex = t.date.getMonth();
      if (t.type === 'INCOME') {
        monthlyData[monthIndex].income += t.amount;
      } else if (t.type === 'EXPENSE') {
        monthlyData[monthIndex].expense += t.amount;
      }
    });

    res.json(monthlyData);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching cash flow' });
  }
};
