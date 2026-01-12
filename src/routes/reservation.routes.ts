import { Router, type Router as RouterType } from 'express'
import * as ReservationController from '@/controllers/reservation.controller.js'
import { validateRequestMiddleware } from '@/middleware/validate.middleware.js'
import { createReservationSchema, listReservationsSchema } from '@/utils/validators.js'

const router: RouterType = Router()

/**
 * @route   POST /reservations
 * @desc    Create a new reservation
 * @access  Public
 */
router.post(
  '/',
  validateRequestMiddleware(createReservationSchema),
  ReservationController.createReservation,
)

/**
 * @route   GET /reservations
 * @desc    List reservations
 * @access  Public
 */
router.get(
  '/',
  validateRequestMiddleware(listReservationsSchema),
  ReservationController.listReservations,
)

/**
 * @route   PATCH /reservations
 * @desc    Update a reservation
 * @access  Public
 */
router.patch('/', ReservationController.updateReservation)

export default router
