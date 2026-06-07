import request from 'supertest';
import { app } from '../app';
import prisma from '../lib/prisma';

const testEmails = [
  'happy.path@example.com',
  'duplicate@example.com',
];

const cleanup = async () => {
  await prisma.candidate.deleteMany({
    where: { email: { in: testEmails } },
  });
};

beforeAll(cleanup);

afterAll(async () => {
  await cleanup();
  await prisma.$disconnect();
});

describe('POST /candidates', () => {
  it('crea un candidato (camino feliz) y responde 201', async () => {
    const response = await request(app)
      .post('/candidates')
      .send({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'happy.path@example.com',
        phone: '+54 11 1234 5678',
        address: 'Calle Falsa 123',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'happy.path@example.com',
      phone: '+54 11 1234 5678',
      address: 'Calle Falsa 123',
    });
    expect(response.body.id).toEqual(expect.any(Number));
  });

  it('rechaza datos inválidos con 400 y detalle de errores', async () => {
    const response = await request(app)
      .post('/candidates')
      .send({
        firstName: '',
        lastName: 'SinNombre',
        email: 'no-es-un-email',
      });

    expect(response.statusCode).toBe(400);
    expect(Array.isArray(response.body.errors)).toBe(true);
    const fields = response.body.errors.map((e: { field: string }) => e.field);
    expect(fields).toEqual(expect.arrayContaining(['firstName', 'email']));
  });

  it('rechaza email duplicado con 409', async () => {
    const payload = {
      firstName: 'Grace',
      lastName: 'Hopper',
      email: 'duplicate@example.com',
    };

    const first = await request(app).post('/candidates').send(payload);
    expect(first.statusCode).toBe(201);

    const second = await request(app).post('/candidates').send(payload);
    expect(second.statusCode).toBe(409);
    expect(Array.isArray(second.body.errors)).toBe(true);
    expect(second.body.errors.length).toBeGreaterThan(0);
    expect(second.body.errors[0].field).toBe('email');
  });
});
