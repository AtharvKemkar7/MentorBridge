package com.alumni.platform.identity.dto.response;

import com.alumni.platform.identity.entity.User;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long expiresIn;
    private UserResponse user;

    @Data
    @Builder
    public static class UserResponse {
        private UUID id;
        private String email;
        private String firstName;
        private String lastName;
        private String fullName;
        private User.UserType userType;
        private String role;
        private User.AccountStatus accountStatus;
        private boolean emailVerified;
    }
}