package com.nuverse_laguna.shared.event;

import org.springframework.context.ApplicationEvent;

import java.util.UUID;

public class ReservationCreatedEvent extends ApplicationEvent {

    private final UUID reservationId;
    private final UUID studentId;
    private final UUID variantId;
    private final String productName;

    public ReservationCreatedEvent(Object source, UUID reservationId, UUID studentId,
                                    UUID variantId, String productName) {
        super(source);
        this.reservationId = reservationId;
        this.studentId = studentId;
        this.variantId = variantId;
        this.productName = productName;
    }

    public UUID getReservationId() { return reservationId; }
    public UUID getStudentId()     { return studentId; }
    public UUID getVariantId()     { return variantId; }
    public String getProductName() { return productName; }
}
