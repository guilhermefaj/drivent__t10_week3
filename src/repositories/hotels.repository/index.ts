import { Hotel } from '@prisma/client';
import { prisma } from '@/config';

async function findHotels(): Promise<Hotel[]> {
  return prisma.hotel.findMany();
}

async function findHotelsWithRooms(hotelId: number) {
  const hotel = await prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: true,
    },
  });

  if (!hotel) {
    throw new Error('Hotel with rooms does not exist');
  }

  return hotel;
}

const hotelsRepository = {
  findHotels,
  findHotelsWithRooms,
};

export default hotelsRepository;
