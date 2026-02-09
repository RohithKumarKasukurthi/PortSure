package com.example.ExposureAlertService.controller;

import com.example.ExposureAlertService.client.PortfolioClient;
import com.example.ExposureAlertService.entity.ExposureAlert;
import com.example.ExposureAlertService.repositiory.ExposureAlertRepositiory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*")
public class ExposureAlertController {

    @Autowired
    private ExposureAlertRepositiory exposureAlertRepository;

    @Autowired
    private PortfolioClient portfolioClient;

    @PostMapping("/send/{portfolioId}")
    public ResponseEntity<?> createAlert(@PathVariable Long portfolioId,
                                         @RequestBody ExposureAlert alertRequest) {

        // 1) Basic request validation
        if (alertRequest.getInvestorId() == null) {
            return ResponseEntity.badRequest().body("investorId is required");
        }

        // 2) Validate portfolio exists via PortfolioClient (service-to-service call)
        try {
            PortfolioClient.PortfolioDto portfolio = portfolioClient.getPortfolioById(portfolioId);
            if (portfolio == null || portfolio.getPortfolioId() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Invalid portfolioId: " + portfolioId);
            }
        } catch (Exception ex) {
            // Feign throws on 404 / connection errors
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Portfolio service validation failed for portfolioId: " + portfolioId);
        }

        // 3) Enrich & default values
        alertRequest.setPortfolioId(portfolioId);

        if (alertRequest.getTimestamp() == null) {
            alertRequest.setTimestamp(LocalDateTime.now());
        }

        // 4) Save
        ExposureAlert savedAlert = exposureAlertRepository.save(alertRequest);
        return ResponseEntity.ok(savedAlert);
    }

    @GetMapping("/portfolio/{portfolioId}")
    public ResponseEntity<List<ExposureAlert>> getAlertsByPortfolio(@PathVariable Long portfolioId) {
        return ResponseEntity.ok(
                exposureAlertRepository.findByPortfolioIdOrderByTimestampDesc(portfolioId)
        );
    }

    @GetMapping("/investor/{investorId}")
    public ResponseEntity<List<ExposureAlert>> getAlertsByInvestor(@PathVariable Long investorId) {
        return ResponseEntity.ok(
                exposureAlertRepository.findByInvestorIdOrderByTimestampDesc(investorId)
        );
    }

    @DeleteMapping("/delete/{alertId}")
    public ResponseEntity<?> deleteAlert(@PathVariable Long alertId) {
        if (exposureAlertRepository.existsById(alertId)) {
            exposureAlertRepository.deleteById(alertId);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}