package com.nuverse_laguna.shared.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuverse_laguna.shared.response.ApiResponse;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private final long authCapacity;
    private final long apiCapacity;

    // Spring Boot 4 autoconfigures a Jackson 3 ObjectMapper, so a Jackson 2
    // bean is not available for injection. This filter only serializes a small
    // error envelope, so it owns a dedicated mapper instance.
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final Map<String, Bucket> authBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> apiBuckets = new ConcurrentHashMap<>();

    public RateLimitFilter(
            @Value("${app.rate-limit.auth-requests-per-minute:5}") long authCapacity,
            @Value("${app.rate-limit.api-requests-per-minute:60}") long apiCapacity
    ) {
        this.authCapacity = authCapacity;
        this.apiCapacity = apiCapacity;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {
        String ip = resolveClientIp(request);
        String path = request.getRequestURI();

        Bucket bucket = isAuthSensitiveEndpoint(path)
                ? authBuckets.computeIfAbsent(ip, k -> createBucket(authCapacity))
                : apiBuckets.computeIfAbsent(ip, k -> createBucket(apiCapacity));

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            response.addHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
            chain.doFilter(request, response);
        } else {
            long retryAfterSeconds = probe.getNanosToWaitForRefill() / 1_000_000_000;
            response.setStatus(429);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.addHeader("X-Rate-Limit-Retry-After-Seconds", String.valueOf(retryAfterSeconds));
            objectMapper.writeValue(
                    response.getWriter(),
                    ApiResponse.error("Too many requests. Please try again later.")
            );
            log.warn("Rate limit exceeded for IP {} on {}", ip, path);
        }
    }

    private Bucket createBucket(long capacity) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(capacity)
                .refillIntervally(capacity, Duration.ofMinutes(1))
                .build();
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    // Only login and register are brute-force targets
    private boolean isAuthSensitiveEndpoint(String path) {
        return path.startsWith("/api/auth/login") || path.startsWith("/api/auth/register");
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
