package com.alumni.platform.identity.service;

import com.alumni.platform.identity.dto.request.UpdateProfileRequest;
import com.alumni.platform.identity.dto.response.UserProfileResponse;
import com.alumni.platform.identity.entity.User;
import com.alumni.platform.identity.exception.UserNotFoundException;
import com.alumni.platform.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Optional<User> findById(UUID id) {
        return userRepository.findActiveById(id);
    }

    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findActiveByEmail(email.toLowerCase());
    }

    @Transactional(readOnly = true)
    public User getById(UUID id) {
        return userRepository.findActiveById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<User> findByUserType(User.UserType userType) {
        return userRepository.findByUserType(userType);
    }

    @Transactional(readOnly = true)
    public List<User> findByRole(String roleName) {
        return userRepository.findByRole_Name(roleName);
    }

    @Transactional
    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        log.info("Updating profile for user: {}", userId);

        User user = getById(userId);

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getProfileImageUrl() != null) {
            user.setProfileImageUrl(request.getProfileImageUrl());
        }

        user = userRepository.save(user);

        log.info("Profile updated for user: {}", userId);
        return buildProfileResponse(user);
    }

    @Transactional
    public void updateAccountStatus(UUID userId, User.AccountStatus status) {
        log.info("Updating account status for user {} to {}", userId, status);

        User user = getById(userId);
        user.setAccountStatus(status);
        userRepository.save(user);

        log.info("Account status updated for user: {}", userId);
    }

    @Transactional
    public void verifyEmail(UUID userId) {
        log.info("Verifying email for user: {}", userId);

        User user = getById(userId);
        user.setEmailVerified(true);
        if (user.getAccountStatus() == User.AccountStatus.PENDING_VERIFICATION) {
            user.setAccountStatus(User.AccountStatus.ACTIVE);
        }
        userRepository.save(user);

        log.info("Email verified for user: {}", userId);
    }

    @Transactional
    public void softDelete(UUID userId) {
        log.info("Soft deleting user: {}", userId);

        User user = getById(userId);
        user.setDeletedAt(java.time.Instant.now());
        user.setAccountStatus(User.AccountStatus.DEACTIVATED);
        userRepository.save(user);

        log.info("User soft deleted: {}", userId);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(UUID userId) {
        User user = getById(userId);
        return buildProfileResponse(user);
    }

    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email.toLowerCase());
    }

    @Transactional(readOnly = true)
    public boolean existsByStudentId(String studentId) {
        return userRepository.existsByStudentId(studentId);
    }

    @Transactional(readOnly = true)
    public boolean existsByEmployeeId(String employeeId) {
        return userRepository.existsByEmployeeId(employeeId);
    }

    private UserProfileResponse buildProfileResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .studentId(user.getStudentId())
                .employeeId(user.getEmployeeId())
                .phoneNumber(user.getPhoneNumber())
                .profileImageUrl(user.getProfileImageUrl())
                .userType(user.getUserType())
                .role(user.getRole().getName())
                .accountStatus(user.getAccountStatus())
                .emailVerified(user.getEmailVerified())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }
}