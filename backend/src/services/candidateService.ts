import prisma from '../lib/prisma';
import { CreateCandidateInput } from '../validators/candidateValidator';

export const createCandidate = async (data: CreateCandidateInput) => {
  return prisma.candidate.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone ?? null,
      address: data.address ?? null,
    },
  });
};
