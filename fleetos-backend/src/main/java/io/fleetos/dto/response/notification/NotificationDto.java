package io.fleetos.dto.response.notification;

import io.fleetos.enums.NotificationType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class NotificationDto {
    private Long             id;
    private String           title;
    private String           message;
    private NotificationType type;
    private String           referenceType;
    private Long             referenceId;
    private Boolean          isRead;
    private LocalDateTime    readAt;
    private LocalDateTime    createdAt;
}
