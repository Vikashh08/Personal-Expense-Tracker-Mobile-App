import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { z } from 'zod';

const goalSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.number().positive(),
  currentAmount: z.number().min(0).optional(),
  deadline: z.string().optional().nullable(),
  monthlyContribution: z.number().optional().nullable(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const getGoals = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(goals);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching goals' });
  }
};

export const addGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const validatedData = goalSchema.parse(req.body);

    const goal = await prisma.goal.create({
      data: {
        userId,
        ...validatedData,
        deadline: validatedData.deadline ? new Date(validatedData.deadline) : undefined,
      },
    });

    res.status(201).json(goal);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Invalid goal data' });
  }
};

export const addContribution = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ message: 'Amount must be a positive number' });
      return;
    }

    const existingGoal = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!existingGoal) {
      res.status(404).json({ message: 'Goal not found' });
      return;
    }

    const newCurrentAmount = existingGoal.currentAmount + amount;
    const isCompleted = newCurrentAmount >= existingGoal.targetAmount;

    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: {
        currentAmount: newCurrentAmount,
        isCompleted,
      },
    });

    res.json(updatedGoal);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error adding contribution' });
  }
};

export const deleteGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const existingGoal = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!existingGoal) {
      res.status(404).json({ message: 'Goal not found' });
      return;
    }

    await prisma.goal.delete({ where: { id } });
    res.json({ message: 'Goal deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error deleting goal' });
  }
};
