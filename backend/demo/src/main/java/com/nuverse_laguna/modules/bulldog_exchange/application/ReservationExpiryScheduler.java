package com.nuverse_laguna.modules.bulldog_exchange.application;

import com.nuverse_laguna.modules.bulldog_exchange.domain.Reservation;
import com.nuverse_laguna.modules.bulldog_exchange.repository.ProductVariantRepository;
import com.nuverse_laguna.modules.bulldog_exchange.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReservationExpiryScheduler {

    private final ReservationRepository reservationRepository;
    private final ProductVariantRepository variantRepository;

    // Runs every 15 minutes. Skips Sundays — the countdown is paused that day.
    @Scheduled(fixedDelay = 15 * 60 * 1000L)
    @Transactional
    public void expireOverdueReservations() {
        if (LocalDate.now().getDayOfWeek() == DayOfWeek.SUNDAY) {
            log.debug("Reservation expiry skipped — Sunday countdown pause");
            return;
        }
        List<Reservation> expired = reservationRepository.findPendingExpiredBefore(LocalDateTime.now());

        if (expired.isEmpty()) {
            return;
        }

        for (Reservation reservation : expired) {
            reservation.expire(); // sets status EXPIRED + restores variant stock
            variantRepository.save(reservation.getVariant());
            reservationRepository.save(reservation);
        }

        log.info("Expired {} overdue merchandise reservations", expired.size());
    }
}
