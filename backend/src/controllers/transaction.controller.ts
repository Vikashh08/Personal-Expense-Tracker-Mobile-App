import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getAllTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { search, type, categoryId, startDate, endDate } = req.query;

    const whereClause: any = { userId };

    if (type) {
      whereClause.type = type;
    }
    
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate as string);
      if (endDate) whereClause.date.lte = new Date(endDate as string);
    }

    if (search) {
      whereClause.OR = [
        { notes: { contains: search as string, mode: 'insensitive' } },
        { merchant: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      include: { category: true, account: true },
    });

    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching transactions' });
  }
};
