import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  console.error(err.stack || err);
  res.status(500).json({ message: 'Ocurrió un error inesperado en el servidor' });
};
