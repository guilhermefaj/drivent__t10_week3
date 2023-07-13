import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import hotelsService from '@/services/hotels-service';

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const hotels = await hotelsService.getHotels(userId);
    return res.status(httpStatus.OK).send(hotels);
  } catch (error) {
    if (error.name === 'NotFoundEnrollment') {
      return res.status(httpStatus.NOT_FOUND).send(error.message);
    }
    if (error.name === 'NotFoundHotel') {
      return res.status(httpStatus.NOT_FOUND).send(error.message);
    }
    if (error.name === 'NotFoundTicket') {
      return res.status(httpStatus.NOT_FOUND).send(error.message);
    }
    if (error.name === 'PaymentRequired') {
      return res.status(httpStatus.PAYMENT_REQUIRED).send(error.message);
    }

    return res.status(httpStatus.BAD_REQUEST);
  }
}

export async function getHotelsById(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const hotelId = parseInt(req.params.hotelId);

  try {
    const hotel = await hotelsService.getHotelsWithRooms(userId, hotelId);
    res.status(httpStatus.OK).send(hotel);
  } catch (error) {
    if (error.name === 'NotFoundHotelId') {
      return res.status(httpStatus.NOT_FOUND).send(error.message);
    }
    if (error.name === 'NotFoundHotels') {
      return res.status(httpStatus.NOT_FOUND).send(error.message);
    }
    if (error.name === 'NotFoundHotel') {
      return res.status(httpStatus.NOT_FOUND).send(error.message);
    }
    if (error.name === 'NotFoundEnrollment') {
      return res.status(httpStatus.NOT_FOUND).send(error.message);
    }
    if (error.name === 'NotFoundTicket') {
      return res.status(httpStatus.NOT_FOUND).send(error.message);
    }
    if (error.name === 'PaymentRequired') {
      return res.status(httpStatus.PAYMENT_REQUIRED).send(error.message);
    }
  }
}
