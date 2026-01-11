import { StatusCodes } from 'http-status-codes'
import { catchAsync } from '@/utils/index.js'
import { reservationService } from '@/services/reservation.service.js'
import {
  CreateReservationInput,
  Reservation,
  ReservationResult,
  Result,
  ApiResponse,
} from '@/types/index.js'

export const createReservation = catchAsync<
  Record<string, never>,
  ApiResponse<ReservationResult>,
  CreateReservationInput,
  Record<string, never>
>(async (req, res) => {
  const result = await reservationService.create({
    ...req.body,
  })

  if (result.waitlisted) {
    return res.status(StatusCodes.ACCEPTED).json({
      status: Result.Success,
      message: 'No tables available. You have been added to the waitlist.',
      data: result.data,
    })
  }

  return res.status(StatusCodes.CREATED).json({
    status: Result.Success,
    data: result.data,
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
