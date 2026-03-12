package io.fleetos.repository;

import io.fleetos.entity.Vehicle;
import io.fleetos.enums.VehicleStatus;
import io.fleetos.enums.VehicleType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    Optional<Vehicle> findByUuidAndDeletedAtIsNull(String uuid);

    Optional<Vehicle> findByIdAndDeletedAtIsNull(Long id);

    boolean existsByPlateNumberAndDeletedAtIsNull(String plateNumber);

    long countByStatusAndDeletedAtIsNull(VehicleStatus status);

    long countByDeletedAtIsNull();

    @Query("""
        SELECT v FROM Vehicle v
        WHERE v.deletedAt IS NULL
          AND (:search IS NULL
               OR LOWER(v.plateNumber) LIKE LOWER(CONCAT('%',:search,'%'))
               OR LOWER(v.make)        LIKE LOWER(CONCAT('%',:search,'%'))
               OR LOWER(v.model)       LIKE LOWER(CONCAT('%',:search,'%')))
          AND (:status      IS NULL OR v.status      = :status)
          AND (:vehicleType IS NULL OR v.vehicleType = :vehicleType)
        ORDER BY v.createdAt DESC
        """)
    Page<Vehicle> searchVehicles(
        @Param("search")      String search,
        @Param("status")      VehicleStatus status,
        @Param("vehicleType") VehicleType vehicleType,
        Pageable pageable
    );

    @Query("SELECT v FROM Vehicle v WHERE v.deletedAt IS NULL ORDER BY v.createdAt DESC")
    List<Vehicle> findAllActive();

    @Query("""
        SELECT v FROM Vehicle v
        WHERE v.deletedAt IS NULL
          AND v.status = 'AVAILABLE'
        ORDER BY v.plateNumber
        """)
    List<Vehicle> findAvailableVehicles();
}
