package com.nuverse_laguna.modules.bulldog_exchange.domain;

import com.nuverse_laguna.shared.entity.BaseEntity;
import com.nuverse_laguna.shared.exception.AppException;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reservations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Reservation extends BaseEntity {

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ReservationStatus status;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    private static final int EXPIRY_HOURS = 48;

    public static Reservation create(UUID studentId, ProductVariant variant) {
        Reservation reservation = new Reservation();
        reservation.studentId = studentId;
        reservation.variant = variant;
        reservation.status = ReservationStatus.PENDING;
        reservation.expiresAt = LocalDateTime.now().plusHours(EXPIRY_HOURS);
        return reservation;
    }

    // Expires this reservation and restores stock to the variant.
    // Idempotent: if already expired or cancelled, does nothing.
    public void expire() {
        if (this.status != ReservationStatus.PENDING) {
            return;
        }
        this.status = ReservationStatus.EXPIRED;
        this.variant.restoreStock();
    }

    // Cancels this reservation and restores stock to the variant.
    public void cancel() {
        if (this.status != ReservationStatus.PENDING) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Only pending reservations can be cancelled");
        }
        this.status = ReservationStatus.CANCELLED;
        this.variant.restoreStock();
    }
}
