package io.fleetos.repository;

import io.fleetos.entity.User;
import io.fleetos.enums.UserRole;
import io.fleetos.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUuid(String uuid);

    boolean existsByEmail(String email);

    long countByRole(UserRole role);

    long countByStatus(UserStatus status);

    @Query("""
        SELECT u FROM User u
        WHERE (:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:role IS NULL OR u.role = :role)
          AND (:status IS NULL OR u.status = :status)
        ORDER BY u.createdAt DESC
        """)
    Page<User> searchUsers(
        @Param("search") String search,
        @Param("role")   UserRole role,
        @Param("status") UserStatus status,
        Pageable pageable
    );
}
