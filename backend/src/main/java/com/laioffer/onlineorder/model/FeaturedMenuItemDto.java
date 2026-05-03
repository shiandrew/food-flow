package com.laioffer.onlineorder.model;


import com.laioffer.onlineorder.entity.MenuItemEntity;


public record FeaturedMenuItemDto(
        Long id,
        Long restaurantId,
        String restaurantName,
        String name,
        String description,
        Double price,
        String imageUrl
) {
    public FeaturedMenuItemDto(MenuItemEntity entity, String restaurantName) {
        this(
                entity.id(),
                entity.restaurantId(),
                restaurantName,
                entity.name(),
                entity.description(),
                entity.price(),
                entity.imageUrl()
        );
    }
}
