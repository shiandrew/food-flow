package com.laioffer.onlineorder.model;


import com.laioffer.onlineorder.entity.RestaurantEntity;


public record RestaurantSummaryDto(
        Long id,
        String name,
        String address,
        String phone,
        String imageUrl,
        Integer menuCount
) {
    public RestaurantSummaryDto(RestaurantEntity entity, Integer menuCount) {
        this(entity.id(), entity.name(), entity.address(), entity.phone(), entity.imageUrl(), menuCount);
    }
}
