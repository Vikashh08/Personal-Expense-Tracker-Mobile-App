import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getAccounts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const accounts = await prisma.account.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
    res.json(accounts);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching accounts' });
  }
};
