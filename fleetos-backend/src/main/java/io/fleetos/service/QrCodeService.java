package io.fleetos.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import io.fleetos.entity.Vehicle;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.EnumMap;
import java.util.Map;

@Service
@Slf4j
public class QrCodeService {

    @Value("${qr.base-url:http://localhost:3000}")
    private String baseUrl;

    @Value("${qr.output-dir:/app/static/qr}")
    private String outputDir;

    private static final int QR_SIZE = 300;

    public String generateVehicleQr(Vehicle vehicle) {
        try {
            String content = baseUrl + "/vehicles/" + vehicle.getUuid();
            String filename = "vehicle-" + vehicle.getUuid() + ".png";
            Path outputPath = Paths.get(outputDir, filename);
            Files.createDirectories(outputPath.getParent());

            Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.MARGIN, 2);

            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(content, BarcodeFormat.QR_CODE, QR_SIZE, QR_SIZE, hints);
            MatrixToImageWriter.writeToPath(matrix, "PNG", outputPath);

            log.info("QR code generated for vehicle {}: {}", vehicle.getId(), outputPath);
            return "/static/qr/" + filename;

        } catch (Exception e) {
            log.error("Failed to generate QR code for vehicle {}: {}", vehicle.getId(), e.getMessage());
            return null;
        }
    }
}
