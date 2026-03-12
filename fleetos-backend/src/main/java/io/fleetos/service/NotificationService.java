package io.fleetos.service;

import io.fleetos.dto.response.PageResponse;
import io.fleetos.dto.response.notification.NotificationCountDto;
import io.fleetos.dto.response.notification.NotificationDto;
import io.fleetos.entity.Notification;
import io.fleetos.entity.User;
import io.fleetos.enums.NotificationType;
import io.fleetos.enums.UserRole;
import io.fleetos.exception.ResourceNotFoundException;
import io.fleetos.repository.NotificationRepository;
import io.fleetos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository         userRepository;

    // ----------------------------------------------------------------
    // Create a notification for a single user
    // ----------------------------------------------------------------
    @Async
    @Transactional
    public void createForUser(User user, String title, String message,
            NotificationType type, String refType, Long refId) {

        Notification n = Notification.builder()
            .user(user)
            .title(title)
            .message(message)
            .type(type)
            .referenceType(refType)
            .referenceId(refId)
            .isRead(false)
            .build();

        notificationRepository.save(n);
    }

    // ----------------------------------------------------------------
    // Broadcast to all ADMIN + SUPER_ADMIN users
    // ----------------------------------------------------------------
    @Async
    @Transactional
    public void broadcastToAdmins(String title, String message,
            NotificationType type, String refType, Long refId) {

        List<User> admins = userRepository.findAll().stream()
            .filter(u -> u.getRole() == UserRole.ADMIN || u.getRole() == UserRole.SUPER_ADMIN)
            .toList();

        admins.forEach(admin -> {
            Notification n = Notification.builder()
                .user(admin)
                .title(title)
                .message(message)
                .type(type)
                .referenceType(refType)
                .referenceId(refId)
                .isRead(false)
                .build();
            notificationRepository.save(n);
        });
    }

    // ----------------------------------------------------------------
    // Read
    // ----------------------------------------------------------------
    @Transactional(readOnly = true)
    public PageResponse<NotificationDto> getMyNotifications(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Notification> result = notificationRepository
            .findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return new PageResponse<>(result.map(this::toDto));
    }

    @Transactional(readOnly = true)
    public NotificationCountDto getUnreadCount(Long userId) {
        long count = notificationRepository.countByUserIdAndIsReadFalse(userId);
        return new NotificationCountDto(count);
    }

    // ----------------------------------------------------------------
    // Mark read
    // ----------------------------------------------------------------
    @Transactional
    public void markOneAsRead(Long notifId, Long userId) {
        int updated = notificationRepository.markOneRead(notifId, userId);
        if (updated == 0) {
            throw new ResourceNotFoundException("Notification not found or already read");
        }
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllReadForUser(userId);
    }

    // ----------------------------------------------------------------
    // Mapper
    // ----------------------------------------------------------------
    private NotificationDto toDto(Notification n) {
        return NotificationDto.builder()
            .id(n.getId())
            .title(n.getTitle())
            .message(n.getMessage())
            .type(n.getType())
            .referenceType(n.getReferenceType())
            .referenceId(n.getReferenceId())
            .isRead(n.getIsRead())
            .readAt(n.getReadAt())
            .createdAt(n.getCreatedAt())
            .build();
    }
}
