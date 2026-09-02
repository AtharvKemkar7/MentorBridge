package com.alumni.platform.identity.repository;

import com.alumni.platform.identity.entity.Role;
import com.alumni.platform.identity.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
@Testcontainers
class UserRepositoryTest {

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
    }

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Test
    void findByEmail_ExistingEmail_ShouldReturnUser() {
        Role role = createRole("STUDENT");
        User user = createUser("test@example.com", role);

        entityManager.persistAndFlush(role);
        entityManager.persistAndFlush(user);

        Optional<User> found = userRepository.findByEmail("test@example.com");

        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("test@example.com");
    }

    @Test
    void findByEmail_NonExistentEmail_ShouldReturnEmpty() {
        Optional<User> found = userRepository.findByEmail("nonexistent@example.com");

        assertThat(found).isEmpty();
    }

    @Test
    void existsByEmail_ExistingEmail_ShouldReturnTrue() {
        Role role = createRole("STUDENT");
        User user = createUser("test@example.com", role);

        entityManager.persistAndFlush(role);
        entityManager.persistAndFlush(user);

        boolean exists = userRepository.existsByEmail("test@example.com");

        assertThat(exists).isTrue();
    }

    @Test
    void existsByEmail_NonExistentEmail_ShouldReturnFalse() {
        boolean exists = userRepository.existsByEmail("nonexistent@example.com");

        assertThat(exists).isFalse();
    }

    @Test
    void findByStudentId_ExistingStudentId_ShouldReturnUser() {
        Role role = createRole("STUDENT");
        User user = createUser("test@example.com", role);
        user.setStudentId("STU12345");

        entityManager.persistAndFlush(role);
        entityManager.persistAndFlush(user);

        Optional<User> found = userRepository.findByStudentId("STU12345");

        assertThat(found).isPresent();
        assertThat(found.get().getStudentId()).isEqualTo("STU12345");
    }

    @Test
    void findByAccountStatus_ShouldReturnUsersWithStatus() {
        Role role = createRole("STUDENT");
        User activeUser = createUser("active@example.com", role);
        activeUser.setAccountStatus(User.AccountStatus.ACTIVE);

        User suspendedUser = createUser("suspended@example.com", role);
        suspendedUser.setAccountStatus(User.AccountStatus.SUSPENDED);

        entityManager.persistAndFlush(role);
        entityManager.persistAndFlush(activeUser);
        entityManager.persistAndFlush(suspendedUser);

        var activeUsers = userRepository.findByAccountStatus(User.AccountStatus.ACTIVE);
        var suspendedUsers = userRepository.findByAccountStatus(User.AccountStatus.SUSPENDED);

        assertThat(activeUsers).hasSize(1);
        assertThat(suspendedUsers).hasSize(1);
    }

    @Test
    void findByUserType_ShouldReturnUsersOfType() {
        Role studentRole = createRole("STUDENT");
        Role alumniRole = createRole("ALUMNI");

        User student = createUser("student@example.com", studentRole);
        student.setUserType(User.UserType.STUDENT);

        User alumni = createUser("alumni@example.com", alumniRole);
        alumni.setUserType(User.UserType.ALUMNI);

        entityManager.persistAndFlush(studentRole);
        entityManager.persistAndFlush(alumniRole);
        entityManager.persistAndFlush(student);
        entityManager.persistAndFlush(alumni);

        var students = userRepository.findByUserType(User.UserType.STUDENT);
        var alumniUsers = userRepository.findByUserType(User.UserType.ALUMNI);

        assertThat(students).hasSize(1);
        assertThat(alumniUsers).hasSize(1);
    }

    private Role createRole(String name) {
        return Role.builder()
                .id(UUID.randomUUID())
                .name(name)
                .description(name + " role")
                .build();
    }

    private User createUser(String email, Role role) {
        return User.builder()
                .id(UUID.randomUUID())
                .email(email)
                .passwordHash("encodedPassword")
                .firstName("John")
                .lastName("Doe")
                .userType(User.UserType.STUDENT)
                .role(role)
                .accountStatus(User.AccountStatus.ACTIVE)
                .emailVerified(true)
                .build();
    }
}