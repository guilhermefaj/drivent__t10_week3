import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import supertest from 'supertest';
import * as jwt from 'jsonwebtoken';
import { Enrollment, TicketStatus, User } from '@prisma/client';
import { cleanDb, generateValidToken } from '../helpers';
import { createHotel } from '../factories/hotels-factory';
import {
  createEnrollmentWithAddress,
  createTicket,
  createTicketType,
  createTicketTypeRemote,
  createTicketTypeWithHotel,
  createTicketTypeWithoutHotel,
  createUser,
} from '../factories';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /hotels token problems', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/hotels');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/tickets/types').set('Authorization', `Bearer ${token}`);

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

  it('should respond with status 402 when does not includes hotel', async () => {
    const ticketType = await createTicketTypeWithoutHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    createHotel();

    const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it('should respond with status 402 when is remote', async () => {
    const ticketType = await createTicketTypeRemote();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    createHotel();

    const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it('should respond with status 402 when Reserved', async () => {
    const ticketType = await createTicketTypeWithHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
    createHotel();

    const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(status).toBe(httpStatus.PAYMENT_REQUIRED);
  });
});

describe('GET /hotels:id token problems', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/tickets/types');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/tickets/types');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/tickets/types').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/tickets/types').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
});

describe('GET /hotels/:id with valid token', () => {
  let user: User;
  let token: string;
  let enrollment: Enrollment;
  let hotelId: number;

  beforeEach(async () => {
    user = await createUser();
    token = await generateValidToken(user);
    enrollment = await createEnrollmentWithAddress(user);
    const hotel = await createHotel();
    hotelId = hotel.id;
  });

  it('should respond with status 400 if hotelId is not valid', async () => {
    const ticketType = await createTicketTypeWithHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const fakeHotelId = faker.animal.dog();

    const { status } = await server.get(`/hotels/${fakeHotelId}`).set('Authorization', `Bearer ${token}`);

    expect(status).toBe(httpStatus.BAD_REQUEST);
  });

  it('should respond with status 200 and return the hotel if hotelId is valid', async () => {
    const { status, body } = await server.get(`/hotels/${hotelId}`).set('Authorization', `Bearer ${token}`);

    console.log(body);

    expect(status).toBe(httpStatus.OK);
    expect(body).toHaveProperty('name', 'Hotel Name');
  });
});
