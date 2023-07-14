import faker from '@faker-js/faker';
import { prisma } from '@/config';

export function createHotel() {
  const hotelData = {
    name: faker.company.companyName(),
    image: faker.image.business(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return prisma.hotel.create({
    data: {
      ...hotelData,
      Rooms: {
        createMany: {
          data: [
            { name: '101', capacity: 1 },
            { name: '201', capacity: 2 },
          ],
        },
      },
    },
    include: {
      Rooms: true,
    },
  });
}
