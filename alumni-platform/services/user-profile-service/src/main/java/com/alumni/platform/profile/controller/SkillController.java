package com.alumni.platform.profile.controller;

import com.alumni.platform.profile.dto.request.SkillRequest;
import com.alumni.platform.profile.dto.response.StudentProfileResponse;
import com.alumni.platform.profile.entity.Skill;
import com.alumni.platform.profile.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/profile/skills")
@RequiredArgsConstructor
public class SkillController {

    private final ProfileService profileService;

    @PostMapping
    public ResponseEntity<StudentProfileResponse.SkillResponse> addSkill(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody SkillRequest request) {
        Skill skill = mapToEntity(request);
        Skill saved = profileService.addSkill(userId, skill);
        return ResponseEntity.ok(mapToResponse(saved));
    }

    @DeleteMapping("/{skillId}")
    public ResponseEntity<Void> deleteSkill(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID skillId) {
        profileService.deleteSkill(userId, skillId);
        return ResponseEntity.ok().build();
    }

    private Skill mapToEntity(SkillRequest request) {
        Skill skill = new Skill();
        skill.setName(request.getName());
        skill.setCategory(request.getCategory());
        skill.setProficiency(request.getProficiency());
        skill.setYearsOfExperience(request.getYearsOfExperience());
        skill.setIsFeatured(request.getIsFeatured());
        return skill;
    }

    private StudentProfileResponse.SkillResponse mapToResponse(Skill s) {
        return StudentProfileResponse.SkillResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .category(s.getCategory())
                .proficiency(s.getProficiency())
                .yearsOfExperience(s.getYearsOfExperience())
                .isFeatured(s.getIsFeatured())
                .build();
    }
}