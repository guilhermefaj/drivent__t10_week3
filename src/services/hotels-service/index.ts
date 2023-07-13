import { Hotel, TicketStatus } from '@prisma/client';
import hotelsRepository from '@/repositories/hotels.repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketsRepository from '@/repositories/tickets-repository';

async function getHotels(userId: number): Promise<Hotel[]> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw {
      name: 'NotFoundEnrollment',
      message: "This user hasn't a enrollment",
    };
  }

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) {
    throw {
      name: 'NotFoundTicket',
      message: 'Not found any ticket',
    };
  }
  if (
    ticket.status === TicketStatus.RESERVED ||
    ticket.TicketType.includesHotel === false ||
    ticket.TicketType.isRemote === true
  ) {
    throw {
      name: 'PaymentRequired',
      message: 'you need to pay to access',
    };
  }

  const hotels: Hotel[] = await hotelsRepository.findHotels();
  if (!hotels || hotels.length === 0 || hotels === null) {
    throw {
      name: 'NotFoundHotel',
      message: 'Not found any hotel',
    };
  }

  return hotels;
}

const hotelsService = {
  getHotels,
};

export default hotelsService;
