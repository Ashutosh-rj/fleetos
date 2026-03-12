package io.fleetos.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    private boolean             success;
    private int                 status;
    private String              error;
    private String              message;
    private Map<String, String> fieldErrors;
    private String              timestamp;
}
