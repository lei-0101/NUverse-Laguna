package com.nuverse_laguna.modules.bulldog_exchange.repository;

import com.nuverse_laguna.modules.bulldog_exchange.domain.Reservation;
import com.nuverse_laguna.modules.bulldog_exchange.domain.ReservationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    Page<Reservation> findByStudentIdOrderByCreatedAtDesc(UUID studentId, Pageable pageable);

    // Counts active reservations for a student against any variant of a specific product.
    @Query("SELECT COUNT(r) FROM Reservation r " +
           "WHERE r.studentId = :studentId " +
           "AND r.variant.product.id = :productId " +
           "AND r.status = 'PENDING'")
    long countActivePendingByStudentAndProduct(@Param("studentId") UUID studentId,
                                               @Param("productId") UUID productId);

    // Used by the expiry scheduler — fetches with JOIN FETCH to avoid lazy-load inside the loop.
    @Query("SELECT r FROM Reservation r JOIN FETCH r.variant WHERE r.status = 'PENDING' AND r.expiresAt < :now")
    List<Reservation> findPendingExpiredBefore(@Param("now") LocalDateTime now);
}
