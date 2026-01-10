import { Router, type Router as RouterType } from 'express'
import * as RestaurantController from '@/controllers/restaurant.controller.js'
import { validateRequestMiddleware } from '@/middleware/validate.middleware.js'
import { createRestaurantSchema } from '@/utils/validators.js'

const router: RouterType = Router()

/**
 * @route   POST /api/restaurants
 * @desc    Create a new restaurant
 * @access  Public
 */
router.post(
  '/',
  validateRequestMiddleware(createRestaurantSchema),
  RestaurantController.createRestaurant,
)

/**
 * @route   GET /api/restaurants/:id
 * @desc    Get details of a specific restaurant along with available tables
 */
router.get('/:id', RestaurantController.getRestaurantById)

export default router
