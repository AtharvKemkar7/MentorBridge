package com.alumni.platform.profile.repository;

import com.alumni.platform.profile.entity.CareerInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CareerInterestRepository extends JpaRepository<CareerInterest, UUID> {

    List<CareerInterest> findByStudentProfileIdOrderByPriorityAsc(UUID studentProfileId);

    void deleteByStudentProfileId(UUID studentProfileId);
}