package com.nuverse_laguna.shared.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuverse_laguna.shared.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Returns a 401 JSON envelope for unauthenticated requests to protected routes.
 * Without this, Spring Security's default entry point answers with 403 (or, for
 * endpoints that dereference a null Authentication, a 500). This keeps the API
 * contract consistent with {@link ApiResponse}.
 */
@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    // Spring Boot 4 autoconfigures a Jackson 3 mapper, so a Jackson 2 bean is
    // not injectable; this entry point owns a dedicated mapper for its envelope.
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(
                response.getWriter(),
                ApiResponse.error("Authentication required")
        );
    }
}
