package com.alumni.platform.identity.dto.response;

import com.alumni.platform.identity.entity.User;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class UserProfileResponse {

    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String studentId;
    private String employeeId;
    private String phoneNumber;
    private String profileImageUrl;
    private User.UserType userType;
    private String role;
    private User.AccountStatus accountStatus;
    private boolean emailVerified;
    private Instant lastLoginAt;
    private Instant createdAt;
}