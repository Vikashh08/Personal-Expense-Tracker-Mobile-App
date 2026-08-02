import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const exportTransactionsCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { month, year } = req.query;

    let dateFilter = {};
    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);
      dateFilter = {
        date: {
          gte: startDate,
          lte: endDate,
        },
      };
    } else if (year) {
      const startDate = new Date(Number(year), 0, 1);
      const endDate = new Date(Number(year), 11, 31, 23, 59, 59);
      dateFilter = {
        date: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        ...dateFilter
      },
      include: {
        category: true,
        account: true
      },
      orderBy: { date: 'desc' }
    });

    if (transactions.length === 0) {
       res.status(404).json({ message: 'No transactions found for the specified period.' });
       return;
    }

    const csvHeaders = ['Date', 'Type', 'Amount', 'Currency', 'Category', 'Account', 'Notes'];
    const csvRows = transactions.map(tx => {
      return [
        new Date(tx.date).toISOString().split('T')[0],
        tx.type,
        tx.amount,
        tx.currency,
        tx.category?.name || 'Uncategorized',
        tx.account.name,
        `"${tx.notes ? tx.notes.replace(/"/g, '""') : ''}"`
      ].join(',');
    });

    const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=transactions_${year || 'all'}${month ? `_${month}` : ''}.csv`);
    res.status(200).send(csvContent);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error generating report' });
  }
};
