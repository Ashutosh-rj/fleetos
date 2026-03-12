package io.fleetos.dto.request.trip;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class EndTripRequest {
    @DecimalMin("0")
    private BigDecimal odometerEnd;
    @DecimalMin("0")
    private BigDecimal fuelUsedLiters;
    @Size(max=2000)
    private String notes;
}
