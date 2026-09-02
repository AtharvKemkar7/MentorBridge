package com.alumni.platform.profile.controller;

import com.alumni.platform.profile.dto.response.AlumniProfileResponse;
import com.alumni.platform.profile.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/mentors")
    public ResponseEntity<Page<AlumniProfileResponse>> searchMentors(
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String jobTitle,
            @RequestParam(required = false) String industry,
            @RequestParam(required = false) Integer graduationYear,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String expertise,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "profileCompleteness,desc") String sort) {

        Sort.Direction direction = sort.endsWith(",desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        String sortProperty = sort.replace(",desc", "").replace(",asc", "");
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortProperty));

        Page<AlumniProfileResponse> result = searchService.searchMentors(
                company, jobTitle, industry, graduationYear, department, skill, expertise, pageable);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/alumni")
    public ResponseEntity<Page<AlumniProfileResponse>> searchAlumni(
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String jobTitle,
            @RequestParam(required = false) String industry,
            @RequestParam(required = false) Integer graduationYear,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String skill,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "profileCompleteness,desc") String sort) {

        Sort.Direction direction = sort.endsWith(",desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        String sortProperty = sort.replace(",desc", "").replace(",asc", "");
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortProperty));

        Page<AlumniProfileResponse> result = searchService.searchAlumni(
                company, jobTitle, industry, graduationYear, department, skill, pageable);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/recommended-mentors")
    public ResponseEntity<List<AlumniProfileResponse>> getRecommendedMentors(
            @RequestHeader("X-User-Id") UUID studentId,
            @RequestParam(defaultValue = "10") int limit) {
        List<AlumniProfileResponse> result = searchService.getRecommendedMentors(studentId, limit);
        return ResponseEntity.ok(result);
    }
}