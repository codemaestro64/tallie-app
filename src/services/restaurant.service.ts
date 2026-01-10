export class RestaurantService {
  private static instance: RestaurantService

  private constructor() {} // prevent class instantiation from outside cos: singleton

  // Singleton accessor
  public static getInstance(): RestaurantService {
    if (!RestaurantService.instance) {
      RestaurantService.instance = new RestaurantService()
    }
    return RestaurantService.instance
  }
}

export const restaurantService = RestaurantService.getInstance()
