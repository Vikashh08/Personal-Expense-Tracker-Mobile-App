import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { z } from 'zod';

const budgetSchema = z.object({
  categoryId: z.string().optional().nullable(),
  amount: z.number().positive(),
  period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  alerts: z.boolean().optional(),
});

export const getBudgets = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(budgets);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching budgets' });
  }
};

export const addBudget = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const validatedData = budgetSchema.parse(req.body);

    const budget = await prisma.budget.create({
      data: {
        userId,
        ...validatedData,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
      },
    });

    res.status(201).json(budget);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Invalid budget data' });
  }
};

export const deleteBudget = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const existingBudget = await prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!existingBudget) {
      res.status(404).json({ message: 'Budget not found' });
      return;
    }

    await prisma.budget.delete({ where: { id } });
    res.json({ message: 'Budget deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error deleting budget' });
  }
};
