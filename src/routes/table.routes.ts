import { Router, type Router as RouterType } from 'express'
import * as TableController from '@/controllers/table.controller.js'
import { validateRequestMiddleware } from '@/middleware/validate.middleware.js'
import { createTableSchema, getAvailableTablesSchema } from '@/utils/validators.js'

const router: RouterType = Router()

/**
 * @route   POST /api/tables
 * @desc    Create a new table
 * @access  Public
 */
router.post('/', validateRequestMiddleware(createTableSchema), TableController.createTable)

/**
 * @route   GET /tables
 * @desc    Get available tables
 * @access  Public
 */
router.get(
  '/',
  validateRequestMiddleware(getAvailableTablesSchema),
  TableController.getAvailableTables,
)

export default router
