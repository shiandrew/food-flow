package com.laioffer.onlineorder.model;


public record CartSummaryDto(
        Double totalPrice,
        Integer itemCount
) {
}
