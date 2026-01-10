class RestaurantService {
  private static instance: RestaurantService;

  private constructor() {}

  // Singleton accessor
  public static getInstance(): RestaurantService {
    if (!RestaurantService.instance) {
      RestaurantService.instance = new RestaurantService();
    }
    return RestaurantService.instance;
  }

}