export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export enum Result {
  Success = 'success',
  Error = 'error',
}

export interface ApiResponse<T> {
  status: Result.Success | Result.Error
  data?: T
  message?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}
