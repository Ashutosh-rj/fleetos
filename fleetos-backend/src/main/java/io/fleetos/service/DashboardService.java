package io.fleetos.service;

import io.fleetos.dto.response.dashboard.DashboardStatsDto;
import io.fleetos.dto.response.dashboard.RecentActivityDto;
import io.fleetos.dto.response.trip.TripDto;
import io.fleetos.enums.TripStatus;
import io.fleetos.enums.UserRole;
import io.fleetos.enums.VehicleStatus;
import io.fleetos.repository.TripRepository;
import io.fleetos.repository.UserRepository;
import io.fleetos.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final VehicleRepository vehicleRepository;
    private final TripRepository    tripRepository;
    private final UserRepository    userRepository;
    private final TripService       tripService;

    @Transactional(readOnly = true)
    public DashboardStatsDto getStats() {
        LocalDateTime now       = LocalDateTime.now();
        LocalDateTime monthStart = now.withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS);
        LocalDateTime weekStart  = now.minusDays(now.getDayOfWeek().getValue() - 1L)
                                      .truncatedTo(ChronoUnit.DAYS);

        return DashboardStatsDto.builder()
            .totalVehicles(vehicleRepository.countByDeletedAtIsNull())
            .availableVehicles(vehicleRepository.countByStatusAndDeletedAtIsNull(VehicleStatus.AVAILABLE))
            .vehiclesInUse(vehicleRepository.countByStatusAndDeletedAtIsNull(VehicleStatus.IN_USE))
            .vehiclesInMaintenance(vehicleRepository.countByStatusAndDeletedAtIsNull(VehicleStatus.MAINTENANCE))
            .totalTrips(tripRepository.count())
            .activeTrips(tripRepository.countByStatus(TripStatus.IN_PROGRESS))
            .completedTrips(tripRepository.countByStatus(TripStatus.COMPLETED))
            .totalDrivers(userRepository.countByRole(UserRole.USER))
            .totalAdmins(userRepository.countByRole(UserRole.ADMIN))
            .totalDistanceKm(
                firstNonNull(tripRepository.sumTotalDistanceKm(), 0.0))
            .tripsThisMonth(tripRepository.countCompletedBetween(monthStart, now))
            .tripsThisWeek(tripRepository.countCompletedBetween(weekStart, now))
            .build();
    }

    @Transactional(readOnly = true)
    public List<RecentActivityDto> getRecentActivity() {
        return tripService.getRecentTrips().stream()
            .map(trip -> RecentActivityDto.builder()
                .type(trip.getStatus().name())
                .description(buildTripDescription(trip))
                .actor(trip.getDriver().getFullName())
                .referenceId(trip.getUuid())
                .timestamp(
                    trip.getEndedAt() != null ? trip.getEndedAt() : trip.getStartedAt())
                .build())
            .toList();
    }

    private String buildTripDescription(TripDto trip) {
        return switch (trip.getStatus()) {
            case COMPLETED  -> "Trip completed: " + trip.getOrigin() + " → " + trip.getDestination()
                + (trip.getDistanceKm() != null ? " (" + trip.getDistanceKm() + " km)" : "");
            case IN_PROGRESS -> "Trip in progress: " + trip.getOrigin() + " → " + trip.getDestination();
            case CANCELLED   -> "Trip cancelled: " + trip.getOrigin() + " → " + trip.getDestination();
            default          -> trip.getOrigin() + " → " + trip.getDestination();
        };
    }

    private <T> T firstNonNull(T value, T fallback) {
        return value != null ? value : fallback;
    }
}
