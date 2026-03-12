package io.fleetos.repository;

import io.fleetos.entity.Trip;
import io.fleetos.enums.TripStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    Optional<Trip> findByUuid(String uuid);

    long countByStatus(TripStatus status);

    boolean existsByVehicleIdAndStatus(Long vehicleId, TripStatus status);

    boolean existsByDriverIdAndStatus(Long driverId, TripStatus status);

    @Query("""
        SELECT t FROM Trip t
        JOIN FETCH t.vehicle
        JOIN FETCH t.driver
        WHERE (:vehicleId IS NULL OR t.vehicle.id = :vehicleId)
          AND (:driverId  IS NULL OR t.driver.id  = :driverId)
          AND (:status    IS NULL OR t.status      = :status)
          AND (:from      IS NULL OR t.createdAt  >= :from)
          AND (:to        IS NULL OR t.createdAt  <= :to)
        ORDER BY t.createdAt DESC
        """)
    Page<Trip> searchTrips(
        @Param("vehicleId") Long vehicleId,
        @Param("driverId")  Long driverId,
        @Param("status")    TripStatus status,
        @Param("from")      LocalDateTime from,
        @Param("to")        LocalDateTime to,
        Pageable pageable
    );

    @Query("""
        SELECT t FROM Trip t
        JOIN FETCH t.vehicle
        JOIN FETCH t.driver
        WHERE t.status IN ('IN_PROGRESS', 'PENDING')
        ORDER BY t.createdAt DESC
        """)
    List<Trip> findActiveTrips();

    @Query("""
        SELECT t FROM Trip t
        JOIN FETCH t.vehicle
        JOIN FETCH t.driver
        ORDER BY t.createdAt DESC
        LIMIT 10
        """)
    List<Trip> findRecentTrips();

    @Query("""
        SELECT COALESCE(SUM(t.odometerEnd - t.odometerStart), 0)
        FROM Trip t
        WHERE t.status = 'COMPLETED'
          AND t.odometerEnd IS NOT NULL
          AND t.odometerStart IS NOT NULL
        """)
    Double sumTotalDistanceKm();

    @Query("""
        SELECT COUNT(t) FROM Trip t
        WHERE t.status = 'COMPLETED'
          AND t.startedAt >= :from
          AND t.startedAt <= :to
        """)
    long countCompletedBetween(
        @Param("from") LocalDateTime from,
        @Param("to")   LocalDateTime to
    );
}
