package com.alumni.platform.identity.service;

import com.alumni.platform.identity.dto.request.LoginRequest;
import com.alumni.platform.identity.dto.request.RegisterRequest;
import com.alumni.platform.identity.entity.Role;
import com.alumni.platform.identity.entity.User;
import com.alumni.platform.identity.exception.EmailAlreadyExistsException;
import com.alumni.platform.identity.exception.InvalidCredentialsException;
import com.alumni.platform.identity.repository.RoleRepository;
import com.alumni.platform.identity.repository.UserRepository;
import com.alumni.platform.identity.security.jwt.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private TokenService tokenService;

    @InjectMocks
    private AuthService authService;

    private Role studentRole;
    private User testUser;

    @BeforeEach
    void setUp() {
        studentRole = Role.builder()
                .id(UUID.randomUUID())
                .name("STUDENT")
                .build();

        testUser = User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .passwordHash("encodedPassword")
                .firstName("John")
                .lastName("Doe")
                .userType(User.UserType.STUDENT)
                .role(studentRole)
                .accountStatus(User.AccountStatus.ACTIVE)
                .emailVerified(true)
                .build();
    }

    @Test
    void register_ValidRequest_ShouldReturnAuthResponse() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("new@example.com");
        request.setPassword("SecurePass123!");
        request.setFirstName("Jane");
        request.setLastName("Smith");
        request.setUserType(User.UserType.STUDENT);
        request.setRoleName("STUDENT");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(roleRepository.findByName("STUDENT")).thenReturn(Optional.of(studentRole));
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("access-token");
        when(jwtTokenProvider.generateRefreshToken(any(User.class), anyString(), anyString())).thenReturn("refresh-token");

        var response = authService.register(request, "device-info", "127.0.0.1");

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("access-token");
        assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
        verify(userRepository).save(any(User.class));
        verify(tokenService).saveRefreshToken(any(User.class), anyString(), anyString(), anyString());
    }

    @Test
    void register_ExistingEmail_ShouldThrowException() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existing@example.com");
        request.setPassword("SecurePass123!");
        request.setFirstName("Jane");
        request.setLastName("Smith");
        request.setUserType(User.UserType.STUDENT);
        request.setRoleName("STUDENT");

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request, "device", "127.0.0.1"))
                .isInstanceOf(EmailAlreadyExistsException.class);
    }

    @Test
    void login_ValidCredentials_ShouldReturnAuthResponse() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("SecurePass123!");

        when(userRepository.findActiveByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mock(Authentication.class));
        when(jwtTokenProvider.generateAccessToken(testUser)).thenReturn("access-token");
        when(jwtTokenProvider.generateRefreshToken(any(User.class), anyString(), anyString())).thenReturn("refresh-token");

        var response = authService.login(request, "device-info", "127.0.0.1");

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("access-token");
        verify(userRepository).save(argThat(u -> u.getFailedLoginAttempts() == 0));
    }

    @Test
    void login_InvalidCredentials_ShouldThrowException() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("WrongPassword");

        when(userRepository.findActiveByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new org.springframework.security.authentication.BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(request, "device", "127.0.0.1"))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void login_NonExistentUser_ShouldThrowException() {
        LoginRequest request = new LoginRequest();
        request.setEmail("nonexistent@example.com");
        request.setPassword("SecurePass123!");

        when(userRepository.findActiveByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request, "device", "127.0.0.1"))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void changePassword_ValidCurrentPassword_ShouldUpdatePassword() {
        UUID userId = testUser.getId();
        var request = new com.alumni.platform.identity.dto.request.ChangePasswordRequest();
        request.setCurrentPassword("currentPassword");
        request.setNewPassword("NewSecurePass123!");
        request.setConfirmPassword("NewSecurePass123!");

        when(userRepository.findActiveById(userId)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("currentPassword", testUser.getPasswordHash())).thenReturn(true);
        when(passwordEncoder.matches("NewSecurePass123!", testUser.getPasswordHash())).thenReturn(false);
        when(passwordEncoder.encode("NewSecurePass123!")).thenReturn("newEncodedPassword");

        authService.changePassword(userId, request);

        verify(userRepository).save(argThat(u -> u.getPasswordHash().equals("newEncodedPassword")));
        verify(tokenService).revokeAllUserTokens(any(User.class), anyString());
    }

    @Test
    void changePassword_InvalidCurrentPassword_ShouldThrowException() {
        UUID userId = testUser.getId();
        var request = new com.alumni.platform.identity.dto.request.ChangePasswordRequest();
        request.setCurrentPassword("wrongPassword");
        request.setNewPassword("NewSecurePass123!");
        request.setConfirmPassword("NewSecurePass123!");

        when(userRepository.findActiveById(userId)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPassword", testUser.getPasswordHash())).thenReturn(false);

        assertThatThrownBy(() -> authService.changePassword(userId, request))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void changePassword_SameAsCurrentPassword_ShouldThrowException() {
        UUID userId = testUser.getId();
        var request = new com.alumni.platform.identity.dto.request.ChangePasswordRequest();
        request.setCurrentPassword("currentPassword");
        request.setNewPassword("currentPassword");
        request.setConfirmPassword("currentPassword");

        when(userRepository.findActiveById(userId)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("currentPassword", testUser.getPasswordHash())).thenReturn(true);
        when(passwordEncoder.matches("currentPassword", testUser.getPasswordHash())).thenReturn(true);

        assertThatThrownBy(() -> authService.changePassword(userId, request))
                .isInstanceOf(com.alumni.platform.identity.exception.PasswordReuseException.class);
    }
}