package com.alumni.platform.identity.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.jwt")
@Data
public class JwtProperties {

    private String secret;
    private long accessTokenExpirationMs = 900000; // 15 minutes
    private long refreshTokenExpirationMs = 604800000; // 7 days
    private String issuer = "alumni-platform";
    private String audience = "alumni-platform-client";
    private int maxRefreshTokensPerUser = 5;
}