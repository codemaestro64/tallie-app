export * from './appError.js'
export * from './catchAsync.js'
export * from './log.js'
export * from './validators.js'

export const dateToHM = (d: Date): string => {
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')

  return `${hours}:${minutes}`
}
