package com.nuverse_laguna.modules.events.domain;

import com.nuverse_laguna.shared.exception.AppException;
import org.springframework.http.HttpStatus;

public class DuplicateRsvpException extends AppException {

    public DuplicateRsvpException() {
        super(HttpStatus.CONFLICT, "You are already registered for this event");
    }
}
