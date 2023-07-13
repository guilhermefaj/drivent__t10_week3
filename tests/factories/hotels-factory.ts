import faker from '@faker-js/faker';
import { prisma } from '@/config';

export function createHotel() {
  return prisma.hotel.create({
    data: {
      name: faker.company.companyName(),
      image: faker.image.business(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.soon(),
    },
    include: {
      Rooms: true,
    },
  });
}
