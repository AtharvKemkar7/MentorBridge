package com.alumni.platform.profile.repository;

import com.alumni.platform.profile.entity.StudentProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, UUID> {

    Optional<StudentProfile> findByUserId(UUID userId);

    Optional<StudentProfile> findByStudentId(String studentId);

    boolean existsByUserId(UUID userId);

    boolean existsByStudentId(String studentId);

    List<StudentProfile> findByDepartment(String department);

    List<StudentProfile> findByGraduationYear(Integer graduationYear);

    List<StudentProfile> findByIsPublicTrue();

    @Query("SELECT sp FROM StudentProfile sp WHERE sp.isPublic = true AND sp.profileCompleteness > :minCompleteness")
    Page<StudentProfile> findPublicProfilesWithMinCompleteness(@Param("minCompleteness") Integer minCompleteness, Pageable pageable);

    @Query("SELECT sp FROM StudentProfile sp WHERE sp.isPublic = true AND (:department IS NULL OR sp.department = :department) " +
           "AND (:graduationYear IS NULL OR sp.graduationYear = :graduationYear) " +
           "AND (:skill IS NULL OR EXISTS (SELECT 1 FROM Skill s WHERE s.studentProfile = sp AND LOWER(s.name) LIKE LOWER(CONCAT('%', :skill, '%'))))")
    Page<StudentProfile> searchPublicProfiles(@Param("department") String department,
                                               @Param("graduationYear") Integer graduationYear,
                                               @Param("skill") String skill,
                                               Pageable pageable);

    @Query("SELECT sp FROM StudentProfile sp WHERE sp.userId IN :userIds")
    List<StudentProfile> findByUserIds(@Param("userIds") List<UUID> userIds);
}