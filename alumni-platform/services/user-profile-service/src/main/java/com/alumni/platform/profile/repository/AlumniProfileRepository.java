package com.alumni.platform.profile.repository;

import com.alumni.platform.profile.entity.AlumniProfile;
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
public interface AlumniProfileRepository extends JpaRepository<AlumniProfile, UUID> {

    Optional<AlumniProfile> findByUserId(UUID userId);

    Optional<AlumniProfile> findByEmployeeId(String employeeId);

    boolean existsByUserId(UUID userId);

    boolean existsByEmployeeId(String employeeId);

    List<AlumniProfile> findByCurrentCompany(String company);

    List<AlumniProfile> findByJobTitle(String jobTitle);

    List<AlumniProfile> findByGraduationYear(Integer graduationYear);

    List<AlumniProfile> findByDepartment(String department);

    List<AlumniProfile> findByIsMentorTrue();

    List<AlumniProfile> findByVerificationStatus(AlumniProfile.VerificationStatus status);

    List<AlumniProfile> findByIsPublicTrue();

    @Query("SELECT ap FROM AlumniProfile ap WHERE ap.isPublic = true AND ap.profileCompleteness > :minCompleteness")
    Page<AlumniProfile> findPublicProfilesWithMinCompleteness(@Param("minCompleteness") Integer minCompleteness, Pageable pageable);

    @Query("SELECT ap FROM AlumniProfile ap WHERE ap.isPublic = true AND ap.isMentor = true " +
           "AND ap.currentMenteesCount < ap.maxMentees " +
           "AND (:company IS NULL OR ap.currentCompany = :company) " +
           "AND (:jobTitle IS NULL OR ap.jobTitle = :jobTitle) " +
           "AND (:industry IS NULL OR ap.industry = :industry) " +
           "AND (:graduationYear IS NULL OR ap.graduationYear = :graduationYear) " +
           "AND (:department IS NULL OR ap.department = :department) " +
           "AND (:skill IS NULL OR EXISTS (SELECT 1 FROM Skill s WHERE s.alumniProfile = ap AND LOWER(s.name) LIKE LOWER(CONCAT('%', :skill, '%')))) " +
           "AND (:expertise IS NULL OR EXISTS (SELECT 1 FROM ExpertiseArea ea WHERE ea.alumniProfile = ap AND LOWER(ea.name) LIKE LOWER(CONCAT('%', :expertise, '%'))))")
    Page<AlumniProfile> searchMentors(@Param("company") String company,
                                       @Param("jobTitle") String jobTitle,
                                       @Param("industry") String industry,
                                       @Param("graduationYear") Integer graduationYear,
                                       @Param("department") String department,
                                       @Param("skill") String skill,
                                       @Param("expertise") String expertise,
                                       Pageable pageable);

    @Query("SELECT ap FROM AlumniProfile ap WHERE ap.isPublic = true " +
           "AND (:company IS NULL OR ap.currentCompany = :company) " +
           "AND (:jobTitle IS NULL OR ap.jobTitle = :jobTitle) " +
           "AND (:industry IS NULL OR ap.industry = :industry) " +
           "AND (:graduationYear IS NULL OR ap.graduationYear = :graduationYear) " +
           "AND (:department IS NULL OR ap.department = :department) " +
           "AND (:skill IS NULL OR EXISTS (SELECT 1 FROM Skill s WHERE s.alumniProfile = ap AND LOWER(s.name) LIKE LOWER(CONCAT('%', :skill, '%'))))")
    Page<AlumniProfile> searchAlumni(@Param("company") String company,
                                      @Param("jobTitle") String jobTitle,
                                      @Param("industry") String industry,
                                      @Param("graduationYear") Integer graduationYear,
                                      @Param("department") String department,
                                      @Param("skill") String skill,
                                      Pageable pageable);

    @Query("SELECT ap FROM AlumniProfile ap WHERE ap.userId IN :userIds")
    List<AlumniProfile> findByUserIds(@Param("userIds") List<UUID> userIds);
}