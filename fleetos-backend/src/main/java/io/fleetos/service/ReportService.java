package io.fleetos.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import io.fleetos.entity.Trip;
import io.fleetos.entity.Vehicle;
import io.fleetos.enums.TripStatus;
import io.fleetos.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final VehicleService vehicleService;
    private final TripRepository tripRepository;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm");
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");

    // ----------------------------------------------------------------
    // PDF fleet report
    // ----------------------------------------------------------------
    @Transactional(readOnly = true)
    public byte[] generateFleetPdf() {
        List<Vehicle> vehicles = vehicleService.getAllActiveForExport();

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4.rotate(), 36f, 36f, 54f, 36f);
            PdfWriter.getInstance(doc, baos);
            doc.open();

            // ---- Header ----
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.WHITE);
            Font bodyFont  = FontFactory.getFont(FontFactory.HELVETICA, 9);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);

            PdfPTable titleBand = new PdfPTable(1);
            titleBand.setWidthPercentage(100);
            PdfPCell titleCell = new PdfPCell(new Phrase("FleetOS – Vehicle Fleet Report", titleFont));
            titleCell.setBackgroundColor(new Color(15, 23, 42));
            titleCell.setPadding(14f);
            titleCell.setBorder(Rectangle.NO_BORDER);
            titleBand.addCell(titleCell);
            doc.add(titleBand);

            doc.add(new Paragraph(" "));
            Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);
            doc.add(new Paragraph("Generated: " + LocalDateTime.now().format(FMT), subFont));
            doc.add(new Paragraph("Total Vehicles: " + vehicles.size(), subFont));
            doc.add(new Paragraph(" "));

            // ---- Table ----
            float[] colWidths = {14f, 12f, 16f, 8f, 10f, 12f, 10f, 12f, 12f};
            PdfPTable table = new PdfPTable(colWidths.length);
            table.setWidthPercentage(100);
            table.setWidths(colWidths);

            String[] headers = {"Plate", "Type", "Make / Model", "Year",
                "Status", "Fuel", "Odometer (km)", "Reg. Expiry", "Ins. Expiry"};

            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
                cell.setBackgroundColor(new Color(30, 64, 175));
                cell.setPadding(6f);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            boolean alternate = false;
            for (Vehicle v : vehicles) {
                Color rowColor = alternate ? new Color(239, 246, 255) : Color.WHITE;
                alternate = !alternate;

                addPdfCell(table, v.getPlateNumber(),                                     rowColor, bodyFont);
                addPdfCell(table, v.getVehicleType().name(),                              rowColor, bodyFont);
                addPdfCell(table, v.getMake() + " " + v.getModel(),                      rowColor, bodyFont);
                addPdfCell(table, String.valueOf(v.getYear()),                            rowColor, bodyFont);
                addPdfCell(table, v.getStatus().name(),                                   rowColor, bodyFont);
                addPdfCell(table, v.getFuelType().name(),                                 rowColor, bodyFont);
                addPdfCell(table, v.getOdometerKm().toPlainString(),                      rowColor, bodyFont);
                addPdfCell(table, v.getRegistrationExpiry() != null
                    ? v.getRegistrationExpiry().format(DATE_FMT) : "—",               rowColor, bodyFont);
                addPdfCell(table, v.getInsuranceExpiry() != null
                    ? v.getInsuranceExpiry().format(DATE_FMT) : "—",                  rowColor, bodyFont);
            }

            doc.add(table);
            doc.close();
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("PDF generation failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }

    private void addPdfCell(PdfPTable table, String text, Color bg, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bg);
        cell.setPadding(5f);
        table.addCell(cell);
    }

    // ----------------------------------------------------------------
    // Excel vehicle export
    // ----------------------------------------------------------------
    @Transactional(readOnly = true)
    public byte[] generateVehicleExcel() {
        List<Vehicle> vehicles = vehicleService.getAllActiveForExport();

        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Fleet");

            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font hFont = workbook.createFont();
            hFont.setBold(true);
            hFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(hFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // Alternating row style
            CellStyle altStyle = workbook.createCellStyle();
            altStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
            altStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            String[] cols = {"Plate Number","Make","Model","Year","Color","VIN",
                "Fuel Type","Vehicle Type","Status","Odometer (km)",
                "Capacity (tons)","Registration Expiry","Insurance Expiry","Notes"};

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < cols.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(cols[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 5000);
            }

            int rowNum = 1;
            for (Vehicle v : vehicles) {
                Row row = sheet.createRow(rowNum);
                if (rowNum % 2 == 0) {
                    for (int i = 0; i < cols.length; i++) row.createCell(i).setCellStyle(altStyle);
                }
                row.createCell(0).setCellValue(v.getPlateNumber());
                row.createCell(1).setCellValue(v.getMake());
                row.createCell(2).setCellValue(v.getModel());
                row.createCell(3).setCellValue(v.getYear());
                row.createCell(4).setCellValue(v.getColor() != null ? v.getColor() : "");
                row.createCell(5).setCellValue(v.getVin() != null ? v.getVin() : "");
                row.createCell(6).setCellValue(v.getFuelType().name());
                row.createCell(7).setCellValue(v.getVehicleType().name());
                row.createCell(8).setCellValue(v.getStatus().name());
                row.createCell(9).setCellValue(v.getOdometerKm().doubleValue());
                row.createCell(10).setCellValue(v.getCapacityTons() != null
                    ? v.getCapacityTons().doubleValue() : 0);
                row.createCell(11).setCellValue(v.getRegistrationExpiry() != null
                    ? v.getRegistrationExpiry().toString() : "");
                row.createCell(12).setCellValue(v.getInsuranceExpiry() != null
                    ? v.getInsuranceExpiry().toString() : "");
                row.createCell(13).setCellValue(v.getNotes() != null ? v.getNotes() : "");
                rowNum++;
            }

            workbook.write(baos);
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Excel generation failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate Excel report", e);
        }
    }
}
