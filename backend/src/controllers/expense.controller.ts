import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { z } from 'zod';

const expenseSchema = z.object({
  amount: z.number().positive(),
  categoryId: z.string().optional(),
  accountId: z.string(),
  merchant: z.string().optional(),
  paymentMethod: z.string().optional(),
  date: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  location: z.string().optional(),
  receiptUrl: z.string().optional(),
});

export const addExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const validatedData = expenseSchema.parse(req.body);

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type: 'EXPENSE',
        amount: validatedData.amount,
        accountId: validatedData.accountId,
        categoryId: validatedData.categoryId,
        notes: validatedData.notes,
        date: validatedData.date ? new Date(validatedData.date) : new Date(),
        merchant: validatedData.merchant,
        paymentMethod: validatedData.paymentMethod,
        tags: validatedData.tags || [],
        location: validatedData.location,
        receiptUrl: validatedData.receiptUrl,
      },
    });

    // Update account balance (decrease for expense)
    await prisma.account.update({
      where: { id: validatedData.accountId },
      data: { balance: { decrement: validatedData.amount } },
    });

    res.status(201).json(transaction);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Invalid data' });
  }
};

export const getExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const expenses = await prisma.transaction.findMany({
      where: { userId, type: 'EXPENSE' },
      orderBy: { date: 'desc' },
      include: { category: true, account: true },
    });
    res.json(expenses);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching expenses' });
  }
};

export const deleteExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId, type: 'EXPENSE' },
    });

    if (!transaction) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }

    await prisma.transaction.delete({ where: { id } });

    // Revert account balance (increase for reverted expense)
    await prisma.account.update({
      where: { id: transaction.accountId },
      data: { balance: { increment: transaction.amount } },
    });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error deleting expense' });
  }
};
