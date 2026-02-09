package com.example.RiskScoreService.controller;

import com.example.RiskScoreService.client.PortfolioClient;
import com.example.RiskScoreService.entity.RiskScore;
import com.example.RiskScoreService.repositiory.RiskScoreRepositiory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/risk-scores")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.OPTIONS},
        allowCredentials = "true"
)
public class RiskScoreController {

    @Autowired
    private RiskScoreRepositiory riskScoreRepository;

    @Autowired
    private PortfolioClient portfolioClient;

    /**
     * Calculate/Save risk score for a given portfolioId.
     * - Validates that portfolio exists by calling Portfolio Service (Feign + Eureka).
     * - Upsert behavior: if risk score already exists for portfolioId, update same row.
     */
    @PostMapping("/calculate/{portfolioId}")
    public ResponseEntity<?> saveRiskScore(@PathVariable Long portfolioId,
                                           @RequestBody RiskScore riskScore) {

        // 1) Validate portfolio exists (service-to-service, no DB sharing)
        PortfolioClient.PortfolioDto portfolio;
        try {
            portfolio = portfolioClient.getPortfolioById(portfolioId);
        } catch (Exception ex) {
            // If Feign gets 404 or cannot reach portfolio-service, treat as not found / bad request
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Portfolio not found for id: " + portfolioId);
        }

        if (portfolio == null || portfolio.getPortfolioId() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Portfolio not found for id: " + portfolioId);
        }

        // 2) Set required fields for RiskScore
        riskScore.setPortfolioId(portfolioId);
        riskScore.setCalculationDate(LocalDate.now());

        // 3) Upsert: if already exists for this portfolio, update the same row
        riskScoreRepository.findByPortfolioId(portfolioId)
                .ifPresent(existing -> riskScore.setRiskId(existing.getRiskId()));

        // 4) Save and return
        RiskScore savedScore = riskScoreRepository.save(riskScore);
        return ResponseEntity.ok(savedScore);
    }
    @GetMapping("/portfolio/{portfolioId}")
    public ResponseEntity<RiskScore> getScoreByPortfolio(@PathVariable Long portfolioId) {
        return riskScoreRepository.findByPortfolioId(portfolioId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}