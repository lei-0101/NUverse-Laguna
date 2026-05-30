package com.nuverse_laguna.modules.bulldog_exchange.domain;

import com.nuverse_laguna.shared.exception.AppException;
import org.springframework.http.HttpStatus;

public class InsufficientStockException extends AppException {

    public InsufficientStockException() {
        super(HttpStatus.CONFLICT, "This item is currently out of stock");
    }
}
