import { z } from 'zod';

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `No puede superar los ${max} caracteres`)
    .optional()
    .transform((value) => (value === undefined || value === '' ? undefined : value));

export const createCandidateSchema = z.object({
  firstName: z
    .string({ error: 'El nombre es obligatorio' })
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  lastName: z
    .string({ error: 'El apellido es obligatorio' })
    .trim()
    .min(1, 'El apellido es obligatorio')
    .max(100, 'El apellido no puede superar los 100 caracteres'),
  email: z
    .string({ error: 'El email es obligatorio' })
    .trim()
    .min(1, 'El email es obligatorio')
    .email('El email no tiene un formato válido')
    .max(255, 'El email no puede superar los 255 caracteres'),
  phone: optionalText(50),
  address: optionalText(255),
});

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;
