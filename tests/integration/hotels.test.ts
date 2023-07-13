import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import supertest from 'supertest';
import { Enrollment, TicketStatus, User } from '@prisma/client';
import { cleanDb, generateValidToken } from '../helpers';
import { createHotel } from '../factories/hotels-factory';
import { createEnrollmentWithAddress, createTicket, createTicketType, createUser } from '../factories';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /hotels', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/hotels');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
});

describe('GET /hotels with valid token', () => {
  let user: User;
  let token: string;
  let enrollment: Enrollment;

  beforeEach(async () => {
    user = await createUser();
    token = await generateValidToken(user);
    enrollment = await createEnrollmentWithAddress(user);
  });

  it("should respond with status 404 if enrollment doesn't exist", async () => {
    const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(status).toBe(httpStatus.NOT_FOUND);
  });

  it("should respond with status 404 if ticket does'nt exist", async () => {
    const { status } = await server.get('/tickets').set('Authorization', `Bearer ${token}`);

    expect(status).toBe(httpStatus.NOT_FOUND);
  });

  it('should respond with status 402 when need payment', async () => {
    const ticketType = await createTicketType();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
    await createHotel();

    const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(status).toBe(httpStatus.PAYMENT_REQUIRED);
  });
});
