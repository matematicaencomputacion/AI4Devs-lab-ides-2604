import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { createCandidateSchema } from '../validators/candidateValidator';
import { createCandidate } from '../services/candidateService';

export const addCandidate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parsed = createCandidateSchema.safeParse(req.body);

  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return res.status(400).json({
      message: 'Datos de candidato inválidos',
      errors,
    });
  }

  try {
    const candidate = await createCandidate(parsed.data);
    return res.status(201).json(candidate);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return res.status(409).json({
        message: 'Ya existe un candidato con ese email',
        errors: [{ field: 'email', message: 'El email ya está registrado' }],
      });
    }
    return next(error);
  }
};
