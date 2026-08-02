import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { type } = req.query;

    const whereClause: any = {
      OR: [
        { userId: userId },
        { userId: null } // System default categories
      ]
    };

    if (type) {
      whereClause.type = type;
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' }
      ]
    });

    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching categories' });
  }
};

export const addCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const validatedData = categorySchema.parse(req.body);

    const category = await prisma.category.create({
      data: {
        userId,
        name: validatedData.name,
        type: validatedData.type,
        icon: validatedData.icon,
        color: validatedData.color,
      },
    });

    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Invalid data' });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const validatedData = categorySchema.partial().parse(req.body);

    const existingCategory = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!existingCategory) {
      res.status(404).json({ message: 'Category not found or cannot be modified' });
      return;
    }

    const category = await prisma.category.update({
      where: { id },
      data: validatedData,
    });

    res.json(category);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Error updating category' });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const existingCategory = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!existingCategory) {
      res.status(404).json({ message: 'Category not found or cannot be modified' });
      return;
    }

    await prisma.category.delete({ where: { id } });

    res.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error deleting category' });
  }
};
