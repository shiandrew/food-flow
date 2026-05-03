package com.laioffer.onlineorder.controller;


import com.laioffer.onlineorder.entity.CustomerEntity;
import com.laioffer.onlineorder.model.CartSummaryDto;
import com.laioffer.onlineorder.model.DashboardDto;
import com.laioffer.onlineorder.model.FeaturedMenuItemDto;
import com.laioffer.onlineorder.model.RestaurantSummaryDto;
import com.laioffer.onlineorder.service.CustomerService;
import com.laioffer.onlineorder.service.DashboardService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;


import java.util.List;


import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@WebMvcTest(DashboardController.class)
@AutoConfigureMockMvc
class DashboardControllerTests {


    @Autowired
    private MockMvc mockMvc;


    @MockBean
    private CustomerService customerService;


    @MockBean
    private DashboardService dashboardService;


    @Test
    @WithMockUser(username = "dashboard@test.com")
    void getDashboard_shouldReturnDashboardPayload() throws Exception {
        CustomerEntity customer = new CustomerEntity(
                1L,
                "dashboard@test.com",
                "password",
                true,
                "Dash",
                "User"
        );
        DashboardDto dashboardDto = new DashboardDto(
                "Dash",
                new CartSummaryDto(18.50, 3),
                1,
                List.of(new RestaurantSummaryDto(1L, "Burger King", "123 Main", "555-0100", "image", 8)),
                List.of(new FeaturedMenuItemDto(5L, 1L, "Burger King", "Whopper", "Classic burger", 6.39, "item-image"))
        );


        Mockito.when(customerService.getCustomerByEmail("dashboard@test.com")).thenReturn(customer);
        Mockito.when(dashboardService.getDashboard(customer)).thenReturn(dashboardDto);


        mockMvc.perform(get("/dashboard").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.first_name").value("Dash"))
                .andExpect(jsonPath("$.cart_summary.total_price").value(18.5))
                .andExpect(jsonPath("$.cart_summary.item_count").value(3))
                .andExpect(jsonPath("$.restaurant_count").value(1))
                .andExpect(jsonPath("$.restaurants[0].name").value("Burger King"))
                .andExpect(jsonPath("$.featured_items[0].restaurant_name").value("Burger King"));
    }
}
