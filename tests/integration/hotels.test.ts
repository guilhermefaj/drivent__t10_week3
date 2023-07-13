import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import supertest from 'supertest';
import { cleanDb, generateValidToken } from '../helpers';
import { createHotel } from '../factories/hotels-factory';
import { createEnrollmentWithAddress, createUser } from '../factories';
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
  it("should respond with status 404 if enrollment doesn't exist", async () => {
    const token = generateValidToken();
    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it("should responde with status 404 if ticket does'nt exist", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);

    await createEnrollmentWithAddress(user);

    const { status } = await server.get('/tickets').set('Authorization', `Bearer ${token}`);

    expect(status).toBe(httpStatus.NOT_FOUND);
  });
});
