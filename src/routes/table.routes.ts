import { Router, type Router as RouterType } from 'express'
import * as TableController from '@/controllers/table.controller.js'
import { validateRequestMiddleware } from '@/middleware/validate.middleware.js'
import { createTableSchema } from '@/utils/validators.js'

const router: RouterType = Router()

/**
 * @route   POST /api/tables
 * @desc    Create a new table
 * @access  Public
 */
router.post('/', validateRequestMiddleware(createTableSchema), TableController.createTable)

export default router
