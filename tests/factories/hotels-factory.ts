import faker from '@faker-js/faker';
import { Booking, HotelWithRooms, Room } from '@prisma/client';
import { prisma } from '@/config';

export async function createHotel(userId: number, token: string): Promise<HotelWithRooms> {
  const hotel = await prisma.hotel.create({
    data: {
      name: faker.company.companyName(),
      image: faker.image.business(),
    },
  });

  const roomPromises: Promise<Room>[] = [];
  const bookingPromises: Promise<Booking>[] = [];
  const numRooms = 3;

  for (let i = 0; i < numRooms; i++) {
    const room = prisma.room.create({
      data: {
        name: faker.lorem.word(),
        capacity: faker.datatype.number({ min: 1, max: 4 }),
        hotelId: hotel.id,
      },
    });
    roomPromises.push(room);

    const booking = prisma.booking.create({
      data: {
        userId: userId,
        roomId: (await room).id,
      },
    });
    bookingPromises.push(booking);
  }

  const rooms = await Promise.all(roomPromises);
  const bookings = await Promise.all(bookingPromises);

  return {
    ...hotel,
    Rooms: rooms,
    Bookings: bookings,
  };
}
