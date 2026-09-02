package com.alumni.platform.identity.service;

import com.alumni.platform.identity.config.JwtProperties;
import com.alumni.platform.identity.entity.RefreshToken;
import com.alumni.platform.identity.entity.User;
import com.alumni.platform.identity.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProperties jwtProperties;

    @Transactional
    public RefreshToken saveRefreshToken(User user, String token, String deviceInfo, String ipAddress) {
        enforceMaxTokensPerUser(user);

        RefreshToken refreshToken = RefreshToken.builder()
                .token(token)
                .user(user)
                .expiryDate(Instant.now().plusMillis(jwtProperties.getRefreshTokenExpirationMs()))
                .deviceInfo(deviceInfo)
                .ipAddress(ipAddress)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    public void revokeAllUserTokens(User user, String reason) {
        int count = refreshTokenRepository.revokeAllUserTokens(user, Instant.now(), reason);
        log.info("Revoked {} refresh tokens for user {}: {}", count, user.getId(), reason);
    }

    @Transactional
    public void revokeAndReplaceToken(String oldToken, String newToken, String reason) {
        int updated = refreshTokenRepository.revokeAndReplaceToken(oldToken, Instant.now(), reason, newToken);
        if (updated == 0) {
            log.warn("Failed to revoke and replace token: {}", reason);
        }
    }

    @Transactional
    public int cleanupExpiredTokens() {
        int deleted = refreshTokenRepository.deleteExpiredOrRevokedTokens(Instant.now());
        if (deleted > 0) {
            log.info("Cleaned up {} expired/revoked refresh tokens", deleted);
        }
        return deleted;
    }

    public List<RefreshToken> getActiveTokens(User user) {
        return refreshTokenRepository.findByUserAndRevokedFalse(user);
    }

    public long getActiveTokenCount(User user) {
        return refreshTokenRepository.countByUserAndRevokedFalse(user);
    }

    private void enforceMaxTokensPerUser(User user) {
        long activeCount = getActiveTokenCount(user);
        if (activeCount >= jwtProperties.getMaxRefreshTokensPerUser()) {
            log.warn("Max refresh tokens reached for user {}, revoking oldest", user.getId());
            List<RefreshToken> tokens = getActiveTokens(user);
            if (!tokens.isEmpty()) {
                RefreshToken oldest = tokens.stream()
                        .min((t1, t2) -> t1.getCreatedAt().compareTo(t2.getCreatedAt()))
                        .orElse(null);
                if (oldest != null) {
                    oldest.setRevoked(true);
                    oldest.setRevokedAt(Instant.now());
                    oldest.setRevokedReason("Max tokens limit reached, rotating oldest");
                    refreshTokenRepository.save(oldest);
                }
            }
        }
    }
}