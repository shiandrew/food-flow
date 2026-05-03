package com.laioffer.onlineorder.controller;


import com.laioffer.onlineorder.entity.CustomerEntity;
import com.laioffer.onlineorder.model.DashboardDto;
import com.laioffer.onlineorder.service.CustomerService;
import com.laioffer.onlineorder.service.DashboardService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class DashboardController {


    private final CustomerService customerService;
    private final DashboardService dashboardService;


    public DashboardController(
            CustomerService customerService,
            DashboardService dashboardService) {
        this.customerService = customerService;
        this.dashboardService = dashboardService;
    }


    @GetMapping("/dashboard")
    public DashboardDto getDashboard(@AuthenticationPrincipal User user) {
        CustomerEntity customer = customerService.getCustomerByEmail(user.getUsername());
        return dashboardService.getDashboard(customer);
    }
}
