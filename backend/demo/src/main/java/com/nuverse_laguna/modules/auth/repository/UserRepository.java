package com.nuverse_laguna.modules.auth.repository;

import com.nuverse_laguna.modules.auth.domain.User;
import com.nuverse_laguna.modules.auth.domain.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByVerificationToken(String verificationToken);

    @Query("SELECT u FROM User u WHERE u.status = :status AND u.suspendedUntil IS NOT NULL AND u.suspendedUntil <= :now")
    List<User> findExpiredSuspensions(@Param("status") UserStatus status, @Param("now") LocalDateTime now);
}
