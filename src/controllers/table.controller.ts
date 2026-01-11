import { StatusCodes } from 'http-status-codes'
import { catchAsync } from '@/utils/index.js'
import { tableService } from '@/services/table.service.js'
import { Result, Table, ApiResponse } from '@/types/index.js'
import { CreateTableInput } from '@/types/table.types.js'

export const createTable = catchAsync<
  Record<string, never>,
  ApiResponse<Table>,
  CreateTableInput,
  Record<string, never>
>(async (req, res) => {
  const table = await tableService.create(req.body)

  res.status(StatusCodes.CREATED).json({
    status: Result.Success,
    data: table,
  })
})
