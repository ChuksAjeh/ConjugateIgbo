package org.conjugateigbo.core.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configures Cross-Origin Resource Sharing (CORS) for all {@code /api/**} endpoints.
 *
 * <p>Allows requests from the known web origins (local development, Railway
 * staging/prod, and the production domain) so that browser-based clients can
 * call the API without CORS errors.
 *
 * <p>All standard HTTP methods and request headers are permitted.
 * Credentials (cookies/auth headers) are allowed so that future session-based
 * authentication can be added without a CORS change.
 */
@Configuration
public class CorsConfig {

    /**
     * Registers the CORS mapping that applies to every path under {@code /api}.
     *
     * @return a {@link WebMvcConfigurer} that adds the CORS rules to the
     *         Spring MVC handler mapping chain.
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins(
                                "http://localhost:5173",                     // Local dev (Vite)
                                "http://localhost:8080",                     // Local dev (Spring)
                                "http://localhost:8081",                     // Local dev (alt port)
                                "https://lcp-ui-staging.up.railway.app",    // Staging UI
                                "https://lcp-ui-prod.up.railway.app",       // Production UI
                                "https://www.langcurate.com"                // Production domain
                        )
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .exposedHeaders("Access-Control-Allow-Origin")
                        .allowCredentials(true);
            }
        };
    }
}
