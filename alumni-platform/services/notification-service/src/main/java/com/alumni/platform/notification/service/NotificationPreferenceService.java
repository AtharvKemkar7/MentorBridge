package com.alumni.platform.notification.service;

import com.alumni.platform.notification.dto.PreferenceRequest;
import com.alumni.platform.notification.dto.PreferenceResponse;
import com.alumni.platform.notification.entity.NotificationPreference;
import com.alumni.platform.notification.repository.NotificationPreferenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@Transactional
public class NotificationPreferenceService {

    private final NotificationPreferenceRepository preferenceRepository;

    public NotificationPreferenceService(NotificationPreferenceRepository preferenceRepository) {
        this.preferenceRepository = preferenceRepository;
    }

    public NotificationPreference getOrCreate(UUID userId) {
        return preferenceRepository.findByUserId(userId)
                .orElseGet(() -> {
                    NotificationPreference p = new NotificationPreference();
                    p.setUserId(userId);
                    return preferenceRepository.save(p);
                });
    }

    @Transactional(readOnly = true)
    public PreferenceResponse getPreferences(UUID userId) {
        NotificationPreference p = getOrCreate(userId);
        return toResponse(p);
    }

    public PreferenceResponse updatePreferences(UUID userId, PreferenceRequest req) {
        NotificationPreference p = getOrCreate(userId);
        p.setEmailEnabled(req.getEmailEnabled());
        p.setInAppEnabled(req.getInAppEnabled());
        p.setEmailOnMentorshipRequest(req.getEmailOnMentorshipRequest());
        p.setEmailOnBookingConfirmed(req.getEmailOnBookingConfirmed());
        p.setEmailOnSessionReminder(req.getEmailOnSessionReminder());
        p.setEmailOnReviewPublished(req.getEmailOnReviewPublished());
        p = preferenceRepository.save(p);
        return toResponse(p);
    }

    private PreferenceResponse toResponse(NotificationPreference p) {
        return new PreferenceResponse(
                p.getUserId(),
                p.getEmailEnabled(),
                p.getInAppEnabled(),
                p.getEmailOnMentorshipRequest(),
                p.getEmailOnBookingConfirmed(),
                p.getEmailOnSessionReminder(),
                p.getEmailOnReviewPublished(),
                p.getUpdatedAt()
        );
    }
}