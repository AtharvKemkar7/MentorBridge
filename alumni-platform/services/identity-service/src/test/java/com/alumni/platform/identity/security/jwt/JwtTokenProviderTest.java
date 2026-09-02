package com.alumni.platform.identity.security.jwt;

import com.alumni.platform.identity.config.JwtProperties;
import com.alumni.platform.identity.entity.User;
import com.alumni.platform.identity.entity.Role;
import com.alumni.platform.identity.entity.Permission;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private JwtProperties jwtProperties;

    @BeforeEach
    void setUp() {
        jwtProperties = new JwtProperties();
        jwtProperties.setSecret("ZmY2M2I1NjY3OWM0NjU5NmY3ODk4YzY3ODk4YzY3ODk4YzY3ODk4YzY3ODk4YzY3ODk4Yw==");
        jwtProperties.setAccessTokenExpirationMs(900000);
        jwtProperties.setRefreshTokenExpirationMs(604800000);
        jwtProperties.setIssuer("alumni-platform");
        jwtProperties.setAudience("alumni-platform-client");
        jwtProperties.setMaxRefreshTokensPerUser(5);

        jwtTokenProvider = new JwtTokenProvider(jwtProperties);
        jwtTokenProvider.init();
    }

    @Test
    void generateAccessToken_ShouldReturnValidToken() {
        User user = createTestUser();

        String token = jwtTokenProvider.generateAccessToken(user);

        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
    }

    @Test
    void validateToken_ValidToken_ShouldReturnTrue() {
        User user = createTestUser();
        String token = jwtTokenProvider.generateAccessToken(user);

        boolean isValid = jwtTokenProvider.validateToken(token);

        assertThat(isValid).isTrue();
    }

    @Test
    void validateToken_InvalidToken_ShouldReturnFalse() {
        boolean isValid = jwtTokenProvider.validateToken("invalid.token.string");

        assertThat(isValid).isFalse();
    }

    @Test
    void getEmailFromToken_ShouldReturnUserEmail() {
        User user = createTestUser();
        String token = jwtTokenProvider.generateAccessToken(user);

        String email = jwtTokenProvider.getEmailFromToken(token);

        assertThat(email).isEqualTo(user.getEmail());
    }

    @Test
    void getUserIdFromToken_ShouldReturnUserId() {
        User user = createTestUser();
        String token = jwtTokenProvider.generateAccessToken(user);

        UUID userId = jwtTokenProvider.getUserIdFromToken(token);

        assertThat(userId).isEqualTo(user.getId());
    }

    @Test
    void getUserTypeFromToken_ShouldReturnUserType() {
        User user = createTestUser();
        String token = jwtTokenProvider.generateAccessToken(user);

        User.UserType userType = jwtTokenProvider.getUserTypeFromToken(token);

        assertThat(userType).isEqualTo(user.getUserType());
    }

    @Test
    void getRoleFromToken_ShouldReturnRoleName() {
        User user = createTestUser();
        String token = jwtTokenProvider.generateAccessToken(user);

        String role = jwtTokenProvider.getRoleFromToken(token);

        assertThat(role).isEqualTo(user.getRole().getName());
    }

    @Test
    void generateRefreshToken_ShouldReturnValidToken() {
        User user = createTestUser();

        String token = jwtTokenProvider.generateRefreshToken(user, "test-device", "127.0.0.1");

        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
    }

    private User createTestUser() {
        Permission permission = Permission.builder()
                .id(UUID.randomUUID())
                .name("USER_READ")
                .resource("user")
                .action("read")
                .build();

        Role role = Role.builder()
                .id(UUID.randomUUID())
                .name("STUDENT")
                .permissions(Set.of(permission))
                .build();

        return User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .firstName("John")
                .lastName("Doe")
                .userType(User.UserType.STUDENT)
                .role(role)
                .build();
    }
}