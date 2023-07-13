import { Hotel } from '@prisma/client';
import { notFoundError } from '@/errors';
import hotelsRepository from '@/repositories/hotels.repository';

async function getHotels(): Promise<Hotel[]> {
  const hotels: Hotel[] = await hotelsRepository.findHotels();
  if (!hotels) throw notFoundError();

  return hotels;
}

const hotelsService = {
  getHotels,
};

export default hotelsService;
