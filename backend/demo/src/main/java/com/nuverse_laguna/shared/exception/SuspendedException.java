package com.nuverse_laguna.shared.exception;

import java.time.LocalDateTime;

/** Thrown when a suspended user attempts to log in. Carries suspension details. */
public class SuspendedException extends RuntimeException {
    private final LocalDateTime suspendedUntil;
    private final String reason;
    private final int suspendCount;

    public SuspendedException(LocalDateTime suspendedUntil, String reason, int suspendCount) {
        super("Account is suspended");
        this.suspendedUntil = suspendedUntil;
        this.reason = reason;
        this.suspendCount = suspendCount;
    }

    public LocalDateTime getSuspendedUntil() { return suspendedUntil; }
    public String getReason() { return reason; }
    public int getSuspendCount() { return suspendCount; }
}
