package com.alumni.platform.notification.service;

import com.alumni.platform.notification.entity.EmailTemplate;
import com.alumni.platform.notification.entity.Notification;
import com.alumni.platform.notification.exception.EmailSendException;
import com.alumni.platform.notification.repository.EmailTemplateRepository;
import com.alumni.platform.notification.repository.NotificationRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final EmailTemplateRepository templateRepository;
    private final NotificationRepository notificationRepository;

    public EmailService(JavaMailSender mailSender,
                        EmailTemplateRepository templateRepository,
                        NotificationRepository notificationRepository) {
        this.mailSender = mailSender;
        this.templateRepository = templateRepository;
        this.notificationRepository = notificationRepository;
    }

    @Async
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000, multiplier = 2))
    public void sendAsync(Notification notification) {
        try {
            String htmlBody = buildBody(notification);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(getUserEmail(notification.getUserId())); // placeholder: need user email from identity service; for now dummy
            helper.setSubject(notification.getTitle());
            helper.setText(htmlBody, true);
            mailSender.send(message);

            notification.setStatus("SENT");
            notification.setSentAt(java.time.OffsetDateTime.now());
            notificationRepository.save(notification);
            log.info("Email sent for notification {}", notification.getId());
        } catch (MessagingException e) {
            log.error("Failed to send email for notification {}", notification.getId(), e);
            notification.setStatus("FAILED");
            notificationRepository.save(notification);
            throw new EmailSendException("Failed to send email", e);
        }
    }

    private String buildBody(Notification notification) {
        // try template by type
        Optional<EmailTemplate> tmpl = templateRepository.findByName(notification.getType());
        if (tmpl.isPresent()) {
            String body = tmpl.get().getBody();
            // simple placeholder replacement
            body = body.replace("{{title}}", notification.getTitle())
                       .replace("{{body}}", notification.getBody());
            return body;
        }
        // fallback plain
        return "<html><body><h1>" + notification.getTitle() + "</h1><p>" + notification.getBody() + "</p></body></html>";
    }

    private String getUserEmail(UUID userId) {
        // In real impl, call Identity Service to fetch email. For now return dummy.
        return "user-" + userId + "@example.com";
    }
}