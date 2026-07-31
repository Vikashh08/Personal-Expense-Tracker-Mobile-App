import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { z } from 'zod';

const incomeSchema = z.object({
  amount: z.number().positive(),
  categoryId: z.string().optional(),
  accountId: z.string(),
  date: z.string().optional(),
  notes: z.string().optional(),
});

export const addIncome = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const validatedData = incomeSchema.parse(req.body);

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type: 'INCOME',
        amount: validatedData.amount,
        accountId: validatedData.accountId,
        categoryId: validatedData.categoryId,
        notes: validatedData.notes,
        date: validatedData.date ? new Date(validatedData.date) : new Date(),
      },
    });

    // Update account balance
    await prisma.account.update({
      where: { id: validatedData.accountId },
      data: { balance: { increment: validatedData.amount } },
    });

    res.status(201).json(transaction);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Invalid data' });
  }
};

export const getIncomes = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const incomes = await prisma.transaction.findMany({
      where: { userId, type: 'INCOME' },
      orderBy: { date: 'desc' },
      include: { category: true, account: true },
    });
    res.json(incomes);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching incomes' });
  }
};

export const deleteIncome = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId, type: 'INCOME' },
    });

    if (!transaction) {
      res.status(404).json({ message: 'Income not found' });
      return;
    }

    await prisma.transaction.delete({ where: { id } });

    // Revert account balance
    await prisma.account.update({
      where: { id: transaction.accountId },
      data: { balance: { decrement: transaction.amount } },
    });

    res.json({ message: 'Income deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error deleting income' });
  }
};
