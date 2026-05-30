package com.nuverse_laguna.modules.auth.application;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConfigurationProperties(prefix = "app.auth")
@Getter
@Setter
public class AuthConfig {
    private List<String> allowedEmailDomains = List.of("national-u.edu.ph");
}
