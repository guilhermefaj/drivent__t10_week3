import { Hotel, HotelWithRooms, TicketStatus } from '@prisma/client';
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

async function getHotelsWithRooms(userId: number, hotelId: number): Promise<HotelWithRooms> {
  if (!hotelId) {
    throw {
      name: 'NotFoundHotelId',
      message: 'HotelId does not exist',
    };
  }

  const hotels = await hotelsRepository.findHotels();
  if (!hotels || hotels.length === 0 || hotels === null) {
    throw {
      name: 'NotFoundHotels',
      message: 'Hotels does not exist',
    };
  }

  const hotel = await hotelsRepository.findHotelsWithRooms(hotelId);
  if (!hotel) {
    throw {
      name: 'NotFoundHotel',
      message: 'Hotel with rooms does not exist',
    };
  }

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw {
      name: 'NotFoundEnrollment',
      message: "This user hasn't an enrollment",
    };
  }

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) {
    throw {
      name: 'NotFoundTicket',
      message: 'Ticket does not exist',
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

  return hotel;
}

const hotelsService = {
  getHotels,
  getHotelsWithRooms,
};

export default hotelsService;
