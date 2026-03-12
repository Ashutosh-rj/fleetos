package io.fleetos.dto.response.notification;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data @AllArgsConstructor
public class NotificationCountDto {
    private long unreadCount;
}
