package com.laioffer.onlineorder.service;


import com.laioffer.onlineorder.entity.CustomerEntity;
import com.laioffer.onlineorder.entity.MenuItemEntity;
import com.laioffer.onlineorder.entity.RestaurantEntity;
import com.laioffer.onlineorder.model.CartSummaryDto;
import com.laioffer.onlineorder.model.DashboardDto;
import com.laioffer.onlineorder.model.FeaturedMenuItemDto;
import com.laioffer.onlineorder.model.OrderItemDto;
import com.laioffer.onlineorder.model.RestaurantSummaryDto;
import com.laioffer.onlineorder.repository.MenuItemRepository;
import com.laioffer.onlineorder.repository.RestaurantRepository;
import org.springframework.stereotype.Service;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Service
public class DashboardService {


    private static final int FEATURED_ITEM_LIMIT = 6;


    private final CartService cartService;
    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;


    public DashboardService(
            CartService cartService,
            MenuItemRepository menuItemRepository,
            RestaurantRepository restaurantRepository) {
        this.cartService = cartService;
        this.menuItemRepository = menuItemRepository;
        this.restaurantRepository = restaurantRepository;
    }


    public DashboardDto getDashboard(CustomerEntity customer) {
        List<RestaurantEntity> restaurants = restaurantRepository.findAll();
        List<MenuItemEntity> menuItems = menuItemRepository.findAll();
        var cart = cartService.getCart(customer.id());
        Map<Long, String> restaurantNamesById = new HashMap<>();
        Map<Long, Integer> menuCountByRestaurantId = new HashMap<>();


        for (RestaurantEntity restaurant : restaurants) {
            restaurantNamesById.put(restaurant.id(), restaurant.name());
            menuCountByRestaurantId.put(restaurant.id(), 0);
        }


        for (MenuItemEntity menuItem : menuItems) {
            menuCountByRestaurantId.merge(menuItem.restaurantId(), 1, Integer::sum);
        }


        List<RestaurantSummaryDto> restaurantSummaries = new ArrayList<>();
        for (RestaurantEntity restaurant : restaurants) {
            Integer menuCount = menuCountByRestaurantId.getOrDefault(restaurant.id(), 0);
            restaurantSummaries.add(new RestaurantSummaryDto(restaurant, menuCount));
        }


        List<FeaturedMenuItemDto> featuredItems = new ArrayList<>();
        for (MenuItemEntity menuItem : menuItems) {
            if (featuredItems.size() >= FEATURED_ITEM_LIMIT) {
                break;
            }
            String restaurantName = restaurantNamesById.get(menuItem.restaurantId());
            featuredItems.add(new FeaturedMenuItemDto(menuItem, restaurantName));
        }


        List<OrderItemDto> orderItems = cart.orderItems();
        int itemCount = 0;
        for (OrderItemDto orderItem : orderItems) {
            itemCount += orderItem.quantity();
        }


        CartSummaryDto cartSummary = new CartSummaryDto(
                cart.totalPrice(),
                itemCount
        );


        return new DashboardDto(
                customer.firstName(),
                cartSummary,
                restaurantSummaries.size(),
                restaurantSummaries,
                featuredItems
        );
    }
}
