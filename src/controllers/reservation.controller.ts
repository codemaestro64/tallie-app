import { StatusCodes } from 'http-status-codes'
import { catchAsync } from '@/utils/index.js'
import { reservationService } from '@/services/reservation.service.js'
import { Reservation, Result, ApiResponse } from '@/types/index.js'
import {
  CreateReservationRequest,
  ListReservationsRequest,
  ReservationResponse,
  ReservationSuggestionResponse,
} from '@/dto/index.js'

export const createReservation = catchAsync<
  Record<string, never>,
  ApiResponse<ReservationResponse | ReservationSuggestionResponse>,
  CreateReservationRequest,
  Record<string, never>
>(async (req, res) => {
  const result = await reservationService.create(req.body)

  if ('waitlisted' in result && result.waitlisted) {
    return res.status(StatusCodes.CONFLICT).json({
      status: Result.Success,
      message: 'No tables available. You have been added to the waitlist.',
      data: result,
    })
  }

  return res.status(StatusCodes.CREATED).json({
    status: Result.Success,
    data: result,
  })
})

export const listReservations = catchAsync<
  Record<string, never>,
  ApiResponse<ReservationResponse[]>,
  ListReservationsRequest,
  Record<string, never>
>(async (req, res) => {
  const { date } = req.query

  const result = await reservationService.getReservations(date)

  return res.status(StatusCodes.OK).json({
    status: Result.Success,
    data: result,
  })
})

export const updateReservation = catchAsync<
  { id: string },
  ApiResponse<Reservation>,
  Record<string, never>,
  Record<string, never>
>(async (req, res) => {
  const id = Number(req.params.id)
  const updated = await reservationService.modify(id, req.body)

  res.status(StatusCodes.OK).json({
    status: Result.Success,
    data: updated,
  })
})

export const cancelReservation = catchAsync<
  { id: string },
  ApiResponse<Reservation>,
  Record<string, never>,
  Record<string, never>
>(async (req, res) => {
  const id = Number(req.params.id)
  const updated = await reservationService.modify(id, req.body)

  res.status(StatusCodes.OK).json({
    status: Result.Success,
    data: updated,
  })
})
