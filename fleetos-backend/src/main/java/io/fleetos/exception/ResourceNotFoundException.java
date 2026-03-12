package io.fleetos.exception;
import org.springframework.http.HttpStatus;
public class ResourceNotFoundException extends ApiException {
    public ResourceNotFoundException(String message) { super(message, HttpStatus.NOT_FOUND); }
    public ResourceNotFoundException(String entity, Long id) { super(entity + " not found with id: " + id, HttpStatus.NOT_FOUND); }
}