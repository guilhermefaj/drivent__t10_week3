import { Hotel } from '@prisma/client';
import { notFoundError } from '@/errors';
import hotelsRepository from '@/repositories/hotels.repository';
import enrollmentRepository from '@/repositories/enrollment-repository';

async function getHotels(userId: number): Promise<Hotel[]> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment)
    throw {
      name: 'NotFoundEnrollment',
      message: "This user hasn't a enrollment",
    };

  const hotels: Hotel[] = await hotelsRepository.findHotels();
  if (!hotels || hotels.length === 0)
    throw {
      name: 'NotFoundHotel',
      message: 'Not found any hotel',
    };

  return hotels;
}

const hotelsService = {
  getHotels,
};

export default hotelsService;
