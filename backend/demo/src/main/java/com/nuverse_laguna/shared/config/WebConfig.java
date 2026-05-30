package com.nuverse_laguna.shared.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Serves locally stored uploads as static resources. In production this is
 * handled by the object-storage CDN, so the mapping is dev-only convenience.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String localDir;
    private final String publicPrefix;

    public WebConfig(
            @Value("${app.storage.local-dir:uploads}") String localDir,
            @Value("${app.storage.public-prefix:/uploads}") String publicPrefix
    ) {
        this.localDir = localDir;
        this.publicPrefix = publicPrefix;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = Paths.get(localDir).toAbsolutePath().normalize().toUri().toString();
        registry.addResourceHandler(publicPrefix + "/**")
                .addResourceLocations(location);
    }
}
