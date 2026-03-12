package io.fleetos.repository;

import io.fleetos.entity.OtpToken;
import io.fleetos.enums.OtpType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {

    Optional<OtpToken> findByTokenAndTypeAndUsedFalse(String token, OtpType type);

    @Query("""
        SELECT o FROM OtpToken o
        WHERE o.user.id = :userId
          AND o.type = :type
          AND o.used = false
          AND o.expiresAt > :now
        ORDER BY o.createdAt DESC
        LIMIT 1
        """)
    Optional<OtpToken> findLatestValid(
        @Param("userId") Long userId,
        @Param("type")   OtpType type,
        @Param("now")    LocalDateTime now
    );

    @Modifying
    @Transactional
    @Query("DELETE FROM OtpToken o WHERE o.expiresAt < :cutoff")
    int deleteExpiredTokens(@Param("cutoff") LocalDateTime cutoff);
}
