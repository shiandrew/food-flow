package com.laioffer.onlineorder.model;


import java.util.List;


public record DashboardDto(
        String firstName,
        CartSummaryDto cartSummary,
        Integer restaurantCount,
        List<RestaurantSummaryDto> restaurants,
        List<FeaturedMenuItemDto> featuredItems
) {
}
