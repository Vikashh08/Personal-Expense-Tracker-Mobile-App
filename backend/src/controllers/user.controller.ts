import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { z } from 'zod';

const onboardingSchema = z.object({
  currency: z.string().optional(),
  country: z.string().optional(),
  theme: z.string().optional(),
  monthlyIncome: z.number().optional(),
});

export const updateOnboardingPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const validatedData = onboardingSchema.parse(req.body);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        currency: validatedData.currency,
        country: validatedData.country,
        theme: validatedData.theme,
        monthlyIncome: validatedData.monthlyIncome,
      },
    });

    res.json({
      message: 'Preferences updated successfully',
      user: {
        id: updatedUser.id,
        currency: updatedUser.currency,
        country: updatedUser.country,
        theme: updatedUser.theme,
        monthlyIncome: updatedUser.monthlyIncome,
      }
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Invalid data' });
  }
};
