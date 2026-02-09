package com.example.PortfolioService.controller;

import com.example.PortfolioService.client.InvestorClient;
import com.example.PortfolioService.entity.Portfolio;
import com.example.PortfolioService.repositiory.PortfolioRepositiory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/portfolios")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.OPTIONS},
        allowCredentials = "true"
)
public class PortfolioController {

    @Autowired
    private PortfolioRepositiory portfolioRepository;

    @Autowired
    private InvestorClient investorClient;

    @GetMapping("/all")
    public List<Portfolio> getAllPortfolios() {
        return portfolioRepository.findAll();
    }

    @PostMapping("/submit/{investorId}")
    public ResponseEntity<?> submitPortfolio(@PathVariable Long investorId, @RequestBody Portfolio portfolioData) {

        // Validate investor exists using Investor microservice
        try {
            InvestorClient.InvestorDto investor = investorClient.getInvestorById(investorId);
            if (investor == null || investor.getInvestorId() == null) {
                return ResponseEntity.badRequest().body("Error: Investor not found with ID: " + investorId);
            }
        } catch (Exception e) {
            // If Feign can't reach investor-service OR endpoint path mismatch OR 404
            return ResponseEntity.status(502).body(
                    "Error: Cannot validate investorId " + investorId +
                            " (investor-service unreachable / wrong endpoint mapping / investor does not exist)"
            );
        }

        // store investorId locally (no JPA Investor object)
        portfolioData.setInvestorId(investorId);
        portfolioData.setStatus(Portfolio.Status.Pending);
        portfolioData.setRequestDate(LocalDate.now());

        Portfolio saved = portfolioRepository.save(portfolioData);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/investor/{investorId}")
    public List<Portfolio> getInvestorPortfolios(@PathVariable Long investorId) {
        return portfolioRepository.findByInvestorId(investorId);
    }

    @PatchMapping("/update-status/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam Portfolio.Status status) {
        Optional<Portfolio> portfolioOpt = portfolioRepository.findById(id);

        if (portfolioOpt.isPresent()) {
            Portfolio existing = portfolioOpt.get();
            existing.setStatus(status);
            return ResponseEntity.ok(portfolioRepository.save(existing));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updatePortfolio(@PathVariable Long id, @RequestBody Portfolio updatedData) {
        Optional<Portfolio> portfolioOpt = portfolioRepository.findById(id);

        if (portfolioOpt.isPresent()) {
            Portfolio existing = portfolioOpt.get();

            existing.setPortfolioName(updatedData.getPortfolioName());
            existing.setInvestedAmount(updatedData.getInvestedAmount());
            existing.setRegulationType(updatedData.getRegulationType());

            existing.setEquityPercentage(updatedData.getEquityPercentage());
            existing.setBondPercentage(updatedData.getBondPercentage());
            existing.setDerivativePercentage(updatedData.getDerivativePercentage());

            existing.setQuantity(updatedData.getQuantity());
            existing.setStatus(Portfolio.Status.Approved);

            Portfolio saved = portfolioRepository.save(existing);
            return ResponseEntity.ok(saved);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/resubmit/{id}")
    public ResponseEntity<?> resubmitPortfolio(@PathVariable Long id, @RequestBody Portfolio updatedData) {
        return portfolioRepository.findById(id).map(existing -> {

            existing.setPortfolioName(updatedData.getPortfolioName());
            existing.setInvestedAmount(updatedData.getInvestedAmount());
            existing.setRegulationType(updatedData.getRegulationType());

            existing.setStatus(Portfolio.Status.Pending);
            existing.setRequestDate(LocalDate.now());

            Portfolio saved = portfolioRepository.save(existing);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deletePortfolio(@PathVariable Long id) {
        if (portfolioRepository.existsById(id)) {
            portfolioRepository.deleteById(id);
            return ResponseEntity.ok("Portfolio PF-" + id + " deleted successfully.");
        }
        return ResponseEntity.notFound().build();
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getPortfolioById(@PathVariable Long id) {
        return portfolioRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}