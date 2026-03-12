package io.fleetos.dto.response.dashboard;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class DashboardStatsDto {
    private long   totalVehicles;
    private long   availableVehicles;
    private long   vehiclesInUse;
    private long   vehiclesInMaintenance;
    private long   totalTrips;
    private long   activeTrips;
    private long   completedTrips;
    private long   totalDrivers;
    private long   totalAdmins;
    private double totalDistanceKm;
    private long   tripsThisMonth;
    private long   tripsThisWeek;
}
