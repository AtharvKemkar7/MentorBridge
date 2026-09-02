package com.alumni.platform.identity.repository;

import com.alumni.platform.identity.entity.RefreshToken;
import com.alumni.platform.identity.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByToken(String token);

    List<RefreshToken> findByUser(User user);

    List<RefreshToken> findByUserAndRevokedFalse(User user);

    @Modifying
    @Transactional
    @Query("UPDATE RefreshToken rt SET rt.revoked = true, rt.revokedAt = :now, rt.revokedReason = :reason WHERE rt.user = :user AND rt.revoked = false")
    int revokeAllUserTokens(@Param("user") User user, @Param("now") Instant now, @Param("reason") String reason);

    @Modifying
    @Transactional
    @Query("UPDATE RefreshToken rt SET rt.revoked = true, rt.revokedAt = :now, rt.revokedReason = :reason, rt.replacedByToken = :newToken WHERE rt.token = :token")
    int revokeAndReplaceToken(@Param("token") String token, @Param("now") Instant now, @Param("reason") String reason, @Param("newToken") String newToken);

    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiryDate < :now OR rt.revoked = true")
    int deleteExpiredOrRevokedTokens(@Param("now") Instant now);

    long countByUserAndRevokedFalse(User user);
}