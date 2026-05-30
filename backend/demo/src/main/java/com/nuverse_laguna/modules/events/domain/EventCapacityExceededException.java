package com.nuverse_laguna.modules.events.domain;

import com.nuverse_laguna.shared.exception.AppException;
import org.springframework.http.HttpStatus;

public class EventCapacityExceededException extends AppException {

    public EventCapacityExceededException() {
        super(HttpStatus.CONFLICT, "This event has reached its maximum capacity");
    }
}
