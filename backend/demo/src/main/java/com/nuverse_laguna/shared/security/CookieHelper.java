package com.nuverse_laguna.shared.security;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@RequiredArgsConstructor
public class CookieHelper {

    private final JwtService jwtService;

    public ResponseCookie createJwtCookie(String token) {
        return ResponseCookie.from(jwtService.getCookieName(), token)
                .httpOnly(true)
                .path("/")
                .maxAge(Duration.ofMillis(jwtService.getExpirationMs()))
                .secure(jwtService.isCookieSecure())
                .sameSite(jwtService.getCookieSameSite())
                .build();
    }

    public ResponseCookie clearJwtCookie() {
        return ResponseCookie.from(jwtService.getCookieName(), "")
                .httpOnly(true)
                .path("/")
                .maxAge(Duration.ZERO)
                .build();
    }
}
