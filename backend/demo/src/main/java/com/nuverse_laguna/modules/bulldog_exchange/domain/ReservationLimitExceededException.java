package com.nuverse_laguna.modules.bulldog_exchange.domain;

import com.nuverse_laguna.shared.exception.AppException;
import org.springframework.http.HttpStatus;

public class ReservationLimitExceededException extends AppException {

    public ReservationLimitExceededException() {
        super(HttpStatus.CONFLICT, "You already have the maximum number of active reservations for this product");
    }
}
