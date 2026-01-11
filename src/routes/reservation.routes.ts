import { Router, type Router as RouterType } from 'express'
import * as ReservationController from '@/controllers/reservation.controller.js'
import { validateRequestMiddleware } from '@/middleware/validate.middleware.js'
import { createReservationSchema } from '@/utils/validators.js'

const router: RouterType = Router()

/**
 * @route   POST /api/reservation
 * @desc    Create a new reservation
 * @access  Public
 */
router.post(
  '/',
  validateRequestMiddleware(createReservationSchema),
  ReservationController.createReservation,
)

export default router
