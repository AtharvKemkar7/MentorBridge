package com.alumni.platform.identity.repository;

import com.alumni.platform.identity.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByStudentId(String studentId);

    Optional<User> findByEmployeeId(String employeeId);

    boolean existsByEmail(String email);

    boolean existsByStudentId(String studentId);

    boolean existsByEmployeeId(String employeeId);

    List<User> findByAccountStatus(User.AccountStatus status);

    List<User> findByUserType(User.UserType userType);

    List<User> findByRole_Name(String roleName);

    @Query("SELECT u FROM User u WHERE u.email = :email AND u.deletedAt IS NULL")
    Optional<User> findActiveByEmail(@Param("email") String email);

    @Query("SELECT u FROM User u WHERE u.id = :id AND u.deletedAt IS NULL")
    Optional<User> findActiveById(@Param("id") UUID id);

    long countByEmail(String email);

    long countByStudentId(String studentId);

    @Query("SELECT u FROM User u WHERE u.failedLoginAttempts >= 5 AND u.lockedUntil IS NULL")
    List<User> findUsersWithFailedAttempts();

    @Query("SELECT u FROM User u WHERE u.lockedUntil IS NOT NULL AND u.lockedUntil < :now")
    List<User> findUsersToUnlock(@Param("now") java.time.Instant now);
}