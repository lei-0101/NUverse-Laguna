package com.nuverse_laguna.modules.auth.domain;

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
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseEntity {

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 50)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private UserStatus status;

    @Column(name = "verification_token", length = 255)
    private String verificationToken;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "suspended_until")
    private LocalDateTime suspendedUntil;

    @Column(name = "suspend_count", nullable = false)
    private int suspendCount = 0;

    @Column(name = "suspension_reason", length = 500)
    private String suspensionReason;

    public static User create(String email, String hashedPassword, String fullName) {
        User user = new User();
        user.email = email;
        user.password = hashedPassword;
        user.fullName = fullName;
        user.role = Role.ROLE_STUDENT;
        user.status = UserStatus.PENDING_VERIFICATION;
        user.verificationToken = UUID.randomUUID().toString();
        return user;
    }

    /** Dev-only factory — creates a pre-verified account with an explicit role. */
    public static User createSeeded(String email, String hashedPassword, String fullName, Role role) {
        User user = new User();
        user.email = email;
        user.password = hashedPassword;
        user.fullName = fullName;
        user.role = role;
        user.status = UserStatus.ACTIVE;
        user.verifiedAt = LocalDateTime.now();
        return user;
    }

    public void activate() {
        if (this.status != UserStatus.PENDING_VERIFICATION) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Account is already verified or has been suspended");
        }
        this.status = UserStatus.ACTIVE;
        this.verifiedAt = LocalDateTime.now();
        this.verificationToken = null;
    }

    public void suspend(LocalDateTime until, String reason) {
        this.status = UserStatus.SUSPENDED;
        this.suspendedUntil = until;
        this.suspensionReason = reason;
        this.suspendCount++;
    }

    public void reactivate() {
        if (this.status == UserStatus.ACTIVE) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Account is already active");
        }
        this.status = UserStatus.ACTIVE;
        this.suspendedUntil = null;
        this.suspensionReason = null;
    }

    public boolean isSuspensionExpired() {
        return this.suspendedUntil != null && LocalDateTime.now().isAfter(this.suspendedUntil);
    }

    public boolean canLogin() {
        return this.status == UserStatus.ACTIVE;
    }
}
