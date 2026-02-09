package com.example.ComplianceReportService.controller;

import com.example.ComplianceReportService.client.PortfolioClient;
import com.example.ComplianceReportService.entity.ComplianceReport;
import com.example.ComplianceReportService.repositiory.ComplianceReportRepositiory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/compliance")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*")
public class ComplianceReportController {

    @Autowired
    private ComplianceReportRepositiory logRepository;

    @Autowired
    private PortfolioClient portfolioClient;

    @PostMapping("/logs/create")
    public ResponseEntity<?> createLog(@RequestBody ComplianceReport log) {

        // 1) Basic validation
        if (log.getPortfolioId() == null) {
            return ResponseEntity.badRequest().body("portfolioId is required");
        }

        // 2) Validate portfolioId exists using PortfolioClient (service-to-service call)
        //    This ensures you don’t create compliance logs for a non-existing portfolio.
        try {
            PortfolioClient.PortfolioDto portfolio = portfolioClient.getPortfolioById(log.getPortfolioId());
            if (portfolio == null || portfolio.getPortfolioId() == null) {
                return ResponseEntity.badRequest().body("Invalid portfolioId: " + log.getPortfolioId());
            }
        } catch (Exception ex) {
            // Feign throws exceptions for 404 or connection issues.
            return ResponseEntity.badRequest().body("Portfolio service validation failed for portfolioId: " + log.getPortfolioId());
        }

        // 3) Defaults
        if (log.getDate() == null) {
            log.setDate(LocalDate.now());
        }
        if (log.getStatus() == null || log.getStatus().trim().isEmpty()) {
            log.setStatus("BREACH");
        }
        if (log.getRegulationType() == null || log.getRegulationType().trim().isEmpty()) {
            log.setRegulationType("Exposure Limit Policy");
        }
        if (log.getFindings() == null || log.getFindings().trim().isEmpty()) {
            log.setFindings("Automatic compliance audit log created.");
        }

        // 4) Save
        ComplianceReport saved = logRepository.save(log);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/logs/all")
    public List<ComplianceReport> getAllLogs() {
        return logRepository.findAll();
    }

    @GetMapping("/logs/portfolio/{portfolioId}")
    public List<ComplianceReport> getLogsByPortfolio(@PathVariable Long portfolioId) {
        return logRepository.findByPortfolioId(portfolioId);
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getComplianceStats() {
        List<ComplianceReport> allLogs = logRepository.findAll();

        long totalLogs = allLogs.size();
        long compliantCount = allLogs.stream()
                .filter(log -> "COMPLIANT".equalsIgnoreCase(log.getStatus()))
                .count();

        long nonCompliantCount = allLogs.stream()
                .filter(log -> "BREACH".equalsIgnoreCase(log.getStatus())
                        || "NON-COMPLIANT".equalsIgnoreCase(log.getStatus()))
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalLogs", totalLogs);
        stats.put("compliantCount", compliantCount);
        stats.put("nonCompliantCount", nonCompliantCount);

        return ResponseEntity.ok(stats);
    }

    @DeleteMapping("/logs/{logId}")
    public ResponseEntity<?> deleteLog(@PathVariable Long logId) {
        return logRepository.findById(logId)
                .map(log -> {
                    logRepository.delete(log);
                    return ResponseEntity.ok().body("Log with ID " + logId + " deleted successfully.");
                })
                .orElse(ResponseEntity.notFound().build());
    }
}