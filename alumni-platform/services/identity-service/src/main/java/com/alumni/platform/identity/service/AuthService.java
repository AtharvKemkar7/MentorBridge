package com.alumni.platform.identity.service;

import com.alumni.platform.identity.dto.request.LoginRequest;
import com.alumni.platform.identity.dto.request.RegisterRequest;
import com.alumni.platform.identity.dto.request.RefreshTokenRequest;
import com.alumni.platform.identity.dto.request.ChangePasswordRequest;
import com.alumni.platform.identity.dto.request.ForgotPasswordRequest;
import com.alumni.platform.identity.dto.request.ResetPasswordRequest;
import com.alumni.platform.identity.dto.response.AuthResponse;
import com.alumni.platform.identity.dto.response.TokenResponse;
import com.alumni.platform.identity.entity.RefreshToken;
import com.alumni.platform.identity.entity.Role;
import com.alumni.platform.identity.entity.User;
import com.alumni.platform.identity.exception.*;
import com.alumni.platform.identity.repository.RefreshTokenRepository;
import com.alumni.platform.identity.repository.RoleRepository;
import com.alumni.platform.identity.repository.UserRepository;
import com.alumni.platform.identity.security.jwt.JwtTokenProvider;
import com.alumni.platform.identity.event.UserRegisteredEvent;
import com.alumni.platform.identity.event.PasswordChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public AuthResponse register(RegisterRequest request, String deviceInfo, String ipAddress) {
        log.info("Registering new user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already registered: " + request.getEmail());
        }

        if (request.getStudentId() != null && userRepository.existsByStudentId(request.getStudentId())) {
            throw new StudentIdAlreadyExistsException("Student ID already registered: " + request.getStudentId());
        }

        if (request.getEmployeeId() != null && userRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new EmployeeIdAlreadyExistsException("Employee ID already registered: " + request.getEmployeeId());
        }

        Role role = roleRepository.findByName(request.getRoleName())
                .orElseThrow(() -> new RoleNotFoundException("Role not found: " + request.getRoleName()));

        User user = User.builder()
                .email(request.getEmail().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .studentId(request.getStudentId())
                .employeeId(request.getEmployeeId())
                .phoneNumber(request.getPhoneNumber())
                .userType(request.getUserType())
                .role(role)
                .accountStatus(User.AccountStatus.PENDING_VERIFICATION)
                .emailVerified(false)
                .build();

        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            log.error("Data integrity violation during registration: {}", e.getMessage());
            throw new RegistrationException("Registration failed due to data conflict");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user, deviceInfo, ipAddress);

        tokenService.saveRefreshToken(user, refreshToken, deviceInfo, ipAddress);

        eventPublisher.publishEvent(new UserRegisteredEvent(this, user.getId(), user.getEmail(), user.getUserType()));

        log.info("User registered successfully: {}", user.getId());
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessTokenExpirationMs())
                .user(buildUserResponse(user))
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String deviceInfo, String ipAddress) {
        log.info("Login attempt for email: {}", request.getEmail());

        User user = userRepository.findActiveByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!user.isEnabled()) {
            handleDisabledUser(user);
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase(), request.getPassword())
            );

            user.setLastLoginAt(Instant.now());
            user.setFailedLoginAttempts(0);
            user.setLockedUntil(null);
            userRepository.save(user);

            String accessToken = jwtTokenProvider.generateAccessToken(user);
            String refreshToken = jwtTokenProvider.generateRefreshToken(user, deviceInfo, ipAddress);

            tokenService.saveRefreshToken(user, refreshToken, deviceInfo, ipAddress);

            log.info("User logged in successfully: {}", user.getId());
            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(jwtTokenProvider.getAccessTokenExpirationMs())
                    .user(buildUserResponse(user))
                    .build();

        } catch (BadCredentialsException e) {
            handleFailedLogin(user);
            throw new InvalidCredentialsException("Invalid email or password");
        }
    }

    @Transactional
    public TokenResponse refreshToken(RefreshTokenRequest request, String deviceInfo, String ipAddress) {
        log.debug("Refresh token request");

        RefreshToken storedToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new InvalidTokenException("Invalid refresh token"));

        if (storedToken.isRevoked()) {
            if (storedToken.getReplacedByToken() != null) {
                log.warn("Possible token reuse detected for user: {}", storedToken.getUser().getId());
                tokenService.revokeAllUserTokens(storedToken.getUser(), "Potential token theft detected");
            }
            throw new TokenRevokedException("Refresh token has been revoked");
        }

        if (storedToken.isExpired()) {
            throw new TokenExpiredException("Refresh token has expired");
        }

        User user = storedToken.getUser();

        if (!user.isEnabled()) {
            throw new AccountDisabledException("Account is disabled or not verified");
        }

        String newAccessToken = jwtTokenProvider.generateAccessToken(user);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user, deviceInfo, ipAddress);

        tokenService.revokeAndReplaceToken(storedToken.getToken(), newRefreshToken, "Token rotation");

        log.debug("Tokens refreshed for user: {}", user.getId());
        return TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessTokenExpirationMs())
                .build();
    }

    @Transactional
    public void logout(String refreshToken) {
        log.debug("Logout request");

        refreshTokenRepository.findByToken(refreshToken)
                .ifPresent(token -> {
                    token.setRevoked(true);
                    token.setRevokedAt(Instant.now());
                    token.setRevokedReason("User logout");
                    refreshTokenRepository.save(token);
                });
    }

    @Transactional
    public void logoutAllDevices(UUID userId) {
        log.info("Logout all devices for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userId));

        tokenService.revokeAllUserTokens(user, "Logout all devices");
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        log.info("Change password for user: {}", userId);

        User user = userRepository.findActiveById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new PasswordReuseException("New password must be different from current password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChangedAt(Instant.now());
        userRepository.save(user);

        tokenService.revokeAllUserTokens(user, "Password changed");

        eventPublisher.publishEvent(new PasswordChangedEvent(this, userId));

        log.info("Password changed successfully for user: {}", userId);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        log.info("Forgot password request for email: {}", request.getEmail());

        Optional<User> userOpt = userRepository.findActiveByEmail(request.getEmail().toLowerCase());

        if (userOpt.isEmpty()) {
            log.debug("Forgot password requested for non-existent email: {}", request.getEmail());
            return;
        }

        User user = userOpt.get();
        // TODO: Send password reset email with token
        // For now, we'll just log it
        log.info("Password reset email would be sent to: {}", user.getEmail());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        log.info("Reset password with token");

        // TODO: Validate reset token from email
        // For now, we'll implement basic version
        throw new UnsupportedOperationException("Password reset via email token not yet implemented");
    }

    private void handleDisabledUser(User user) {
        switch (user.getAccountStatus()) {
            case PENDING_VERIFICATION -> throw new AccountNotVerifiedException("Please verify your email address");
            case SUSPENDED -> throw new AccountSuspendedException("Account has been suspended");
            case DEACTIVATED -> throw new AccountDeactivatedException("Account has been deactivated");
            case LOCKED -> throw new AccountLockedException("Account is temporarily locked");
            default -> throw new AccountDisabledException("Account is disabled");
        }
    }

    private void handleFailedLogin(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);

        if (attempts >= 5) {
            user.setLockedUntil(Instant.now().plusSeconds(900)); // 15 minutes
            log.warn("Account locked due to failed login attempts: {}", user.getId());
        }

        userRepository.save(user);
    }

    private AuthResponse.UserResponse buildUserResponse(User user) {
        return AuthResponse.UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .userType(user.getUserType())
                .role(user.getRole().getName())
                .accountStatus(user.getAccountStatus())
                .emailVerified(user.getEmailVerified())
                .build();
    }
}