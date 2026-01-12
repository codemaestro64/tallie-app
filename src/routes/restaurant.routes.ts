import { Router, type Router as RouterType } from 'express'
import * as RestaurantController from '@/controllers/restaurant.controller.js'
import { validateRequestMiddleware } from '@/middleware/validate.middleware.js'
import { createRestaurantSchema, getRestaurantSchema } from '@/utils/validators.js'

const router: RouterType = Router()

/**
 * @route   POST /api/restaurant
 * @desc    Create a new restaurant
 * @access  Public
 */
router.post(
  '/',
  validateRequestMiddleware(createRestaurantSchema),
  RestaurantController.createRestaurant,
)

/**
 * @route   GET /restaurant
 * @desc    Get restaurant details
 * @access  Public
 */
router.get('/', validateRequestMiddleware(getRestaurantSchema), RestaurantController.getRestaurant)

export default router
