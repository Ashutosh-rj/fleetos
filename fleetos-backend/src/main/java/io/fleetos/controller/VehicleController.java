package io.fleetos.controller;

import io.fleetos.dto.request.vehicle.*;
import io.fleetos.dto.response.ApiResponse;
import io.fleetos.dto.response.PageResponse;
import io.fleetos.dto.response.vehicle.VehicleDto;
import io.fleetos.enums.VehicleStatus;
import io.fleetos.enums.VehicleType;
import io.fleetos.service.ReportService;
import io.fleetos.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;
    private final ReportService  reportService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<VehicleDto>>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) VehicleStatus status,
            @RequestParam(required = false) VehicleType vehicleType,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.success(
            vehicleService.searchVehicles(search, status, vehicleType, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.getVehicleById(id)));
    }

    @GetMapping("/uuid/{uuid}")
    public ResponseEntity<ApiResponse<VehicleDto>> getByUuid(@PathVariable String uuid) {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.getVehicleByUuid(uuid)));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<VehicleDto>>> getAvailable() {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.getAvailableVehicles()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<VehicleDto>> create(
            @Valid @RequestBody CreateVehicleRequest req) {
        VehicleDto dto = vehicleService.createVehicle(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Vehicle created", dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<VehicleDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateVehicleRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Vehicle updated", vehicleService.updateVehicle(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle deleted"));
    }

    // ----------------------------------------------------------------
    // QR Code
    // ----------------------------------------------------------------
    @PostMapping("/{id}/qr")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<String>> regenerateQr(@PathVariable Long id) {
        String qrUrl = vehicleService.regenerateQrCode(id);
        return ResponseEntity.ok(ApiResponse.success("QR code regenerated", qrUrl));
    }

    // ----------------------------------------------------------------
    // Excel Export
    // ----------------------------------------------------------------
    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<byte[]> exportExcel() {
        byte[] bytes = reportService.generateVehicleExcel();
        String filename = "fleet-export-"
            + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmm")) + ".xlsx";
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(bytes);
    }
}
