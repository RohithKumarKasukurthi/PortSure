package com.example.PortfolioService.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Calls investor-service via Eureka discovery.
 *
 * IMPORTANT: Path must match Investor Service controller mappings.
 * Based on your working URL: /investors/getAllInvestors (no /api),
 * we use /investors/{id} here.
 */
@FeignClient(name = "investor-service")
public interface InvestorClient {

    @GetMapping("/api/investors/{id}")
    InvestorDto getInvestorById(@PathVariable("id") Long id);

    class InvestorDto {
        private Long investorId;
        private String fullName;
        private String email;
        private String phoneNumber;

        public Long getInvestorId() { return investorId; }
        public void setInvestorId(Long investorId) { this.investorId = investorId; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    }
}