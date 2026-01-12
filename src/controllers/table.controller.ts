import { StatusCodes } from 'http-status-codes'
import { catchAsync } from '@/utils/index.js'
import { tableService } from '@/services/table.service.js'
import { Result, ApiResponse } from '@/types/index.js'
import { CreateTableRequest, ListAvailableTablesRequest, TableResponse } from '@/dto/index.js'

export const createTable = catchAsync<
  Record<string, never>,
  ApiResponse<TableResponse>,
  CreateTableRequest,
  Record<string, never>
>(async (req, res) => {
  const table = await tableService.create(req.body)

  res.status(StatusCodes.CREATED).json({
    status: Result.Success,
    data: table,
  })
})

export const getAvailableTables = catchAsync<
  Record<string, never>,
  ApiResponse<TableResponse[]>,
  Record<string, never>,
  ListAvailableTablesRequest
>(async (req, res) => {
  const table = await tableService.listAvailable(req.query)

  res.status(StatusCodes.OK).json({
    status: Result.Success,
    data: table,
  })
})
