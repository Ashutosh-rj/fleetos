package io.fleetos.repository;

import io.fleetos.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    long countByUserIdAndIsReadFalse(Long userId);

    @Modifying
    @Transactional
    @Query("""
        UPDATE Notification n
        SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP
        WHERE n.user.id = :userId AND n.isRead = false
        """)
    int markAllReadForUser(@Param("userId") Long userId);

    @Modifying
    @Transactional
    @Query("""
        UPDATE Notification n
        SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP
        WHERE n.id = :id AND n.user.id = :userId
        """)
    int markOneRead(@Param("id") Long id, @Param("userId") Long userId);
}
