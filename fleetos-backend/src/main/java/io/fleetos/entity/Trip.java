package io.fleetos.entity;

import io.fleetos.entity.base.BaseEntity;
import io.fleetos.enums.TripStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "trips",
       indexes = {
           @Index(name = "idx_trips_vehicle_id", columnList = "vehicle_id"),
           @Index(name = "idx_trips_driver_id",  columnList = "driver_id"),
           @Index(name = "idx_trips_status",     columnList = "status"),
           @Index(name = "idx_trips_started_at", columnList = "started_at"),
           @Index(name = "idx_trips_created_at", columnList = "created_at")
       })
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip extends BaseEntity {

    @Column(name = "uuid", nullable = false, unique = true, length = 36)
    private String uuid;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "driver_id", nullable = false)
    private User driver;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private TripStatus status = TripStatus.PENDING;

    @Column(name = "origin", nullable = false, length = 255)
    private String origin;

    @Column(name = "destination", nullable = false, length = 255)
    private String destination;

    @Column(name = "origin_lat", precision = 10, scale = 7)
    private BigDecimal originLat;

    @Column(name = "origin_lng", precision = 10, scale = 7)
    private BigDecimal originLng;

    @Column(name = "dest_lat", precision = 10, scale = 7)
    private BigDecimal destLat;

    @Column(name = "dest_lng", precision = 10, scale = 7)
    private BigDecimal destLng;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "odometer_start", precision = 10, scale = 2)
    private BigDecimal odometerStart;

    @Column(name = "odometer_end", precision = 10, scale = 2)
    private BigDecimal odometerEnd;

    @Column(name = "fuel_used_liters", precision = 8, scale = 2)
    private BigDecimal fuelUsedLiters;

    @Column(name = "cargo_description", length = 500)
    private String cargoDescription;

    @Column(name = "cargo_weight_tons", precision = 6, scale = 2)
    private BigDecimal cargoWeightTons;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "cancelled_reason", length = 500)
    private String cancelledReason;

    @PrePersist
    public void prePersist() {
        if (uuid == null) {
            uuid = java.util.UUID.randomUUID().toString();
        }
    }

    public BigDecimal getDistanceKm() {
        if (odometerEnd != null && odometerStart != null) {
            return odometerEnd.subtract(odometerStart);
        }
        return null;
    }

    public long getDurationMinutes() {
        if (startedAt != null && endedAt != null) {
            return java.time.Duration.between(startedAt, endedAt).toMinutes();
        }
        return 0;
    }
}
