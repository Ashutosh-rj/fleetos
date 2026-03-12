package io.fleetos.controller;

import io.fleetos.dto.response.ApiResponse;
import io.fleetos.dto.response.PageResponse;
import io.fleetos.dto.response.notification.NotificationCountDto;
import io.fleetos.dto.response.notification.NotificationDto;
import io.fleetos.security.SecurityUtils;
import io.fleetos.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final SecurityUtils       securityUtils;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<NotificationDto>>> list(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
            notificationService.getMyNotifications(userId, page, size)));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<NotificationCountDto>> count() {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
            notificationService.getUnreadCount(userId)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markOneRead(@PathVariable Long id) {
        Long userId = securityUtils.getCurrentUserId();
        notificationService.markOneAsRead(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead() {
        Long userId = securityUtils.getCurrentUserId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }
}
