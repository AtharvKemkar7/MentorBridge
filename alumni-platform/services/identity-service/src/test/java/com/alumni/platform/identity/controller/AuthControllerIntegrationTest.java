package com.alumni.platform.identity.controller;

import com.alumni.platform.identity.dto.request.LoginRequest;
import com.alumni.platform.identity.dto.request.RegisterRequest;
import com.alumni.platform.identity.entity.Role;
import com.alumni.platform.identity.entity.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class AuthControllerIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("identity_db")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
        registry.add("spring.flyway.enabled", () -> "false");
        registry.add("app.jwt.secret", () -> "ZmY2M2I1NjY3OWM0NjU5NmY3ODk4YzY3ODk4YzY3ODk4YzY3ODk4YzY3ODk4YzY3ODk4Yw==");
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void register_ValidRequest_ShouldReturn201() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("newuser@example.com");
        request.setPassword("SecurePass123!");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setUserType(User.UserType.STUDENT);
        request.setRoleName("STUDENT");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value("newuser@example.com"));
    }

    @Test
    void register_DuplicateEmail_ShouldReturn409() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("duplicate@example.com");
        request.setPassword("SecurePass123!");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setUserType(User.UserType.STUDENT);
        request.setRoleName("STUDENT");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("EMAIL_ALREADY_EXISTS"));
    }

    @Test
    void register_InvalidEmail_ShouldReturn400() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("invalid-email");
        request.setPassword("SecurePass123!");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setUserType(User.UserType.STUDENT);
        request.setRoleName("STUDENT");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void register_WeakPassword_ShouldReturn400() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("weakpass@example.com");
        request.setPassword("weak");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setUserType(User.UserType.STUDENT);
        request.setRoleName("STUDENT");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void login_ValidCredentials_ShouldReturnTokens() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setEmail("logintest@example.com");
        registerRequest.setPassword("SecurePass123!");
        registerRequest.setFirstName("Login");
        registerRequest.setLastName("Test");
        registerRequest.setUserType(User.UserType.STUDENT);
        registerRequest.setRoleName("STUDENT");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("logintest@example.com");
        loginRequest.setPassword("SecurePass123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists());
    }

    @Test
    void login_InvalidCredentials_ShouldReturn401() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("nonexistent@example.com");
        loginRequest.setPassword("WrongPassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
    }

    @Test
    void refreshToken_ValidToken_ShouldReturnNewTokens() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setEmail("refreshtest@example.com");
        registerRequest.setPassword("SecurePass123!");
        registerRequest.setFirstName("Refresh");
        registerRequest.setLastName("Test");
        registerRequest.setUserType(User.UserType.STUDENT);
        registerRequest.setRoleName("STUDENT");

        var registerResponse = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String refreshToken = objectMapper.readTree(registerResponse.getResponse().getContentAsString())
                .get("refreshToken").asText();

        var refreshRequest = new com.alumni.platform.identity.dto.request.RefreshTokenRequest();
        refreshRequest.setRefreshToken(refreshToken);

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists());
    }

    @Test
    void refreshToken_InvalidToken_ShouldReturn401() throws Exception {
        var refreshRequest = new com.alumni.platform.identity.dto.request.RefreshTokenRequest();
        refreshRequest.setRefreshToken("invalid-token");

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_TOKEN"));
    }
}