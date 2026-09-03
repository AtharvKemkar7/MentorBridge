package com.alumni.platform.notification.service;

import com.alumni.platform.notification.dto.NotificationResponse;
import com.alumni.platform.notification.dto.PageResponse;
import com.alumni.platform.notification.entity.Notification;
import com.alumni.platform.notification.exception.NotificationNotFoundException;
import com.alumni.platform.notification.exception.UnauthorizedNotificationAccessException;
import com.alumni.platform.notification.repository.NotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final NotificationPreferenceService preferenceService;

    public NotificationService(NotificationRepository notificationRepository,
                               EmailService emailService,
                               NotificationPreferenceService preferenceService) {
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
        this.preferenceService = preferenceService;
    }

    public Notification createInAppNotification(UUID userId, String type, String title, String body,
                                                UUID referenceId, String referenceType) {
        var pref = preferenceService.getOrCreate(userId);
        if (!pref.getInAppEnabled()) return null;

        Notification n = new Notification();
        n.setId(UUID.randomUUID());
        n.setUserId(userId);
        n.setType(type);
        n.setTitle(title);
        n.setBody(body);
        n.setChannel("IN_APP");
        n.setStatus("SENT");
        n.setReferenceId(referenceId);
        n.setReferenceType(referenceType);
        n.setSentAt(OffsetDateTime.now());
        return notificationRepository.save(n);
    }

    public void createEmailNotification(UUID userId, String type, String title, String body,
                                        UUID referenceId, String referenceType) {
        var pref = preferenceService.getOrCreate(userId);
        if (!pref.getEmailEnabled()) return;

        Notification n = new Notification();
        n.setId(UUID.randomUUID());
        n.setUserId(userId);
        n.setType(type);
        n.setTitle(title);
        n.setBody(body);
        n.setChannel("EMAIL");
        n.setStatus("PENDING");
        n.setReferenceId(referenceId);
        n.setReferenceType(referenceType);
        notificationRepository.save(n);
        // send asynchronously
        emailService.sendAsync(n);
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getUserNotifications(UUID userId, Pageable pageable) {
        Page<Notification> page = notificationRepository.findByUserId(userId, pageable);
        return new PageResponse<>(page.map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    public void markAsRead(UUID userId, UUID notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException("Notification not found"));
        if (!n.getUserId().equals(userId)) {
            throw new UnauthorizedNotificationAccessException("Not your notification");
        }
        if (!n.getRead()) {
            n.setRead(true);
            n.setReadAt(OffsetDateTime.now());
            notificationRepository.save(n);
        }
    }

    public void markAllAsRead(UUID userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalse(userId);
        unread.forEach(n -> {
            n.setRead(true);
            n.setReadAt(OffsetDateTime.now());
        });
        notificationRepository.saveAll(unread);
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(), n.getUserId(), n.getType(), n.getTitle(), n.getBody(),
                n.getChannel(), n.getStatus(), n.getRead(),
                n.getReferenceId(), n.getReferenceType(),
                n.getCreatedAt(), n.getSentAt(), n.getReadAt()
        );
    }
}