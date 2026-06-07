const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3010';

export interface CandidateInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface Candidate extends CandidateInput {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  status: number;
  fieldErrors: ApiFieldError[];

  constructor(message: string, status: number, fieldErrors: ApiFieldError[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export async function createCandidate(input: CandidateInput): Promise<Candidate> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/candidates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch (networkError) {
    throw new ApiError('No se pudo conectar con el servidor', 0);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      data.message || 'Ocurrió un error al guardar el candidato',
      response.status,
      data.errors || []
    );
  }

  return data as Candidate;
}
